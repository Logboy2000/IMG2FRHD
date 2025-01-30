const outputField = document.getElementById('outputField')
var trackString = ''
var xOffset = -50;
var yOffset = 100;
var blackThreshold = 50;
var greyThreshold = 100;

var xOffsetInput = document.getElementById('xOffset');
var yOffsetInput = document.getElementById('yOffset');
var blackThresholdInput = document.getElementById('blackThreshold');
var greyThresholdInput = document.getElementById('greyThreshold');

// my beauitfully terrible code i cant be bothered to fix
xOffsetInput.addEventListener('input', () => {
    xOffset = parseInt(xOffsetInput.value, 10);
});

yOffsetInput.addEventListener('input', () => {
    yOffset = parseInt(yOffsetInput.value, 10);
});

blackThresholdInput.addEventListener('input', () => {
    blackThreshold = parseInt(blackThresholdInput.value, 10);
});

greyThresholdInput.addEventListener('input', () => {
    greyThreshold = parseInt(greyThresholdInput.value, 10);
});

function init() {
    console.log('init go')
    outputField.innerText = "Output will appear here"
}

function copyToClipboard(){
    navigator.clipboard.writeText(trackString)
    .then(() => {
        console.log('copied to clipboard');
    })
    .catch(err => {
        alert('Oopsie, copy went wrong. Try Manually copying instead', err);
    });
}

class FrhdTrack {
    /**
     * Starts up the track with the option of starting with a code
     * @param {string} [code="##"] - track code 
     * @param {number} [xOffset=0] - xOffset to import at
     * @param {number} [yOffset=0] - yOffset to import at 
     */
    constructor(code, xOffset, yOffset) {
        this.physicsLines = [],
            this.sceneryLines = [],
            this.powerups = {
                targets: [],
                slowmos: [],
                bombs: [],
                checkpoints: [],
                antigravities: [],
                boosts: [],
                gravities: [],
                teleporters: []
            },
            this.vehicles = {
                heli: [],
                truck: [],
                balloon: [],
                blob: []
            }
        this.import(code, xOffset, yOffset);
    }

    /**
     * Clears the track
     */
    clearTrack() {
        this.physicsLines = [],
            this.sceneryLines = [],
            this.powerups = {
                targets: [],
                slowmos: [],
                bombs: [],
                checkpoints: [],
                antigravities: [],
                boosts: [],
                gravities: [],
                teleporters: [],
                vehicles: {
                    heli: [],
                    truck: [],
                    balloon: [],
                    blob: []
                }
            }
    }

    /**
     * Adds a line (addPhysicsLine or addSceneryLine should be used instead of this)
     * @param {string} [type="physics"] - type of line ("physics" or "scenery")
     * @param {Array} line - 4 or more points for the line in the form of an array
     */
    addLine(type = 'physics', line){
        line.length % 2 == 1 && (line.pop());
        if (line.length < 4) return;
        if(type != 'physics' && type != 'scenery') type = 'physics';
        for (let index = 0; index < this[`${type}Lines`].length; index++) {
            let lines = this[`${type}Lines`][index];
            if(lines[0] == line[0] && lines[1] == line[1]){
                line.splice(0,2);
                let newArgs = [];
                for (let i = 0; i < line.length; i += 2) {
                    newArgs.unshift(line[i + 1]);
                    newArgs.unshift(line[i]);
                }
                line = newArgs.concat(lines);
                this[`${type}Lines`].splice(index, 1);
            } else if(lines[0] == line[line.length - 2] && lines[1] == line[line.length - 1]){
                lines.splice(0,2);
                line = line.concat(lines);
                this[`${type}Lines`].splice(index, 1);
            } else if(lines[lines.length - 2] == line[0] && lines[lines.length - 1] == line[1]){
                line.splice(0,2);
                line = lines.concat(line);
                this[`${type}Lines`].splice(index, 1);
            } else if(lines[lines.length - 2] == line[line.length - 2] && lines[lines.length - 1] == line[line.length - 1]){
                line.splice(line.length - 2, 2);
                let newArgs = [];
                for (let i = 0; i < line.length; i += 2) {
                    newArgs.unshift(line[i + 1]);
                    newArgs.unshift(line[i]);
                }
                line = lines.concat(newArgs);
                this[`${type}Lines`].splice(index, 1);
            }
        }
        this[`${type}Lines`].push(line);
    }

    /**
     * Adds a physics line
     * @param {...number} - 4 or more points for the line
     */
    addPhysicsLine() {
        let args = Array.from(arguments);
        args.length % 2 == 1 && (args.pop());
        if (args.length < 4) return;
        this.addLine('physics', args);
    }

    /**
     * Adds a scenery line
     * @param {...number} - 4 or more points for the line
     */
    addSceneryLine() {
        let args = Array.from(arguments);
        args.length % 2 == 1 && (args.pop());
        if (args.length < 4) return;
        this.addLine('scenery', args)
    }

