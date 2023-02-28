//Import modules
import CPU from "./CPU.js"
import MEMORY from "./MEM.js"
import DISPLAY from "./DISP.js"
import {gameInfo, gameSpeed} from "./gameinfo.js"

//Create the parts of the Chip8 emulator
const mem = new MEMORY();
const disp = new DISPLAY(mem, 12);
const cpu = new CPU(mem, disp, handleSound, illegalOpcode);

//Global variables for various global things
//Main system timer (60hz)
let updateEmulation = undefined;
//Main audo context
let audioContext = new AudioContext();
//Flag for if sound is muted
let muteFlag = 0;
//Flag for if the emulator is paused
let pauseFlag = 0;
//Global emulation speed, we have an extra copy here-
//so we can update it when the apply button is hit
let emuSpeed = 30;
//Buffer for the rom to load when the start button is clicked
let romToLoad = undefined;
//Name of the rom to load
let romtoLoadName = undefined;

//This is where the page elements are pulled and events are bound
//Start, Pause and Mute Buttons
const startEmuButton = document.getElementById("startEmu");
const pauseEmuButton = document.getElementById("pauseEmu");
const muteSoundButton = document.getElementById("muteSound");
startEmuButton.addEventListener('click', () => startEmulation());
pauseEmuButton.addEventListener('click', () => pauseEmulation());
muteSoundButton.addEventListener('click', () => muteSound());

//ROM selectors
const includedRomSelector = document.getElementById("includedRomSelector");
const uploadedRomSelector = document.getElementById("uploadedRomSelector");
includedRomSelector.addEventListener('change', () => loadBuiltInRom(includedRomSelector.value));
uploadedRomSelector.addEventListener('change', () => loadUploadedRom());

//Canvas, note that we run the display update to prevent there from-
//being a hole in the page (the update fills the canvas white)
const mainRender = document.getElementById("mainCanvas");
const mainRenderContext = mainRender.getContext('2d');
disp.canvasDisplayUpdate(mainRenderContext);

//Settings menu and apply button
const settingsMenu = document.getElementById("settingsMenu");
const applySettings = document.getElementById("applySettings");
applySettings.addEventListener('click', () => updateEmulatorSettings());

//Display colour pickers
const foregroundColourPicker = document.getElementById("foregroundColourPicker");
const backgroundColourPicker = document.getElementById("backgroundColourPicker");

//Sliders (in the settings menu) and their indicators
//I am not afriad to make long lines of code ;)
const speedSlider = document.getElementById("speedSlider");
const speedSliderIndicator = document.getElementById("speedSliderIndicator");
const displaySlider = document.getElementById("displaySlider");
const displaySliderIndicator = document.getElementById("displaySliderIndicator");
speedSlider.addEventListener('change', () => speedSliderIndicator.innerText = `${speedSlider.value} instructions per frame`);
displaySlider.addEventListener('change', () => displaySliderIndicator.innerText = `${displaySlider.value}x`);

//About game/controls text
const controlsBodyText = document.getElementById("controlsBodyText");

//Binding the events to handle key presses
//Key map used to translate event codes to key numbers for the emulator
const keyMap = {
	'Digit1' : 0x1, 'Digit2' : 0x2, 'Digit3' : 0x3, 'Digit4' : 0xC,
	'KeyQ' : 0x4, 'KeyW' : 0x5, 'KeyE' : 0x6, 'KeyR' : 0xD,
	'KeyA' : 0x7, 'KeyS' : 0x8, 'KeyD' : 0x9, 'KeyF' : 0xE,
	'KeyZ' : 0xA, 'KeyX' : 0x0, 'KeyC' : 0xB, 'KeyV' : 0xF
}
document.addEventListener('keydown', function(event) {
	if (keyMap[event.code] != undefined) cpu.updateKeyPort(keyMap[event.code], 1);
});
document.addEventListener('keyup', function(event) {
	if (keyMap[event.code] != undefined) cpu.updateKeyPort(keyMap[event.code], 0);
});

//Here be the functions that all those events call!
//Function to load the rom and start the emulation
function startEmulation() {
	pauseFlag = 0;
	pauseEmuButton.classList.add("btn-danger");
	pauseEmuButton.classList.remove("btn-primary");
	pauseEmuButton.innerHTML = '<i class="fas fa-pause"></i>';
	if (gameInfo[romtoLoadName] != undefined) controlsBodyText.innerText = gameInfo[romtoLoadName];
	if (gameSpeed[romtoLoadName] != undefined) {
		emuSpeed = gameSpeed[romtoLoadName];
		speedSlider.value = emuSpeed;
		speedSliderIndicator.innerText = `${speedSlider.value} instructions per frame`;
	}
	if (typeof(updateEmulation) != "undefined") clearInterval(updateEmulation);
	disp.clear();
	if (romToLoad === undefined) {
		alert("Please load a ROM first.");
		return;
	}
	if (mem.loadRom(romToLoad) == false) {
		alert("Invalid ROM file, file is to large (Max limit of 3584 bytes).");
	}
	cpu.reset();
	updateEmulation = window.setInterval(() => updateEmulationState(), 1000/60);
}

