export default class MEMORY {

	constructor() {
		//Buffer to store memory state
		this.memBuffer = new ArrayBuffer(4096);
		this.memView = new Uint8Array(this.memBuffer);
	}

	loadRom(romToLoad) {
		//Check if rom will overflow buffer, return if it does
		if(romToLoad.byteLength > 3584){
			return false;
		}
		//Load rom into memory buffer
		let romView = new Uint8Array(romToLoad);
		for (let i = 0; i < romToLoad.byteLength; i++){
			this.memView[i+512] = romView[i];
		}
		return true;
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
}