    /**
     * Adds the default line
     */
    addDefaultLine() {
        this.addPhysicsLine(-40, 50, 40, 50);
    }

    /**
     * Adds a star
     * @param {number} [x=0] - x location
     * @param {number} [y=0] - y location
     */
    addTarget(x = 0, y = 0) {
        this.powerups.targets.push([x, y]);
    }

    /**
     * Adds a slowmo
     * @param {number} [x=0] - x location
     * @param {number} [y=0] - y location
     */
    addSlowmo(x = 0, y = 0) {
        this.powerups.slowmos.push([x, y]);
    }

    /**
     * Adds a bomb
     * @param {number} [x=0] - x location
     * @param {number} [y=0] - y location
     */
    addBomb(x = 0, y = 0) {
        this.powerups.bombs.push([x, y]);
    }

    /**
     * Adds a checkpoint
     * @param {number} [x=0] - x location
     * @param {number} [y=0] - y location
     */
    addCheckpoint(x = 0, y = 0) {
        this.powerups.checkpoints.push([x, y]);
    }

    /**
     * Adds an anti gravity
     * @param {number} [x=0] - x location
     * @param {number} [y=0] - y location
     */
    addAntigravity(x = 0, y = 0) {
        this.powerups.antigravities.push([x, y]);
    }

    /**
     * Adds a boost
     * @param {number} [x=0] - x location
     * @param {number} [y=0] - y location
     * @param {number} [angle=0] - angle of powerup in degrees
     */
    addBoost(x = 0, y = 0, angle = 0) {
        this.powerups.boosts.push([x, y, angle % 360]);
    }

    /**
     * Adds a gravity
     * @param {number} [x=0] - x location
     * @param {number} [y=0] - y location
     * @param {number} [angle=0] - angle of powerup in degrees
     */
    addGravity(x = 0, y = 0, angle = 0) {
        this.powerups.gravities.push([x, y, angle % 360]);
    }

    /**
     * Adds a teleporter to track
     * @param {number} [x=0] - x start location
     * @param {number} [y=0] - y start location
     * @param {number} [x1=0] - x end location
     * @param {number} [y1=0] - y end loction
     */
    addTeleporter(x = 0, y = 0, x1 = 0, y1 = 0) {
        this.powerups.teleporters.push([x, y, x1, y1]);
    }

    /**
     * Adds a vehicle to track
     * @param {number} [x=0] - x location 
     * @param {number} [y=0] - y location 
     * @param {string|number} [type="heli"] - type of vehicle (1-4 or heli/truck/balloon/blob)
     * @param {number} [time=10] - amount of time you can use the vehicle 
     */
    addVehicle(x = 0, y = 0, type = 'heli', time = 10) {
        if (typeof type == 'string') {
            type = type.toLowerCase();
            switch (type) {
                case 'heli':
                case 'truck':
                case 'balloon':
                case 'blob':
                    break;
                default: type = 'heli';
            }
        } else {
            if (type > 4) type = 1;
            let types = ['heli', 'truck', 'balloon', 'blob'];
            type = types[type - 1];
        }
        this.vehicles[type].push([x, y, time]);
    }

    /**
     * Imports a track at give cords
     * @param {string} [code="##"] - track code 
     * @param {number} [xOffset=0] - xOffset to import at
     * @param {number} [yOffset=0] - yOffset to import at 
     */
    import(code = '##', xOffset = 0, yOffset = 0) {
        if (code == '##') return;
        let [pLines, sLines, pUps] = code.split('#');
        pLines = pLines.split(',');
        sLines = sLines.split(',');
        for (let i in pLines) {
            let line = pLines[i];
            if (line != '' && line != void 0) {
                let points = line.trim().split(' ');
                for (let index = 0; index < points.length; index += 2) {
                    points[index] = parseInt(points[index], 32) + xOffset;
                    points[index + 1] = parseInt(points[index + 1], 32) + yOffset;
                }
                points.filter(point => !isNaN(point));
                this.addPhysicsLine(...points);
            }
        }
        for (let i in sLines) {
            let line = sLines[i];
            if (line != '' && line != void 0) {
                let points = line.trim().split(' ');
                for (let index = 0; index < points.length; index += 2) {
                    points[index] = parseInt(points[index], 32) + xOffset;
                    points[index + 1] = parseInt(points[index + 1], 32) + yOffset;
                }
                points.filter(point => !isNaN(point));
                this.addSceneryLine(...points);
            }
        }
        let powerupTypes = {
            T: this.addTarget,
            S: this.addSlowmo,
            O: this.addBomb,
            C: this.addCheckpoint,
            A: this.addAntigravity,
            B: this.addBoost,
            G: this.addGravity,
            W: this.addTeleporter,
            V: this.addVehicle
        }
        for (const powerup of pUps.split(',')) {
            if (powerup != '' && powerup != void 0) {
                let [type, x, y, x1, y1] = powerup.trim().split(' ');
                x = isNaN(parseInt(x, 32)) ? void 0 : parseInt(x, 32);
                y = isNaN(parseInt(y, 32)) ? void 0 : parseInt(y, 32);
                x1 = isNaN(parseInt(x1, 32)) ? void 0 : parseInt(x1, 32);
                y1 = isNaN(parseInt(y1, 32)) ? void 0 : parseInt(y1, 32);
                try {
                    switch(type){
                        case 'W': 
                            powerupTypes[type].call(this, x + xOffset, y + yOffset, x1 + xOffset, y1 + yOffset)
                            break;
                        default: powerupTypes[type].call(this, x + xOffset, y + yOffset, x1, y1);
                    }
                } catch (error) { }
            }
        }
    }

