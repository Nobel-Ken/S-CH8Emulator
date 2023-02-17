export default class CPU {

	constructor(memToLoad, displayOut) {
		//Create 16 8-bit general purpose registers
		//VF (The 16th register) is used for flags
		this.Vbuffer = new ArrayBuffer(16);
		this.V = new Uint8Array(this.Vbuffer);
		//Create the stack, 16 16-bit entries
		this.Sbuffer = new ArrayBuffer(32);
		this.S = new Uint16Array(this.Sbuffer);
		//Initalize systems
		this.loadMem(memToLoad);
		this.loadDisp(displayOut);
		this.reset();
	} 

	reset() {
		//Clear all registers
		for (let i = 0; i < 16; i++) {
			this.V[i] = 0;
		}
		//The 16-bit index register
		this.I = 0;
		//The program counter register, starts execution at 0x200
		//Points to next instruction to execute
		this.PC = 0x200;
		//The stack pointer register
		this.SP = 0;
		//Clear the stack
		for (let i = 0; i < 16; i++) {
			this.S[i] = 0;
		}
		//The delay timer
		this.DT = 0;
		//The sound timer
		this.ST = 0;
		//The instruction register
		this.IR = this.Mem.read(this.PC);

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

	runInstruction(instruction) {
		//Instruction Decode
		this.instructionFunction = this.decodeInstruction(instruction);
		//Instruction Execute
		this.instructionFunction();
	}

	stepInstruction() {
		//Instruction Fetch
		this.IR = this.Mem.read(this.PC) << 8;
		this.IR |= this.Mem.read(this.PC+1);
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
	{0x1E: this.ADDi, 0x55: this.LDir, 0x65: this.LDri, nibbles: 2}
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
			if (typeof secondDecode != 'undefined') return secondDecode;
		}
		//For instructions with three opcode nibble
		else if (firstDecode.nibbles === 2) {
			let secondDecode = firstDecode[instruction & 0x00FF];
			if (typeof secondDecode != 'undefined') return secondDecode;
		}
		//Otherwise an invalid instruction has been reached
		//SYS which isnt implemented also counts as an invalid instruction
		return this.invalidInstruction;
	}

	invalidInstruction(){
		console.log('UHoh!');
	}

	//Actual instruction implementations
	SYS()	{/*Error WIP*/}
	CLS()	{this.Disp.clear();}
	//WIP ADJUST CALL STACK DEPTH
	RET()	{this.SP--; if (this.SP < 0){/*Error WIP*/}; this.PC = this.S[this.SP];}
	JPi()	{this.PC = this.nnn;}
	//WIP ADJUST CALL STACK DEPTH
	CALL()	{this.S[this.SP] = this.PC; this.SP++; if (this.SP > 15){/*Error WIP*/}; this.PC = this.nnn;}
	SEb()	{if (this.V[this.x] === this.kk) this.PC += 2;}
	SNEb()	{if (this.V[this.x] != this.kk) this.PC += 2;}
	SEr()	{if (this.V[this.x] === this.V[this.y]) this.PC += 2;}
	LDb()	{this.V[this.x] = this.kk;}
	ADDb()	{this.V[this.x] += this.kk;}
	LDr()	{this.V[this.x] = this.V[this.y];}
	OR()	{this.V[this.x] |= this.V[this.y];}
	AND()	{this.V[this.x] &= this.V[this.y];}
	XOR()	{this.V[this.x] ^= this.V[this.y];}
	//WIP ADD CARY FLAG
	ADDr()	{this.V[this.x] += this.V[this.y];}
	SUB()	{this.V[0xF] = 0; if (this.V[this.x] > this.V[this.y]) this.V[0xF] = 1; this.V[this.x] -= this.V[this.y];}
	//WIP ADD OPTIONS FOR CLASSIC SHIFT BEHAVIOR
	SHR()	{this.V[0xF] = (this.V[this.x] & 0x1); this.V[this.x] = this.V[this.x] >> 1;}
	SUBN()	{this.V[0xF] = 0; if (this.V[this.y] > this.V[this.x]) this.V[0xF] = 1; this.V[this.y] -= this.V[this.x];}
	//WIP ADD OPTIONS FOR CLASSIC SHIFT BEHAVIOR
	SHL()	{this.V[0xF] = (this.V[this.x] & 0x8) >> 8; this.V[this.x] = this.V[this.x] << 1;}
	SNEr()	{if (this.V[this.x] != this.V[this.y]) this.PC += 2;}
	LDi()	{this.I = this.nnn;}
	JPr()	{this.PC = this.nnn + this.V[0x0];}
	//WIP IMPLEMENT ACTUAL RANDOMNESS
	RND()	{this.V[this.x] = 60 & this.kk;}
	DRW()	{this.V[0xF] = this.Disp.drawSprite(this.V[this.x], this.V[this.y], this.n, this.I);}
	SKP()	{}
	SKNP()	{}
	LDrd()	{}
	LDrk()	{}
	LDdr()	{}
	LDsr()	{}
	ADDi()	{this.I += this.V[this.x]; this.I &= 0xFFF;}
	LDis()	{}
	LDbr()	{}
	LDir()	{}
	LDri()	{}
}