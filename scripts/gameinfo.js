//Game info to be put in the "about game" panel.
//Fun tid-bit is that all the descriptions here were written by ChatGPT :) (with minor edits)
export const gameInfo = {
Tetris:   `Tetris: You manipulate falling shapes called "tetrominoes" to create complete lines, which then disappear and earn you points. The game speeds up over time, challenging you to think quickly and react fast.
			Q: Rotate Piece
			W: Move Left
			E: Move Right
			A: Drop Piece`,
SpaceInvaders: `Space Invaders: You control a spaceship at the bottom of the screen, shooting at rows of alien invaders as they slowly advance downward. The goal is to defeat all the aliens before they reach your ship.
			W: Start/Shoot
			Q: Move Left
			E: Move Right`,
Landing:  `Lunar Lander: You control a spacecraft as it tries to land safely on a platform, navigating around obstacles and using thrusters to slow down or change direction. Your goal is to land without crashing or running out of fuel.
			1, 2, 3: Select Game Mode (On Main Menu)
			2: Thrust Up
			Q: Thrust Left
			E: Thrust Right`,
Pong: 	  `Pong: You control a paddle and must hit a ball back and forth across the screen, trying to score points by making the ball go past the computer's paddle.
			1: Move Up
			Q: Move Down`,
Pong2: 	  `Pong (2 player): You control a paddle and must hit a ball back and forth across the screen, trying to score points by making the ball go past your opponent's paddle.
			1: PLAYER1 Move Up
			Q: PLAYER1 Move Down
			4: PLAYER2 Move Up
			R: PLAYER2 Move Down`,
Breakout: `Breakout: You control a paddle and a ball, and your objective is to break all the bricks at the top of the screen by bouncing the ball off the paddle and hitting the bricks. Each brick that you destroy earns you points, and the game ends when all bricks are gone or you run out of lives.
			Q: Move Left
			E: Move Right`,
TicTacToe:`TicTacToe: You play on a 3x3 grid, taking turns with another player to place Xs or Os in empty squares. The goal is to get three of your symbols in a row horizontally, vertically, or diagonally, while also blocking your opponent from doing the same. The game ends in a tie if the board is filled with no winner.
			Press these keys to mark the corresponding box
			①②③
			ⓆⓌⒺ
			ⒶⓈⒹ`,
Astrododge: `Astrododge: You control a spaceship as asteroids come barrelling towards you. Avoid the asteroids to gain points and play for a high-score.
			W: Start
			2: Move Up
			S: Move Down
			Q: Move Left
			E: Move Right`,
Uploaded: `
			Controls
			These Keyboard Keys-
			--------------------
			①②③④
			ⓆⓌⒺⓇ
			ⒶⓈⒹⒻ
			ⓏⓍⒸⓋ
			Map To these Chip8 Keys-
			------------------------
			①②③Ⓒ
			④⑤⑥Ⓓ
			⑦⑧⑨Ⓔ
			Ⓐ⓪ⒷⒻ`,
};

//Emulation speed multiplier for each built in game
export const gameSpeed = {
	Tetris: 30,
	SpaceInvaders: 30,
	Landing: 10,
	Pong: 10,
	Pong2: 10,
	Breakout: 10,
	TicTacToe: 20,
	Astrododge: 20,
}