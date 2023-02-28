export default class CPU {
	constructor(memToLoad, displayOut, soundHandler, illegalOpcode = this.invalidInstruction) {
		//Create 16 8-bit general purpose registers
		//VF (The 16th register) is used for flags
		this.Vbuffer = new ArrayBuffer(16);
		this.V = new Uint8Array(this.Vbuffer);
		//Create the stack, 16 16-bit entries
		this.Sbuffer = new ArrayBuffer(32);
		this.S = new Uint16Array(this.Sbuffer);
		//Emulation config flags: index = what value of true will enable
		//Using an array instead of an object because acsessing arrays-
		//are faster than objects? Idk Im coming from C++
		//0 = Bit-shifting clobber   1 = Offset jump Vx
		//2 = Index overflow		 3 = Index increment
		//4 = RNG disable
		this.config = [false, false, false, false, false];
		//Initalize systems
		this.loadMem(memToLoad);
		this.loadDisp(displayOut);
		this.loadSound(soundHandler);
		this.loadErrorFunc(illegalOpcode);
		this.reset();
	}

	reset() {
		//Clear all registers
		for (let i = 0; i < 16; i++) this.V[i] = 0;
		//The 16-bit index register
		this.I = 0;
		//The program counter register, starts execution at 0x200
		//Points to next instruction to execute
		this.PC = 0x200;
		//The stack pointer register
		this.SP = 0;
		//Clear the stack
		for (let i = 0; i < 16; i++) this.S[i] = 0;
		//The delay timer
		this.DT = 0;

		//The instruction register
		this.IR = this.Mem.read(this.PC);
		//The keyPort reigster;
		this.keyPort = 0;

		//Instruction argument buffers
		//3 nibble literal
		this.nnn = 0;
		//2 nibble literal
		this.kk = 0;
		//left nibble
		this.x = 0;
		//middle nibble
		this.y = 0;
		//right nibble
		this.n = 0;

	}

	loadMem(memToLoad) {
		//Loads reference to memory to run from
		//Memory is a 4096 entry byte array
		this.Mem = memToLoad;
	}

	loadDisp(displayOut) {
		//Loads reference to display to print to
		this.Disp = displayOut;
	}

	loadSound(soundHandler) {
		//Loads reference to sound handler
		this.soundHandler = soundHandler;
	}

	loadErrorFunc(errorFunc) {
		//Loads reference to invalid opcode handler
		this.invalidOpFunc = errorFunc;
	}

	updateTimer() {
		if (this.DT > 0) {
			this.DT--;
		}
	}

	updateKeyPort(keyNum, pressed) {
		if (pressed === 1) this.keyPort |= (1 << keyNum);
		if (pressed === 0) this.keyPort &= ~(1 << keyNum);
	}

	runInstruction(instruction) {
		//Instruction Decode
		this.instructionFunction = this.decodeInstruction(instruction);
		//Instruction Execute
		this.instructionFunction();
	}

	stepInstruction() {
		//Instruction Fetch
		this.IR = (this.Mem.read(this.PC) << 8);
		this.IR |= this.Mem.read(this.PC + 1);
		this.PC += 2;
		//Instruction Decode & Execute
		this.runInstruction(this.IR);
	}

	//This is the decode table used to find a function based on the opcode
	//Indexes represent the leading opcode nibble
	//Numerical keys in objects represent the trailing opcode nibble(s)
	//"nibbles" key is used to find how many nibbles are used for the trailing opcode
	decodeTable = [
	{0xE0: this.CLS, 0xEE: this.RET, nibbles: 2},
	this.JPi,
	this.CALL,
	this.SEb,
	this.SNEb,
	{0: this.SEr, nibbles: 1},
	this.LDb,
	this.ADDb,
	{0: this.LDr, 1: this.OR, 2: this.AND, 3: this.XOR, 4: this.ADDr,
	 5: this.SUB, 6: this.SHR, 7: this.SUBN, 0xE: this.SHL, nibbles: 1},
	{0: this.SNEr, nibbles: 1},
	this.LDi,
	this.JPr,
	this.RND,
	this.DRW,
	{0x9E: this.SKP, 0xA1: this.SKNP, nibbles: 2},
	{0x07: this.LDrd, 0x0A: this.LDrk, 0x15: this.LDdr, 0x18: this.LDsr, 0x1E: this.ADDi,
	 0x29: this.LDis, 0x33: this.LDbr, 0x55: this.LDir, 0x65: this.LDri, nibbles: 2}
	];

	decodeInstruction(instruction) {
		//Decode function arguments
		this.nnn = instruction & 0x0FFF;
		this.kk = instruction & 0x00FF;
		this.x = (instruction & 0x0F00) >> 8;
		this.y = (instruction & 0x00F0) >> 4;
		this.n = instruction & 0x000F;

		//Instruction decoding - returns the function for the associated instruction
		//First decode the first opcode nibble
		//For many instructions this is all thats needed
		let firstDecode = this.decodeTable[(instruction & 0xF000) >> 12];
		if (typeof firstDecode === "function") {
			return firstDecode;
		}
		//For instructions that have a second opcode nibble
		if (firstDecode.nibbles === 1) {
			let secondDecode = firstDecode[instruction & 0x000F];
			if (secondDecode != undefined) return secondDecode;
		}
		//For instructions with three opcode nibble
		else if (firstDecode.nibbles === 2) {
			let secondDecode = firstDecode[instruction & 0x00FF];
			if (secondDecode != undefined) return secondDecode;
		}
		//Otherwise an invalid instruction has been reached
		//SYS which isnt implemented also counts as an invalid instruction
		return this.invalidOpFunc;
	}

	invalidInstruction() {
		//Defualt function for handeling illegal opcodes
		//Just prints an error in the console
		console.log("UHoh! Illegal Opcode!");
	}

	//Actual instruction implementations
	//It may be ugly, but it sure does work!
	//These are all pretty self explanitory
	//Check the CHIP8 technical reference for info on the instructions themselves
	SYS()	{ this.invalidOpFunc(); }
	CLS()	{ this.Disp.clear(); }
	//WIP ADJUST CALL STACK DEPTH AND PROPER ERROR THROWING
	RET()	{ this.SP--; if (this.SP < 0) console.log("ERROR"); this.PC = this.S[this.SP]; }
	JPi()	{ this.PC = this.nnn; }
	//WIP ADJUST CALL STACK DEPTH AND PROPER ERROR THROWING
	CALL()	{ this.S[this.SP] = this.PC; this.SP++; if (this.SP > 15) console.log("ERROR"); this.PC = this.nnn; }
	SEb()	{ if (this.V[this.x] === this.kk) this.PC += 2; }
	SNEb()	{ if (this.V[this.x] != this.kk) this.PC += 2; }
	SEr()	{ if (this.V[this.x] === this.V[this.y]) this.PC += 2; }
	LDb()	{ this.V[this.x] = this.kk; }
	ADDb()	{ this.V[this.x] += this.kk; }
	LDr()	{ this.V[this.x] = this.V[this.y]; }
	OR()	{ this.V[this.x] |= this.V[this.y]; }
	AND()	{ this.V[this.x] &= this.V[this.y]; }
	XOR()	{ this.V[this.x] ^= this.V[this.y]; }
	ADDr()	{ this.V[0xF] = 0; let sum = this.V[this.x] + this.V[this.y]; if (sum > 0xFF) this.V[0xF] = 1; this.V[this.x] = sum; }
	SUB()	{ this.V[0xF] = 0; if (this.V[this.x] > this.V[this.y]) this.V[0xF] = 1; this.V[this.x] -= this.V[this.y]; }
	SHR()	{
		if (this.config[0]) this.V[this.x] = this.V[this.y];
		this.V[0xF] = this.V[this.x] & 0x1;
		this.V[this.x] = this.V[this.x] >> 1; 
	}
	SUBN()	{ this.V[0xF] = 0; if (this.V[this.y] > this.V[this.x]) this.V[0xF] = 1; this.V[this.x] = this.V[this.y] - this.V[this.x]; }
	SHL()	{
		if (this.config[0]) this.V[this.x] = this.V[this.y];
		this.V[0xF] = (this.V[this.x] & 0x8) >> 8;
		this.V[this.x] = this.V[this.x] << 1;
	}
	SNEr()	{ if (this.V[this.x] != this.V[this.y]) this.PC += 2; }
	LDi()	{ this.I = this.nnn; }
	JPr()	{ this.PC = this.nnn + this.V[0x0]; if (this.config[1]) this.PC = this.nnn + this.V[this.x]; }
	RND()	{ if (!this.config[4]) this.V[this.x] = Math.floor(Math.random() * 256) & this.kk; }
	DRW()	{ this.V[0xF] = this.Disp.drawSprite(this.V[this.x], this.V[this.y], this.n, this.I); }
	SKP()	{ if ((this.keyPort & (1 << (this.V[this.x] & 0xF))) != 0) this.PC += 2; }
	SKNP()	{ if ((this.keyPort & (1 << (this.V[this.x] & 0xF))) === 0) this.PC += 2; }
	LDrd()	{ this.V[this.x] = this.DT; }
	LDrk()	{
		if (this.keyPort === 0) {
			this.PC -= 2;
		} else {
			for (let i = 0; i < 16; i++) {
				if (this.keyPort & (1 << i)) {
					this.V[this.x] = i;
					break;
				}
			}
		}
	}
	LDdr()	{ this.DT = this.V[this.x]; }
	LDsr()	{ this.soundHandler(this.V[this.x]); }
	ADDi()	{
		if (this.config[2]) this.V[0xF] = 0;
		this.I += this.V[this.x];
		if (this.config[2] && this.I > 0xFFF) this.V[0xF] = 1; 
		this.I &= 0xFFF;
	}
	LDis()	{ this.I = (this.V[this.x] & 0xF) * 5; }
	LDbr()	{
		let bcdVal = this.V[this.x];
		let modVal = bcdVal % 10;
		bcdVal -= modVal;
		this.Mem.write(this.I+2, modVal);
		modVal = bcdVal % 100;
		bcdVal -= modVal;
		this.Mem.write(this.I+1, modVal/10);
		this.Mem.write(this.I, bcdVal/100);
	}
	LDir()	{ 
		for (let i = 0; i <= this.x; i++) this.Mem.write(this.I+i, this.V[i]);
		if (this.config[3]) this.I += this.x;
	}
	LDri()	{ 
		for (let i = this.x; i >= 0; i--) this.V[i] = this.Mem.read(this.I+i); 
		if (this.config[3]) this.I -= this.x;
	}
}