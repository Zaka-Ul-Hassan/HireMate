// frontend/static/js/resume/resume_rag.js

// Get user-specific storage keys
function getUserId() {
    return localStorage.getItem('user_id') || 'default';
}

const STORAGE_KEY = `candidate_chat_history_${getUserId()}`;
const SESSION_KEY = `candidate_chat_session_id_${getUserId()}`;
const API_BASE_URL = 'http://127.0.0.1:8000/api/ai-rag';

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const exportChatBtn = document.getElementById('exportChatBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const typingIndicator = document.getElementById('typingIndicator');
const messageCountEl = document.getElementById('messageCount');
const candidateCountEl = document.getElementById('candidateCount');
const sessionTimeEl = document.getElementById('sessionTime');

// Session tracking
let sessionStartTime = Date.now();
let messageCount = 0;
let candidateCount = 0;

// Initialize chat on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAndClearOldSession();
    initializeChat();
    startSessionTimer();
    setupEventListeners();
});

// Check if this is a new session and clear old chat
function checkAndClearOldSession() {
    const currentSessionId = generateSessionId();
    const storedSessionId = localStorage.getItem(SESSION_KEY);
    
    // If no stored session or different session, clear chat
    if (!storedSessionId || storedSessionId !== currentSessionId) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(SESSION_KEY, currentSessionId);
    }
}

// Generate session ID based on login time
function generateSessionId() {
    // Use user login timestamp or current timestamp
    const userData = localStorage.getItem('user_data');
    const accessToken = localStorage.getItem('access_token');
    const userId = getUserId();
    
    if (userData && accessToken) {
        // Create session ID from user data and current date
        const user = JSON.parse(userData);
        const today = new Date().toDateString();
        return `${userId}_${today}_${accessToken.substring(0, 10)}`;
    }
    
    // Fallback to date-based session
    return `session_${userId}_${new Date().toDateString()}`;
}

function initializeChat() {
    loadChatHistory();
    
    // Send initial "hi" message if chat is empty
    const chatHistory = getChatHistory();
    if (chatHistory.length === 0) {
        showToast('Welcome! Let me help you find candidates.', 'success');
        setTimeout(() => {
            sendMessage('hi', true);
        }, 800);
    } else {
        updateStats();
        hideWelcomeBanner();
    }
}

function setupEventListeners() {
    // Send button
    sendBtn.addEventListener('click', () => sendMessage());
    
    // Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Clear chat
    clearChatBtn.addEventListener('click', clearChat);
    
    // Export chat
    exportChatBtn.addEventListener('click', exportChat);
    
    // Suggestion chips
    document.querySelectorAll('.suggestion-chip, .quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt');
            chatInput.value = prompt;
            chatInput.focus();
            // Auto-send after a brief moment
            setTimeout(() => sendMessage(), 200);
        });
    });
    
    // Input focus animation
    chatInput.addEventListener('focus', () => {
        chatInput.parentElement.classList.add('input-focused');
    });
    
    chatInput.addEventListener('blur', () => {
        chatInput.parentElement.classList.remove('input-focused');
    });

    // Voice button (placeholder)
    document.getElementById('voiceBtn')?.addEventListener('click', () => {
        showToast('Voice input coming soon!', 'info');
    });

    // Attach button (placeholder)
    document.getElementById('attachBtn')?.addEventListener('click', () => {
        showToast('File attachment coming soon!', 'info');
    });
}

// Toast notifications
function showToast(message, type = 'info') {
    const backgrounds = {
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };

    Toastify({
        text: message,
        duration: 4000,
        gravity: "top",
        position: "right",
        style: {
            background: backgrounds[type],
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            padding: "16px 24px",
            fontSize: "14px",
            fontWeight: "500"
        },
        stopOnFocus: true,
        offset: {
            x: 20,
            y: 80
        }
    }).showToast();
}

// Get chat history from localStorage
function getChatHistory() {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : [];
}

// Save chat history to localStorage
function saveChatHistory(history) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// Load chat history and display
function loadChatHistory() {
    const history = getChatHistory();
    
    if (history.length > 0) {
        // Clear welcome banner first
        hideWelcomeBanner();
    }
    
    history.forEach(msg => {
        appendMessage(msg.text, msg.isUser, false);
    });
    
    scrollToBottom();
}

// Hide welcome banner
function hideWelcomeBanner() {
    const welcomeBanner = document.querySelector('.welcome-banner');
    if (welcomeBanner) {
        welcomeBanner.style.display = 'none';
    }
}

