// frontend/static/js/resume/resume-upload.js

const resumeInput = document.getElementById('resumeUpload');
const fileNameDisplay = document.getElementById('fileName');
const uploadContainer = document.querySelector('.upload-container');

// Handle file selection via click
resumeInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        fileNameDisplay.textContent = 'Selected file: ' + this.files[0].name;
    }
});

// Handle file drop
uploadContainer.addEventListener('dragover', function (e) {
    e.preventDefault();
});

uploadContainer.addEventListener('drop', function (e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file) {
        resumeInput.files = e.dataTransfer.files;
        fileNameDisplay.textContent = 'Selected file: ' + file.name;
    }
});

// Prevent drop outside the container
document.addEventListener('dragover', function (e) {
    if (!uploadContainer.contains(e.target)) {
        e.preventDefault();
    }
});

document.addEventListener('drop', function (e) {
    if (!uploadContainer.contains(e.target)) {
        e.preventDefault();
    }
});

// Upload resume button click handler
document.getElementById('uploadBtn').addEventListener('click', uploadResume);

function uploadResume() {
    const file = resumeInput.files[0];

    if (!file) {
        Swal.fire("Error", "Please select a resume to upload.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    Swal.fire({
        title: 'Uploading...',
        text: 'Please wait while we process your resume.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:8000/api/resume-parser/store-process-resume', true);

    xhr.onload = function () {
        Swal.close();
        
        // Reset input and filename
        resumeInput.value = '';
        fileNameDisplay.textContent = '';

        if (xhr.status === 200) {
            Swal.fire("Success", "Resume uploaded successfully!", "success");
        } else {
            try {
                const response = JSON.parse(xhr.responseText);
                const errorMessage = response.error || "Failed to upload resume.";
                Swal.fire("Error", errorMessage, "error");
            } catch (err) {
                Swal.fire("Error", "Failed to upload resume. Please try again.", "error");
            }
        }
    };

    xhr.onerror = function () {
        Swal.close();
        Swal.fire("Error", "Network error occurred while uploading.", "error");
    };

    debugger
    xhr.send(formData);
}
