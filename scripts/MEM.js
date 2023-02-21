export default class MEMORY {

	constructor() {
		//Buffer to store memory state
		this.memBuffer = new ArrayBuffer(4096);
		this.memView = new Uint8Array(this.memBuffer);
		this.loadFonts();
	}

	loadRom(romToLoad) {
		//Load fonts into memory buffer
		let romView = new Uint8Array(romToLoad);
		for (let i = 0; i < romToLoad.byteLength; i++){
			this.memView[i + 512] = romView[i];
		}
		this.loadFonts();
	}

	loadFonts() {
		for (let i = 0; i < 80; i++){
			this.memView[i] = MEMORY.ogFontTable[i];
		}
	}

	clearMem() {
		//Fill memory buffer with 0's
		for(let i = 0; i < 4096; i++){
			this.memView[i] = 0;
		}
	}

	read(address) {
		//Return value at a memory location
		//Keep only the bottom 12 bits of address-
		//to prevent it from overflowing
		return(this.memView[address & 0xFFF]);
	}

	write(address, value) {
		//Write a value at a memory location
		//Keep only the bottom 12 bits of address-
		//to prevent it from overflowing
		//Value to write is also masked to fit in the 1 byte space
		this.memView[address & 0xFFF] = (value & 0xFF);
	}

	static ogFontTable = [
		0xF0, 0x90, 0x90, 0x90, 0xF0, //0
		0x20, 0x60, 0x20, 0x20, 0x70, //1
		0xF0, 0x10, 0XF0, 0x80, 0xF0, //2
		0xF0, 0x10, 0xF0, 0x10, 0xF0, //3
		0x90, 0x90, 0xF0, 0x10, 0x10, //4
		0xF0, 0x80, 0xF0, 0x10, 0xF0, //5
		0xF0, 0x80, 0xF0, 0x90, 0xF0, //6
		0xF0, 0x10, 0x20, 0x40, 0x40, //7
		0xF0, 0x90, 0xF0, 0x90, 0xF0, //8
		0xF0, 0x90, 0xF0, 0x10, 0xF0, //9
		0xF0, 0x90, 0xF0, 0x90, 0x90, //A
		0xE0, 0x90, 0xE0, 0x90, 0xE0, //B
		0xF0, 0x80, 0x80, 0x80, 0xF0, //C
		0xE0, 0x90, 0x90, 0x90, 0xE0, //D
		0xF0, 0x80, 0xF0, 0x80, 0xF0, //E
		0xF0, 0x80, 0xF0, 0x80, 0x80  //F
	]
}