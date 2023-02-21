import CPU from "./CPU.js"
import MEMORY from "./MEM.js"
import DISPLAY from "./DISP.js"

let runFlag = 0;

let mem = new MEMORY();
let disp = new DISPLAY(mem);
let cpu = new CPU(mem, disp);

let keyMap = {
	'Digit1' : 0x1, 'Digit2' : 0x2, 'Digit3' : 0x3, 'Digit4' : 0xC,
	'KeyQ' : 0x4, 'KeyW' : 0x5, 'KeyE' : 0x6, 'KeyR' : 0xD,
	'KeyA' : 0x7, 'KeyS' : 0x8, 'KeyD' : 0x9, 'KeyF' : 0xE,
	'KeyZ' : 0xA, 'KeyX' : 0x0, 'KeyC' : 0xB, 'KeyV' : 0xF
}

document.addEventListener('keydown', function(event) {
	cpu.updateKeyPort(keyMap[event.code], 1);
});

document.addEventListener('keyup', function(event) {
	cpu.updateKeyPort(keyMap[event.code], 0);
});

let canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');

window.setInterval(() => cpu.updateTimer(), 1000/60);
window.setInterval(() => disp.canvasDisplayUpdate(ctx), 1000/60);
//window.setInterval(() => cpu.stepInstruction(), 1000/60);

fetch("../roms/Tetris.ch8")
.then(result => result.arrayBuffer())
.then(result => mem.loadRom(result))
.then(() => start());

async function start() {
	console.log("Starting");
	cpu.reset();
	window.setInterval(() => eightStep(), 1);
}

function eightStep() {
    cpu.stepInstruction()
    cpu.stepInstruction()
    cpu.stepInstruction()
    cpu.stepInstruction()
    cpu.stepInstruction()
    cpu.stepInstruction()
    cpu.stepInstruction()
    cpu.stepInstruction()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}