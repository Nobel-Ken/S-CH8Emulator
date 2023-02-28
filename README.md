# yetAnother CHip8 Emulator
## About
yetAnother is a Chip8 emulator I wrote to learn both JavaScript and how to write basic emulators. The main emulation files are in ./scripts/ with the three main ones being named CPU.js, MEM.js and DISP.js. CPU emulation uses a function reference table to make the decoding stage fast (compared to using the switch case statements found in most Chip8 emulators) and the emulator is written to be as modular as possible, so you can integrate it into your own pages. It can output to either the console (using block charachters) or to a HTML canvas and audio is handled by the Web Audio API.

This is my first time writing JavaScript (I'm normally a C/ASM type of guy!) so I apologize for the slightly messy code and the extreme excess of bitwise operations 😊!

## How to Use
You can visit (inset link here) to try the emulator out for yourself. I've included some built in roms on the page so you can try it out instantly! You will need to be on a computer however in order to control the games (which use your keyboard as input).

## Recources Used
I used the following recources while writing my emulator:
### Cowgods Chip8 Technical Reference
http://devernay.free.fr/hacks/chip8/C8TECH10.HTM#Fx29 
### Revival Studios Chip8 Rom Pack
https://github.com/kripod/chip8-roms
### Corax89's Test Rom
https://github.com/corax89/chip8-test-rom
### Skosulor's Test Rom
https://github.com/Skosulor/c8int/tree/master/test