// Send message
async function sendMessage(messageText = null, isInitial = false) {
    const message = messageText || chatInput.value.trim();
    
    if (!message) {
        showToast('Please enter a message', 'warning');
        return;
    }
    
    // Hide welcome banner on first message
    hideWelcomeBanner();
    
    // Clear input
    if (!messageText) {
        chatInput.value = '';
    }
    
    // Add user message to UI and storage (unless it's the initial "hi")
    if (!isInitial) {
        appendMessage(message, true, true);
        messageCount++;
        updateMessageCount();
    }
    
    // Show typing indicator
    showTypingIndicator(true);
    
    try {
        // Call API
        const response = await fetch(`${API_BASE_URL}/ask?prompt=${encodeURIComponent(message)}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Simulate typing delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (data.status && data.data) {
            // Count candidates in response
            const candidatesFound = (data.data.match(/-/g) || []).length;
            if (candidatesFound > 0) {
                candidateCount += candidatesFound;
                updateCandidateCount();
            }
            
            // Add bot response to UI and storage
            appendMessage(data.data, false, true);
            messageCount++;
            updateMessageCount();
            
            // Show API message in toast
            if (data.message) {
                showToast(data.message, 'success');
            }
        } else {
            appendMessage('Sorry, I could not process your request. Please try again.', false, true);
            // Show error message from API if available
            const errorMsg = data.message || 'Failed to process request';
            showToast(errorMsg, 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        appendMessage('Error connecting to the server. Please check your connection and try again.', false, true);
        showToast('Connection error. Please try again.', 'error');
    } finally {
        showTypingIndicator(false);
    }
}

// Append message to chat
function appendMessage(text, isUser, saveToHistory = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Format bot messages (handle lists)
    if (!isUser && text.includes('\n-')) {
        const lines = text.split('\n');
        let formattedText = '';
        let candidatesList = [];
        
        lines.forEach(line => {
            if (line.trim().startsWith('-')) {
                const candidateName = line.trim().substring(1).trim();
                candidatesList.push(candidateName);
                formattedText += `
                    <div class="candidate-item">
                        <i class="bi bi-person-badge"></i>
                        <span>${candidateName}</span>
                    </div>`;
            } else if (line.trim()) {
                formattedText += `<div class="message-text">${line}</div>`;
            }
        });
        
        messageContent.innerHTML = formattedText;
        
        // Add copy button for candidates
        if (candidatesList.length > 0) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-candidates-btn';
            copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copy Names';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(candidatesList.join('\n'));
                showToast('Candidates copied to clipboard!', 'success');
            };
            messageContent.appendChild(copyBtn);
        }
    } else {
        messageContent.innerHTML = `<div class="message-text">${text}</div>`;
    }
    
    messageContent.appendChild(timestamp);
    
    // Add icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'message-icon';
    iconDiv.innerHTML = isUser 
        ? '<i class="bi bi-person-circle"></i>' 
        : '<i class="bi bi-robot"></i>';
    
    if (isUser) {
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(iconDiv);
    } else {
        messageDiv.appendChild(iconDiv);
        messageDiv.appendChild(messageContent);
    }
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    // Save to history
    if (saveToHistory) {
        const history = getChatHistory();
        history.push({ text, isUser, timestamp: new Date().toISOString() });
        saveChatHistory(history);
    }
}

// Show/hide typing indicator
function showTypingIndicator(show) {
    typingIndicator.style.display = show ? 'flex' : 'none';
    if (show) {
        scrollToBottom();
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Update stats
function updateMessageCount() {
    messageCountEl.textContent = messageCount;
}

function updateCandidateCount() {
    candidateCountEl.textContent = candidateCount;
}

function updateStats() {
    const history = getChatHistory();
    messageCount = history.length;
    
    // Count candidates from history
    candidateCount = 0;
    history.forEach(msg => {
        if (!msg.isUser && msg.text.includes('\n-')) {
            candidateCount += (msg.text.match(/-/g) || []).length;
        }
    });
    
    updateMessageCount();
    updateCandidateCount();
}

// Session timer
function startSessionTimer() {
    setInterval(() => {
        const minutes = Math.floor((Date.now() - sessionStartTime) / 60000);
        sessionTimeEl.textContent = minutes > 0 ? `${minutes}m` : 'Just now';
    }, 10000); // Update every 10 seconds
}

// Clear chat history with SweetAlert2 confirmation
function clearChat() {
    Swal.fire({
        title: 'Clear Chat History?',
        text: "All messages and candidate information will be permanently deleted. This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, clear it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup',
            confirmButton: 'swal-confirm-btn',
            cancelButton: 'swal-cancel-btn'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear chat history
            localStorage.removeItem(STORAGE_KEY);
            chatMessages.innerHTML = '';
            messageCount = 0;
            candidateCount = 0;
            updateStats();
            
            // Show success notification
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Chat history cleared successfully!',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                customClass: {
                    popup: 'swal-toast-popup'
                }
            });
            
            // Also show toastify notification
            showToast('Chat history cleared successfully!', 'success');
            
            // Reload page to show welcome banner again
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Show cancellation message
            showToast('Clear chat cancelled', 'info');
        }
    });
}

// Export chat
function exportChat() {
    const history = getChatHistory();
    
    if (history.length === 0) {
        showToast('No chat history to export', 'warning');
        return;
    }
    
    let exportText = '=== AI Candidate Finder Chat Export ===\n\n';
    exportText += `Exported: ${new Date().toLocaleString()}\n`;
    exportText += `Total Messages: ${history.length}\n`;
    exportText += `Candidates Found: ${candidateCount}\n\n`;
    exportText += '--- Chat History ---\n\n';
    
    history.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleString();
        const sender = msg.isUser ? 'You' : 'AI';
        exportText += `[${time}] ${sender}:\n${msg.text}\n\n`;
    });
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Chat exported successfully!', 'success');
}

// Clear chat on logout (listen for storage changes)
window.addEventListener('storage', (e) => {
    // If user_data or access_token is removed (logout), clear chat
    if ((e.key === 'user_data' || e.key === 'access_token') && e.newValue === null) {
        const userId = getUserId();
        localStorage.removeItem(`candidate_chat_history_${userId}`);
        localStorage.removeItem(`candidate_chat_session_id_${userId}`);
    }
});

// Clear chat when user navigates away and comes back (page visibility)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        checkAndClearOldSession();
    }
});