//Function to pause the emulation, uses the pauseFlag
function pauseEmulation() {
	if (pauseFlag === 0) {
		//Pausing emulation
		if (romToLoad === undefined) {
		alert("Please load a ROM first.");
		return;
		}
		pauseFlag = 1;
		pauseEmuButton.classList.remove("btn-danger");
  		pauseEmuButton.classList.add("btn-primary");
  		pauseEmuButton.innerHTML = '<i class="fas fa-forward"></i>';
		if (typeof(updateEmulation) != "undefined") clearInterval(updateEmulation);
	} else {
		//Unpausing emulation
		if (romToLoad === undefined) {
		alert("Please load a ROM first.");
		return;
		}
		pauseFlag = 0;
		pauseEmuButton.classList.add("btn-danger");
  		pauseEmuButton.classList.remove("btn-primary");
  		pauseEmuButton.innerHTML = '<i class="fas fa-pause"></i>';
		updateEmulation = window.setInterval(() => updateEmulationState(), 1000/60);
	}
}

//Function that handles execution of an illegal Opcode
function illegalOpcode() {
	pauseEmulation();
	alert(`ILLEGAL OPCODE ${cpu.IR.toString(16)} AT PC:${cpu.PC}`);
}

function muteSound() {
	if (muteFlag === 0) {
		muteFlag = 1;
		muteSoundButton.classList.add("btn-danger");
  		muteSoundButton.classList.remove("btn-primary");
  		muteSoundButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
	} else {
		muteFlag = 0;
		muteSoundButton.classList.remove("btn-danger");
  		muteSoundButton.classList.add("btn-primary");
  		muteSoundButton.innerHTML = '<i class="fas fa-volume-up"></i>';
	}
}

//Not really happy with this, I really need to rewrite it!
//WIP make envelope toggleable and just kinda make this more elgant
function handleSound(length) {
	if (muteFlag === 1) return;
	//Create a new oscillator and connect a gain stage to it
	let osc = audioContext.createOscillator();
	let gainStage = audioContext.createGain();
	gainStage.connect(audioContext.destination);
	osc.connect(gainStage);
	//Start the oscillator
	osc.start(0);
	//Ramp down the oscillator 
	//On most Chip8 interpreters there is no such ramp-down envelope-
	//but IMO this sounds way nicer than letting the sound die immediatly
	gainStage.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + ((length/1000)*60));
	//Stop the oscillator to prevent "phantom sound"
	osc.stop(audioContext.currentTime + ((length/1000)*60));
}

//Load user uploaded rom into the global rom buffer
//WIP rewrite this to be more elegant
function loadUploadedRom(event) {
	const file = uploadedRomSelector.files[0];
	const reader = new FileReader();
	reader.onload = function(event) {
		const arrayBufferOne = event.target.result;
		romToLoad = arrayBufferOne;
	};
	reader.readAsArrayBuffer(file);
	romtoLoadName = "Uploaded";
}

//Loads the rom based on its name. Depends on a specific directory-
//structure --> ../roms/"name of rom".ch8
//It also updates the about game section with info about the game-
//if a built in game is selected
function loadBuiltInRom(romName) {
	if (romName === "Invalid") return;
	const fileName = "../roms/" + romName + ".ch8";
	fetch(fileName)
	.then(result => result.arrayBuffer())
	.then(result => romToLoad = result);
	romtoLoadName = romName;
}

//The function to update the emulation state
//Runs CPU instructions, updates CPU timers, then finally updates display
function updateEmulationState() {
	//Number of loops based on the currently set emulation speed multiplier
	for (let i = 0; i < emuSpeed; i++) {
		//Little hack to keep repeated illegal opcodes from locking up the browser in alerts
		if (pauseFlag === 0) cpu.stepInstruction();
	}
	cpu.updateTimer();
	disp.canvasDisplayUpdate(mainRenderContext);
}

//Not very happy with how this bit turned out, Im sure-
//there is a more elegant way to do it!
//Updates cpu and display config flags based on the settings menu
//WIP make this more elegant
function updateEmulatorSettings() {
	//Display colour update
	disp.foregroundColour = foregroundColourPicker.value;
	disp.backgroundColour = backgroundColourPicker.value;
	console.log(foregroundColourPicker.value);
	//Display size update
	mainRender.width = displaySlider.value * 64;
	mainRender.height = displaySlider.value * 32;
	disp.updateScale(displaySlider.value);
	disp.canvasDisplayUpdate(mainRenderContext);
	//Emulation speed update
	emuSpeed = speedSlider.value;
	//CPU and Display config update
	const configBoxes = document.querySelectorAll('#settingsMenu input[type="checkbox"]');
	for (let i = 0; i < configBoxes.length; i++) {
		if (configBoxes[i].id == "cpuSettingsUpdater") {
			cpu.config[configBoxes[i].value] = configBoxes[i].checked;
		}
		else if (configBoxes[i].id == "displaySettingsUpdater") {
			disp.config[configBoxes[i].value] = configBoxes[i].checked;
		}
	}
}

//LEFTOVER FROM DEBUGGING DELETE!
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}