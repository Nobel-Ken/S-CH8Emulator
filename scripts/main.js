import CPU from "./CPU.js"
import MEMORY from "./MEM.js"
import DISPLAY from "./DISP.js"

let mem = new MEMORY();
let disp  = new DISPLAY(mem);
let cpu = new CPU(mem, disp);

fetch("../tester.ch8")
.then(result => result.arrayBuffer())
.then(result => mem.loadRom(result))
.then(() => start());

async function start() {
	console.log("Starting");
	cpu.reset();
	//cpu.runInstruction(0x9010);
	for (let i = 0; i < 1000; i++){
		cpu.stepInstruction();
		console.clear();
		disp.consoleDisplayUpdate();
		//await sleep(100);
	}
	//console.log(cpu.decodeInstruction(0x00EE).name);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}