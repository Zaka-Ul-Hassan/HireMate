// frontend\static\js\dashboard\dashboard.js

// Protect dashboard - ensure user is authenticated
document.addEventListener("DOMContentLoaded", function () {
    // Check authentication
    protectPage();
    
    // Log user info for debugging
    const user = getCurrentUser();
    console.log('Current user:', user);
    console.log('User roles:', getUserRoles());

    // Initialize charts after DOM is loaded
    initializeCharts();
});

function initializeCharts() {
    // Modern color palette
    const colors = {
        primary: '#4f46e5',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#06b6d4',
        purple: '#8b5cf6',
        pink: '#ec4899'
    };

    // Applications Trend Chart with more details
    new Chart(document.getElementById('jobsChart'), {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October'],
            datasets: [{
                label: 'Applications Received',
                data: [45, 52, 68, 75, 85, 95, 110, 125, 145, 180],
                borderColor: colors.primary,
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: colors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: colors.primary,
                pointHoverBorderWidth: 3
            },
            {
                label: 'Shortlisted',
                data: [20, 25, 32, 38, 42, 48, 55, 62, 72, 85],
                borderColor: colors.success,
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: colors.success,
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: { 
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15,
                        font: { size: 12, weight: '500' },
                        color: '#6b7280'
                    }
                },
                tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#1f2937',
                    bodyColor: '#6b7280',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 15,
                    displayColors: true,
                    titleFont: { size: 13, weight: '600' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' candidates';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { 
                        color: '#f3f4f6', 
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: { 
                        color: '#9ca3af',
                        font: { size: 11 },
                        padding: 8,
                        callback: function(value) {
                            return value;
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: '#9ca3af',
                        font: { size: 11 },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 8
                    }
                }
            }
        }
    });

    // Skills Chart with more details
    new Chart(document.getElementById('skillsChart'), {
        type: 'bar',
        data: {
            labels: ['Python', 'React', 'Node.js', 'Cloud (AWS/Azure)', 'AI/ML', 'Cybersecurity', 'Docker', 'TypeScript'],
            datasets: [{
                label: 'Demand Percentage',
                data: [88, 82, 76, 92, 95, 72, 68, 85],
                backgroundColor: [
                    colors.primary,
                    colors.info,
                    colors.success,
                    colors.purple,
                    colors.pink,
                    colors.warning,
                    '#06b6d4',
                    '#8b5cf6'
                ],
                borderRadius: 8,
                barThickness: 35,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#1f2937',
                    bodyColor: '#6b7280',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 15,
                    displayColors: false,
                    titleFont: { size: 13, weight: '600' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: function(context) {
                            return 'Market Demand: ' + context.parsed.x + '%';
                        },
                        afterLabel: function(context) {
                            const jobs = Math.round(context.parsed.x * 2.5);
                            return 'Approx. ' + jobs + ' job postings';
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: { 
                        color: '#f3f4f6', 
                        drawBorder: false 
                    },
                    ticks: { 
                        color: '#9ca3af',
                        font: { size: 11 },
                        callback: (value) => value + '%'
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: { 
                        color: '#374151',
                        font: { size: 11, weight: '500' },
                        padding: 8
                    }
                }
            }
        }
    });

    // Job Distribution Doughnut with enhanced details
    new Chart(document.getElementById('marketChart'), {
        type: 'doughnut',
        data: {
            labels: ['Remote Work', 'Hybrid Model', 'On-site'],
            datasets: [{
                data: [60, 25, 15],
                backgroundColor: [colors.primary, colors.warning, colors.info],
                borderWidth: 0,
                spacing: 4,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { size: 12, weight: '500' },
                        color: '#6b7280',
                        usePointStyle: true,
                        pointStyle: 'circle',
                        generateLabels: function(chart) {
                            const data = chart.data;
                            return data.labels.map((label, i) => ({
                                text: label + ' (' + data.datasets[0].data[i] + '%)',
                                fillStyle: data.datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i
                            }));
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#1f2937',
                    bodyColor: '#6b7280',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 15,
                    displayColors: true,
                    titleFont: { size: 13, weight: '600' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return label + ': ' + value + '% of total jobs';
                        },
                        afterLabel: function(context) {
                            const total = 24;
                            const jobs = Math.round((context.parsed / 100) * total);
                            return jobs + ' active positions';
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}