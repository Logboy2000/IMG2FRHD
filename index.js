const outputField = document.getElementById('outputField')
const previewCanvas = document.getElementById('previewCanvas')
const xOffsetInput = document.getElementById('xOffset')
const yOffsetInput = document.getElementById('yOffset')
const imageScaleInput = document.getElementById('imageScale')
const blackThresholdInput = document.getElementById('blackThreshold')
const greyThresholdInput = document.getElementById('greyThreshold')


var trackString = ''
var xOffset = 0
var yOffset = 0
var imageScale = 1
var blackThreshold = 50
var greyThreshold = 100
var img
var imageData = null


// my beauitfully terrible code i cant be bothered to fix
xOffsetInput.addEventListener('input', () => {
    xOffset = parseInt(xOffsetInput.value, 10)
    updatePreviewCanvas()
})

yOffsetInput.addEventListener('input', () => {
    yOffset = parseInt(yOffsetInput.value, 10)
    updatePreviewCanvas()
})

blackThresholdInput.addEventListener('input', () => {
    blackThreshold = parseInt(blackThresholdInput.value, 10)
    updatePreviewCanvas()
})

greyThresholdInput.addEventListener('input', () => {
    greyThreshold = parseInt(greyThresholdInput.value, 10)
    updatePreviewCanvas()
})
imageScaleInput.addEventListener('input', () => {
    imageScale = parseFloat(imageScaleInput.value)
    updatePreviewCanvas()
})

let isDragging = false

previewCanvas.addEventListener('mousedown', (event) => {
    isDragging = true
    updateOffset(event)
});

previewCanvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
        updateOffset(event)
    }
});

previewCanvas.addEventListener('mouseup', () => {
    isDragging = false
});

previewCanvas.addEventListener('mouseleave', () => {
    isDragging = false
});

function updateOffset(event) {
    const rect = previewCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const scale = Math.min(previewCanvas.width / (imageData.width * 2), previewCanvas.height / (imageData.height * 2)) * imageScale
    const xCoord = Math.floor((x - previewCanvas.width / 2) / scale) * 2
    const yCoord = Math.floor((y - previewCanvas.height / 2) / scale) * 2
    xOffset = xCoord
    yOffset = yCoord
    xOffsetInput.value = xOffset;
    yOffsetInput.value = yOffset;
    updatePreviewCanvas();
}

function init() {
    blackThresholdInput.value = blackThreshold
    greyThresholdInput.value = greyThreshold
    xOffsetInput.value = xOffset
    yOffsetInput.value = yOffset
    imageScaleInput.value = imageScale
    outputField.innerText = trackString;
    previewCanvas.width = 500
    previewCanvas.height = 500
    const ctx = previewCanvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height)
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.font = '20px Arial'
    ctx.fillText('Upload an image to get started', 250, 250)
}

function updatePreviewCanvas() {
    if (imageData === null) return;
    const ctx = previewCanvas.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    const scale = Math.min(previewCanvas.width / (imageData.width * 2), previewCanvas.height / (imageData.height * 2)) * imageScale;
    ctx.scale(scale, scale);
    ctx.translate(previewCanvas.width / (2 * scale), previewCanvas.height / (2 * scale))
    ctx.drawImage(img, xOffset / 2, yOffset / 2)

    ctx.beginPath();
    ctx.arc(0, 0, 5 / scale, 0, Math.PI * 2, true);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();

    ctx.textAlign = 'center';
    ctx.font = toString(scale / 10) + 'px Arial';
    ctx.fillText('Player Spawn Point', 0, -10 / scale)

    ctx.restore();
}

function copyToClipboard() {
    navigator.clipboard.writeText(trackString)
        .then(() => {
            console.log('copied to clipboard')
            alert('Track code copied to clipboard')
        })
        .catch(err => {
            alert('Oopsie, copy went wrong. Try Manually copying instead', err)
        })
}


document.getElementById('uploadButton').addEventListener('change', handleImageUpload)

function handleImageUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

function loadImage(imageSrc) {
    img = new Image();
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        imageData = ctx.getImageData(0, 0, img.width, img.height);
        updatePreviewCanvas();
    };
    img.src = imageSrc;
}


function genImageWithLines() {
    if (imageData == null) {
        alert('Please upload an image first')
        return
    }
    const track = new FrhdTrack();
    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const index = (y * imageData.width + x) * 4;
            const alpha = imageData.data[index + 3];
            if (alpha === 0) continue; // Skip transparent pixels
            const brightness = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
            if (brightness < blackThreshold) {
                track.addPhysicsLine((x * 2) + xOffset, (y * 2) + yOffset, ((x + 1) * 2) + xOffset, ((y + 1) * 2) + yOffset);
            } else if (brightness < greyThreshold) {
                track.addSceneryLine((x * 2) + xOffset, (y * 2) + yOffset, ((x + 1) * 2) + xOffset, ((y + 1) * 2) + yOffset);
            }
        }
    }
    trackString = track.code;
    outputField.innerText = trackString;
}
