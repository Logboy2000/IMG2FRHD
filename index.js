const outputField = document.getElementById('outputField')
const previewCanvas = document.getElementById('previewCanvas')
var xOffsetInput
var yOffsetInput
const sidebar = document.getElementById('sidebar')
const settingsContainer = document.getElementById('settingsContainer')

const colorMap = {
    '#FFFFFF': 'White (Strongly recommended)',
    '#0C0C0C': 'PhysicsLine',
    '#9F9F9F': 'SceneryLine',
    '#C7231D': 'Bomb',
    '#346BB8': 'Gravity',
    '#FBE615': 'Star',
    '#8DCC28': 'Boost',
    '#07FAF3': 'Antigravity',
    '#776FE1': 'Checkpoint',
    '#DC45EC': 'Teleporter',
    // '#F59322': 'Helicopter',
    // '#93D34E': 'Truck',
    // '#F02627': 'Balloon',
    // '#A683C4': 'Blob'
};

var trackString = ''
var img
var imageData = null

// Settings
var xOffset = 0
var yOffset = 0
var previewZoom = 1
var enabledColors = {
    '#FFFFFF': true,
    '#0C0C0C': true,
    '#9F9F9F': true,
    '#C7231D': true,
    '#346BB8': true,
    '#FBE615': true,
    '#8DCC28': true,
    '#07FAF3': true,
    '#776FE1': true,
    '#DC45EC': true,
    // '#F59322': true,
    // '#93D34E': true,
    // '#F02627': true,
    // '#A683C4': true
};

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

window.addEventListener('resize', updateAndClearPreviewCanvas)



function init() {
    // Add x and y offset settings
    ['X Offset', 'Y Offset'].forEach((labelText, index) => {
        const label = document.createElement('label');
        label.innerText = `${labelText}: `;
        const input = document.createElement('input');
        input.type = 'number';
        input.value = index === 0 ? xOffset : yOffset;
        input.addEventListener('change', () => {
            if (index === 0) {
                xOffset = parseInt(input.value, 10);
            } else {
                yOffset = parseInt(input.value, 10);
            }
            updateAndClearPreviewCanvas();
        });
        label.appendChild(input);
        settingsContainer.appendChild(label);
        settingsContainer.appendChild(document.createElement('br'));
        if (index === 0) {
            xOffsetInput = input;
        } else {
            yOffsetInput = input;
        }
    });
    var h2 = document.createElement('h2')
    h2.innerText = 'Objects'
    settingsContainer.appendChild(h2);
    // Add setting toggles
    for (const color in colorMap) {
        const label = document.createElement('label');
        label.innerText = colorMap[color];
        const input = document.createElement('input');
        input.type = 'checkbox';
        enabledColors[color] = input.checked;
        input.addEventListener('change', () => {
            enabledColors[color] = input.checked;
        });
        label.appendChild(input);
        settingsContainer.appendChild(label);
        settingsContainer.appendChild(document.createElement('br'));
    }



    xOffsetInput.value = xOffset
    yOffsetInput.value = yOffset
    outputField.innerText = trackString;
    updateAndClearPreviewCanvas();
}

function updateOffset(event) {
    const rect = previewCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const xCoord = Math.floor((x - previewCanvas.width / 2) / previewZoom) * 2
    const yCoord = Math.floor((y - previewCanvas.height / 2) / previewZoom) * 2
    xOffset = xCoord
    yOffset = yCoord
    xOffsetInput.value = xOffset;
    yOffsetInput.value = yOffset;
    updateAndClearPreviewCanvas();
}

function updateAndClearPreviewCanvas() {
    const ctx = previewCanvas.getContext('2d');
    previewCanvas.width = previewCanvas.clientWidth;
    previewCanvas.height = previewCanvas.clientHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    ctx.scale(previewZoom, previewZoom);
    ctx.translate(previewCanvas.width / 2, previewCanvas.height / 2);
    if (imageData === null) {
        ctx.fillStyle = 'black'
        ctx.textAlign = 'center'
        ctx.font = '20px Arial'
        ctx.fillText('Upload an image to get started', 0, 0)
    } else {
        ctx.drawImage(img, xOffset / 2, yOffset / 2);

        ctx.beginPath();
        ctx.arc(0, 0, 5 / previewZoom, 0, Math.PI * 2, true);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();

        ctx.textAlign = 'center';
        ctx.font = toString(previewZoom / 10) + 'px Arial';
        ctx.fillText('Player Spawn Point', 0, -10 / previewZoom);
    }
    ctx.restore();
}

