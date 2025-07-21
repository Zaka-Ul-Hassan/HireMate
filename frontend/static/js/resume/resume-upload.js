// frontend\static\js\resume\resume-upload.js

// frontend\static\js\resume\resume-upload.js

const resumeInput = document.getElementById('resumeUpload');
const fileNameDisplay = document.getElementById('fileName');
const uploadContainer = document.querySelector('.upload-container');

// Handle file selection via click
resumeInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        fileNameDisplay.textContent = 'Selected files: ' + this.files[0].name;
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
