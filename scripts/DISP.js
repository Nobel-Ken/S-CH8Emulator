export default class DISPLAY {
	constructor(memToLoad, scale = 8) {
		//The display is a monochrome 1bpp 64x32 bitmap
		//This means one byte is 8 horizontal pixels
		//This means the screen is 8*32 bytes
		this.dispBuffer = new Array(256);
		this.foregroundColour = "#ffffff"
		this.backgroundColour = "#000000"
		//Display config flags: index = what value of true will enable
		//0 = Disable sprite wrap around  1 = Disable screen clear
		//2 = Disable collisions
		this.config = [false, false, false];
		this.updateScale(scale);
		this.loadMem(memToLoad);
		this.clear();
	}

	loadMem(memToLoad) {
		//Reference to memory to run from
		//Memory is a 4096 entry byte array
		this.Mem = memToLoad;
	}

	updateScale(scale) {
		//Reference to memory to run from
		//Memory is a 4096 entry byte array
		this.dispScale = scale;
	}

	//This code is VERY ugly and is only for the debug console output
	//WIP will fix soon
	//Pay no attention to it!
	consoleDisplayUpdate() {
		let finalOut = "";
		for (let y = 0; y < 32; y++) {
			let dispLine = "";
			for (let x = 0; x < 8; x++) {
				dispLine += this.dispBuffer[x + (y << 3)].toString(2).padStart(8, '0');
			}
			finalOut += "█";
			for (let i = 0; i < dispLine.length; i++) {
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

	//This code is VERY ugly as well, but it works!
	//WIP will fix soon
	//Pay no attention to it!
	canvasDisplayUpdate(canvasContext) {
		//Iterate through each row of pixels
		for (let y = 0; y < 32; y++) {
			//For each 8 pixel group (1 byte for 8 pixels)
			for (let x = 0; x < 8; x++) {
				//For each bit in the byte
				for (let b = 0; b < 8; b++) {
					//Mask correct bit and check if its set
					if ((this.dispBuffer[x + (y << 3)] & (0b10000000 >> b)) != 0) {
						//If it is, set foreground colour
						canvasContext.fillStyle = this.foregroundColour;
					} else {
						//Otherwise, set background colour
						canvasContext.fillStyle = this.backgroundColour;
					}
					//Draw pixel to the canvas
					canvasContext.fillRect(((x << 3) + b) * this.dispScale, y * this.dispScale, this.dispScale, this.dispScale);
				}
			}
		}
	}

	//Clears the screen buffer, pretty self explanatory how it works
	clear() {
		if (this.config[1]) return;
		for (let i = 0; i < 256; i++) {
			this.dispBuffer[i] = 0;
		}
	}

	//Draws a sprite to the screen buffer, returns 1 if it overdraws a pixel
	//x, y are positions of the sprite
	//count is how many lines the sprite takes up
	//addr is the memory address the sprite data is located at
	drawSprite(x, y, count, addr) {
		//Flag for if pixels are overdrawn
		let bitFlipped = 0;
		//If sprite wrapping is disabled, don't draw the sprite if-
		//its position is outside the screen area
		if (this.config[0] && x > 63) return;
		if (this.config[0] && y > 31) return;
		//xByteShift has the byte level x pos. of the sprite
		//xBitShift has the bit level x pos. (in the byte) of the sprite
		//Also allows only the lower 6 bits of the X pos to be used
		const xByteShift = (x & 0b111000) >> 3;
		const xBitShift = x & 0b111;
		//Only allow the lower 5 bits of the Y pos to be used
		y &= 0b11111;

		//Drawing the sprite itself, repeats for each sprite line
		//Remember, each pixel is 1 bit, but sprites are drawn byte wise
		//So if the X position is not a multiple of 8, the sprite drawn is not byte aligned
		//We can think of it then as drawing parts of the one sprite byte into 2 display bytes
		//We select what parts of the sprite byte to draw using bit-shifting
		for (let i = 0; i < count; i++) {
			//Calculate the address of the screen buffer to write too
			const displayAdr = xByteShift + ((y + i) << 3);
			//Check for pixel overdraw (using bit-wise AND)
			if ((this.dispBuffer[displayAdr] & (this.Mem.read(addr+i) >> xBitShift)) != 0) bitFlipped = 1;
			//Draw pixels to screen buffer (using bit-wise XOR)
			this.dispBuffer[displayAdr] ^= (this.Mem.read(addr+i) >> xBitShift);
			//We check if the next byte to draw is off-screen and skip drawing if it is
			//If its not we repeat the last 2 steps
			if ((xByteShift + 1) < 8) {
				if ((this.dispBuffer[displayAdr + 1] & (this.Mem.read(addr+i) << (8-xBitShift)) & 0xFF) != 0) bitFlipped = 1;
				this.dispBuffer[displayAdr + 1] ^= ((this.Mem.read(addr+i) << (8-xBitShift)) & 0xFF);
			}
		}
		//If collisions are off, return 0 (no overdraw aka no collisions)
		if (this.config[2]) return 0;
		//Otherwise return overdraw flag
		return bitFlipped;
	}
}