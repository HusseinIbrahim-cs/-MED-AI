// Grab HTML elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const placeholder = document.getElementById('placeholder');
const diagnosisText = document.getElementById('diagnosis-text');
const severityBadge = document.getElementById('severity-badge');
const generateBtn = document.getElementById('generate-btn');

// --- 1. Drag & Drop Event Listeners ---
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        processImage(fileInput.files[0]);
    }
});

// Handle standard file click selection
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        processImage(e.target.files[0]);
    }
});

// --- 2. Main Processing Logic ---
function processImage(file) {
    // Show the uploaded image on the screen immediately
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
        placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
    
    // Update UI to show "Analyzing" state
    diagnosisText.innerText = "Transmitting to Deep Learning Model...";
    diagnosisText.style.color = "#6b7280";
    severityBadge.style.display = "none";
    generateBtn.disabled = true;

    // Prepare the image to be sent via HTTP Request
    const formData = new FormData();
    formData.append('file', file);

    // --- 3. The HTTP Request to your (future) Python Backend ---
    fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error('Server error');
        return response.json();
    })
    .then(data => {
        // Success: The Python server replied with the real AI prediction
        updateUIWithResult(data.disease, data.confidence, data.severity);
    })
    .catch(error => {
        // ERROR FALLBACK (For UI testing without backend)
        console.warn('Backend not found. Falling back to Mock UI Mode for testing.');
        
        // Simulates the Python server taking 2 seconds to process the image
        setTimeout(() => {
            updateUIWithResult("Pneumonia", 92.4, "High");
        }, 2000); 
    });
}

// --- 4. Helper Function to Update Screen ---
function updateUIWithResult(disease, confidence, severity) {
    diagnosisText.innerHTML = `Possible <strong>${disease}</strong> - ${confidence}% confidence`;
    diagnosisText.style.color = "#1f2937";
    
    severityBadge.innerText = severity;
    severityBadge.style.display = "block";
    
    // Color code the badge based on severity
    if (severity.toLowerCase() === 'high') {
        severityBadge.style.borderColor = "#ef4444";
        severityBadge.style.color = "#ef4444";
    } else if (severity.toLowerCase() === 'medium') {
        severityBadge.style.borderColor = "#f59e0b";
        severityBadge.style.color = "#f59e0b";
    } else {
        severityBadge.style.borderColor = "#10b981";
        severityBadge.style.color = "#10b981";
    }

    // Enable the final report button
    generateBtn.disabled = false;
}