    /**
     * Moves the track
     * @param {number} [x=0] - x value to move
     * @param {number} [y=0] - y value to move
     */
    move(x = 0, y = 0) {
        for (const i in this.physicsLines) {
            const line = this.physicsLines[i];
            for (let index = 0; index < line.length; index += 2) {
                line[i] += x;
                line[i + 1] += y;
            }
        }
        for (const i in this.sceneryLines) {
            const line = this.sceneryLines[i];
            for (let index = 0; index < line.length; index += 2) {
                line[i] += x;
                line[i + 1] += y;
            }
        }
        for (let type in this.powerups) {
            if (this.powerups.hasOwnProperty(type) && this.powerups[type].length != 0) {
                for (const iterator of this.powerups[type]) {
                    switch (type) {
                        case 'teleporters':
                            iterator[2] += x;
                            iterator[3] += y;
                        default:
                            iterator[0] += x;
                            iterator[1] += y;
                            break;
                    }
                }
            }
        }
        for (const vehicleType in this.vehicles) {
            if (this.vehicles.hasOwnProperty(vehicleType)) {
                const vehicle = this.vehicles[vehicleType];
                for (const iterator of vehicle) {
                    iterator[0] += x;
                    iterator[1] += y;
                }
            }
        }
    }

    /**
     * Returns the track code
     */
    get code() {
        let code = [[], [], []]
        for (const i in this.physicsLines) {
            const line = this.physicsLines[i];
            let convertedLine = [];
            line.forEach(point => {
                convertedLine.push(point.toString(32));
            });
            code[0].push(convertedLine.join(' '));
        }
        for (const i in this.sceneryLines) {
            const line = this.sceneryLines[i];
            let convertedLine = [];
            line.forEach(point => {
                convertedLine.push(point.toString(32));
            });
            code[1].push(convertedLine.join(' '));
        }
        let powerupLookup = {
            targets: 'T',
            slowmos: 'S',
            bombs: 'O',
            checkpoints: 'C',
            antigravities: 'A',
            boosts: 'B',
            gravities: 'G',
            teleporters: 'W',
            vehicles: {
                heli: 1,
                truck: 2,
                balloon: 3,
                blob: 4
            }
        }
        for (const powerupType in this.powerups) {
            if (this.powerups.hasOwnProperty(powerupType)) {
                const powerupSet = this.powerups[powerupType];
                if (powerupSet != []) {
                    if (powerupType != 'vehicles' && powerupSet.length != 0) {
                        powerupSet.forEach(powerup => {
                            let data = [powerup[0], powerup[1], powerup[2], powerup[3]].filter(obj => obj !== void 0);
                            for(let i in data){
                                data[i] = data[i].toString(32)
                            }
                            code[2].push(`${powerupLookup[powerupType]} ${data.join(' ')}`)
                        })
                    } else {
                        for (const vehicleType in powerupSet) {
                            if (powerupSet.hasOwnProperty(vehicleType) && powerupSet[vehicleType].length != 0) {
                                const element = powerupSet[vehicleType];
                                code[2].push(`V ${element[0].toString(32)} ${element[1].toString(32)} ${powerupLookup.vehicles[vehicleType]} ${element[2].toString(32)}`)
                            }
                        }
                    }
                }
            }
        }
        return code.join('#');
    }
}
document.getElementById('uploadButton').addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    outputField.innerText = "Working..."
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("inputImage").src = e.target.result;
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            approximateImageWithLines(imageData);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
function approximateImageWithLines(imageData) {
    const track = new FrhdTrack();
    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const index = (y * imageData.width + x) * 4;
            const brightness = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
            if (brightness < blackThreshold) {
                track.addPhysicsLine((x * 2) + xOffset, (y * 2) + yOffset, ((x + 1) * 2) + xOffset, ((y + 1) * 2) + yOffset);
            } else if (brightness < greyThreshold) { // Adjust the range as needed
                track.addSceneryLine((x * 2) + xOffset, (y * 2) + yOffset, ((x + 1) * 2) + xOffset, ((y + 1) * 2) + yOffset);
            }
        }
    }
    trackString = track.code;
    outputField.innerText = trackString;
}
