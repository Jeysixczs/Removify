// DOM Elements
const fileInput = document.getElementById('imageInput');
const resultContainer = document.getElementById('resultContainer');
const outputImage = document.getElementById('outputImage');
const downloadLink = document.getElementById('downloadLink');
const uploadArea = document.getElementById('uploadArea');
const uploadLabel = document.getElementById('uploadLabel');
const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
const newImageBtn = document.getElementById('newImageBtn');
const loadingContainer = document.getElementById('loadingContainer');
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.getElementById('themeIcon');

// API Configuration
const apiKey = "key-FNwTdCngxQZXXLiR"; // Replace with your own API key

// Initialize theme
let darkMode = localStorage.getItem('darkMode') === 'true';
updateTheme();

// Theme toggle event
themeToggle.addEventListener('click', () => {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    updateTheme();
});

function updateTheme() {
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeToggle.style.background = 'linear-gradient(135deg, #3a3a3a, #2a2a2a)';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        themeToggle.style.background = 'linear-gradient(135deg, #f5f7fa, #e4e8f5)';
    }
}

// Drag and drop functionality
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    uploadArea.classList.add('drag-over');
    uploadArea.style.transform = 'scale(1.02)';
}

function unhighlight() {
    uploadArea.classList.remove('drag-over');
    uploadArea.style.transform = 'scale(1)';
}

uploadArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
        handleFiles(files);
    }
}

// File input change handler
fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        handleFiles(fileInput.files);
    }
});

function handleFiles(files) {
    fileInput.files = files;
    updateFileName();
}

function updateFileName() {
    if (fileInput.files && fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        uploadLabel.textContent = fileName.length > 20
            ? fileName.substring(0, 17) + '...'
            : fileName;
        uploadArea.classList.add('file-selected');
    }
}

uploadArea.addEventListener('click', () => {
    fileInput.click();
});
// At the top of your script.js

uploadLabel.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Reset application state
function resetApp() {
    fileInput.value = '';
    uploadLabel.textContent = 'Drag & drop your image here';
    uploadArea.querySelector('small').textContent = 'or click to browse files (JPG, PNG up to 5MB)';
    resultContainer.style.display = 'none';
    removeBackgroundBtn.style.display = 'flex';
    newImageBtn.style.display = 'none';
    uploadArea.classList.remove('file-selected');
}

// Remove background function
removeBackgroundBtn.addEventListener('click', async () => {
    if (!fileInput.files || fileInput.files.length === 0) {
        showAlert('Please select an image first.');
        return;
    }

    const file = fileInput.files[0];

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('Image size should be less than 5MB.');
        return;
    }

    // Check file type
    if (!file.type.match('image.*')) {
        showAlert('Please select a valid image file (JPG, PNG).');
        return;
    }

    loadingContainer.style.display = 'flex';
    removeBackgroundBtn.disabled = true;

    try {
        const result = await removeBackground(file);
        outputImage.src = result;
        downloadLink.href = result;
        resultContainer.style.display = 'block';
        removeBackgroundBtn.style.display = 'none';
        newImageBtn.style.display = 'flex';
    } catch (error) {
        console.error('Error:', error);
        showAlert('An error occurred while removing the background. Please try again.');
    } finally {
        loadingContainer.style.display = 'none';
        removeBackgroundBtn.disabled = false;
    }
});

async function removeBackground(file) {
    const imageBase64 = await readFileAsBase64(file);

    const response = await fetch("https://api.withoutbg.com/v1.0/image-without-background-base64", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
        },
        body: JSON.stringify({ image_base64: imageBase64 }),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return `data:image/png;base64,${data.img_without_background_base64}`;
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// New image button handler
newImageBtn.addEventListener('click', resetApp);

// Helper function to show alerts
function showAlert(message) {
    // In a production app, consider using a toast notification
    alert(message);
}

// Initialize app state
resetApp();