let keysPressed = {};

document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
});

previewCanvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const zoomFactor = 0.1;
    if (event.deltaY < 0) {
        previewZoom += zoomFactor;
    } else {
        previewZoom -= zoomFactor;
    }
    previewZoom = Math.max(0.1, previewZoom); // Prevent zooming out too much
    updateAndClearPreviewCanvas();
});

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
        updateAndClearPreviewCanvas();
    };
    img.src = imageSrc;
}

function getClosestColor(r, g, b) {
    let closestColor = null;
    let closestDistance = Infinity;
    for (const hex in colorMap) {
        if (!enabledColors[hex]) continue;
        const colorR = parseInt(hex.slice(1, 3), 16);
        const colorG = parseInt(hex.slice(3, 5), 16);
        const colorB = parseInt(hex.slice(5, 7), 16);
        const distance = Math.sqrt(
            Math.pow(r - colorR, 2) +
            Math.pow(g - colorG, 2) +
            Math.pow(b - colorB, 2)
        );
        if (distance < closestDistance) {
            closestDistance = distance;
            closestColor = hex;
        }
    }
    return closestColor;
}

function genTrackFromImageData() {
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
            const red = imageData.data[index];
            const green = imageData.data[index + 1];
            const blue = imageData.data[index + 2];
            const brightness = (red + green + blue) / 3;
            if (brightness > 128) continue; // Skip dark pixels
            const closestColor = getClosestColor(red, green, blue);
            switch (colorMap[closestColor]) {
                case 'White (Strongly recommended)':
                    break;
                case 'Bomb':
                    track.addBomb((x * 2) + xOffset, (y * 2) + yOffset);
                    break;
                case 'Gravity':
                    track.addGravity((x * 2) + xOffset, (y * 2) + yOffset);
                    break;
                case 'Helicopter':
                    track.addVehicle((x * 2) + xOffset, (y * 2) + yOffset, 'heli');
                    break;
                case 'Star':
                    track.addStar((x * 2) + xOffset, (y * 2) + yOffset);
                    break;
                case 'Boost':
                    track.addBoost((x * 2) + xOffset, (y * 2) + yOffset);
                    break;
                case 'Antigravity':
                    track.addAntigravity((x * 2) + xOffset, (y * 2) + yOffset);
                    break;
                case 'Checkpoint':
                    track.addCheckpoint((x * 2) + xOffset, (y * 2) + yOffset);
                    break;
                case 'Teleporter':
                    track.addTeleporter((x * 2) + xOffset, (y * 2) + yOffset, ((x + 1) * 2) + xOffset, ((y + 1) * 2) + yOffset);
                    break;
                case 'Truck':
                    track.addVehicle((x * 2) + xOffset, (y * 2) + yOffset, 'truck');
                    break;
                case 'Balloon':
                    track.addVehicle((x * 2) + xOffset, (y * 2) + yOffset, 'balloon');
                    break;
                case 'Blob':
                    track.addVehicle((x * 2) + xOffset, (y * 2) + yOffset, 'blob');
                    break;
                case 'PhysicsLine':
                    track.addPhysicsLine((x * 2) + xOffset, (y * 2) + yOffset, ((x + 1) * 2) + xOffset, ((y + 1) * 2) + yOffset);
                    break;
                case 'SceneryLine':
                    track.addSceneryLine((x * 2) + xOffset, (y * 2) + yOffset, ((x + 1) * 2) + xOffset, ((y + 1) * 2) + yOffset);
                    break;
                default:
                    alert('please enable at least 1 object');
                    return;
            }
        }
    }
    trackString = track.code;
    outputField.innerText = trackString;
}