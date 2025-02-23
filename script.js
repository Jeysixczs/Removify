 
 const apiKey = "key-2jviR6WQI8D3OKvJ";
 //change your api key this api is only 50 attemps
 

const fileInput = document.getElementById('imageInput');
const resultContainer = document.getElementById('resultContainer');
const outputImage = document.getElementById('outputImage');
const downloadLink = document.getElementById('downloadLink');
const inputContainer = document.querySelector('.inputContainer');
const label = inputContainer.querySelector('label');
const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
const newImageBtn = document.getElementById('newImageBtn');

// Initially hide the "New" button
newImageBtn.style.display = 'none';

// Function to reset the application to its initial state
function resetApp() {
    // Reset file input
    fileInput.value = ''; // Clear the file input

    // Reset the label text
    label.textContent = 'Upload an Image';


    resultContainer.style.display = 'none';
    inputContainer.style.display = 'flex';

    // Clear the output image and download link
    outputImage.src = '';
    downloadLink.href = '#';

    // Show "Remove Background" button and hide "New" button
    removeBackgroundBtn.style.display = 'block';
    newImageBtn.style.display = 'none';
}

// Event listener for file input change
fileInput.addEventListener('change', (event) => {
    if (fileInput.files && fileInput.files.length > 0) {
        // Change the text to the uploaded file name
        label.textContent = fileInput.files[0].name;
    }
});

// Event listener for the "Remove Background" button
removeBackgroundBtn.addEventListener('click', async () => {
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select an image first.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
        const imageBase64 = event.target.result.split(',')[1]; // Get base64 data

        try {
            const response = await fetch("https://api.withoutbg.com/v1.0/image-without-background-base64", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey,
                },
                body: JSON.stringify({ image_base64: imageBase64 }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove background');
            }

            const data = await response.json();
            const resultImage = data.img_without_background_base64;

            // Display the result image
            outputImage.src = `data:image/png;base64,${resultImage}`;
            downloadLink.href = `data:image/png;base64,${resultImage}`;

            // Hide the input container and show the result container
            inputContainer.style.display = 'none';
            resultContainer.style.display = 'block';

            // Hide "Remove Background" button and show "New" button
            removeBackgroundBtn.style.display = 'none';
            newImageBtn.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while removing the background.');
        }
    };

    reader.readAsDataURL(file); // Convert the image to base64
});

// Event listener for the "New" button
newImageBtn.addEventListener('click', () => {
    resetApp();
});

// Trigger file input when the inputContainer is clicked
inputContainer.addEventListener('click', () => {
    if (!fileInput.files || fileInput.files.length === 0) {
        fileInput.click(); // Only trigger file input if no file is selected
    }
});