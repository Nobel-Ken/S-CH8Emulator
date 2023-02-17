export default class DISPLAY {

	constructor(memToLoad) {
		//The display is a monochrome 1bpp 64x32 bitmap
		//This means one byte is 8 horizontal pixels
		//This means the screen is 8*32 bytes
		this.dispBuffer = new Array(256);
		this.loadMem(memToLoad);
		this.clear();
	}

	loadMem(memToLoad) {
		//Reference to memory to run from
		//Memory is a 4096 entry byte array
		this.Mem = memToLoad;
	}

	consoleDisplayUpdate() {
		let finalOut = "";
		for (let y = 0; y < 32; y++){
			let dispLine = "";
			for (let x = 0; x < 8; x++){
				dispLine += this.dispBuffer[x+(y*8)].toString(2).padStart(8, '0');
			}
			let blockLine = "█";
			for (let i = 0; i < dispLine.length; i++){
				if(dispLine[i] == 0) {
					//blockLine += '░░';
					blockLine += '  ';
				}
				else {
					blockLine += '██';
				}
			}
			finalOut += (blockLine + '█'  +'\n')
		}
		console.log(finalOut);
	}

	canvasDisplayUpdate() {

	}

	clear() {
		for (let i = 0; i < 256; i++){
			this.dispBuffer[i] = 0;
		}
	}

	drawSprite(x, y, count, addr) {
		let bitFlipped = false;
		let xByteShift = (x & 0b111000) >> 3
		let xBitShift = x & 0b111

		for (let i = 0; i < count; i++){
			this.dispBuffer[xByteShift+((y+i)*8)] ^= (this.Mem.read(addr+i) >> xBitShift);
			if (xByteShift+1 < 8) {
				this.dispBuffer[xByteShift+((y+i)*8)+1] ^= ((this.Mem.read(addr+i) << (8-xBitShift)) & 0xFF);
			}
		}

		return bitFlipped;
	}
}