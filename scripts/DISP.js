export default class DISPLAY {

	constructor(memToLoad) {
		//The display is a monochrome 1bpp 64x32 bitmap
		//This means one byte is 8 horizontal pixels
		//This means the screen is 8*32 bytes
		this.dispBuffer = new Array(256);
		//The value used to integer scale the canvas output
		this.dispScale = 8;
		this.loadMem(memToLoad);
		this.clear();
	}

	loadMem(memToLoad) {
		//Reference to memory to run from
		//Memory is a 4096 entry byte array
		this.Mem = memToLoad;
	}

	//This code is VERY ugly and is only for the debug console output
	//WIP will fix soon
	//Pay no attention to it!
	consoleDisplayUpdate() {
		let finalOut = "";
		for (let y = 0; y < 32; y++){
			let dispLine = "";
			for (let x = 0; x < 8; x++){
				dispLine += this.dispBuffer[x + (y * 8)].toString(2).padStart(8, '0');
			}
			finalOut += "█";
			for (let i = 0; i < dispLine.length; i++){
				if(dispLine[i] == '0') {
					//blockLine += '░░';
					finalOut += '  ';
				} else {
					finalOut += '██';
				}
			}
			finalOut += '█'  +'\n'
		}
		console.log(finalOut);
	}

	//This code is VERY ugly aswell, but it works!
	//WIP will fix soon
	//Pay no attention to it!
	canvasDisplayUpdate(ctx) {
		for (let y = 0; y < 32; y++) {
			for (let x = 0; x < 8; x++) {
				for (let b = 0; b < 8; b++) {
					if ((this.dispBuffer[x + (y * 8)] & (0b10000000 >> b)) != 0){
						ctx.fillStyle = "rgb(0, 0, 0)";
					} else {
						ctx.fillStyle = "rgb(255, 255, 255)";
					}
					ctx.fillRect(((x << 3) + b) * this.dispScale, y * this.dispScale, this.dispScale, this.dispScale);
				}
			}
		}
	}

	clear() {
		for (let i = 0; i < 256; i++){
			this.dispBuffer[i] = 0;
		}
	}

	drawSprite(x, y, count, addr) {
		let bitFlipped = 0;
		let xByteShift = (x & 0b111000) >> 3
		let xBitShift = x & 0b111

		for (let i = 0; i < count; i++){
			let displayAdr = xByteShift + ((y + i) * 8);
			if ((this.dispBuffer[displayAdr] & (this.Mem.read(addr+i) >> xBitShift)) != 0) bitFlipped = 1;
			this.dispBuffer[displayAdr] ^= (this.Mem.read(addr+i) >> xBitShift);
			if ((xByteShift + 1) < 8) {
				if ((this.dispBuffer[displayAdr + 1] & (this.Mem.read(addr+i) << (8-xBitShift)) & 0xFF) != 0) bitFlipped = 1;
				this.dispBuffer[displayAdr + 1] ^= ((this.Mem.read(addr+i) << (8-xBitShift)) & 0xFF);
			}
		}
		return bitFlipped;
	}
}