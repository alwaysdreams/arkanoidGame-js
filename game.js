var game = {
	ctx: undefined,
	width: 640,
	height: 640,
	isRunning: true,
	score: 0,
	platform: undefined,
	ball : undefined,
	block: undefined,
	cols: 7, 
	rows: 3,
	blocks: [],
	sprite: {
		background: undefined,
		platform: undefined,
		ball: undefined,
		block: undefined
	},
	init: function() {
		var canvas = document.getElementById("myCanvas");
		this.ctx = canvas.getContext("2d");

		this.ctx.font = "30px Arial";
		this.ctx.fillStyle = "#FFFFFF";
		this.isRunning = true;

		this.initKeyDown();
	},
	initKeyDown: function() {
		window.addEventListener("keydown", function(e) {
			if (e.keyCode === 37) {
				game.platform.dx = -game.platform.velocity;
			} else if (e.keyCode === 39) {
				game.platform.dx = game.platform.velocity;
			} else if (e.keyCode === 32) {
				game.platform.releaseBall();
			}
		});

		window.addEventListener("keyup", function(e) {
			game.platform.stop();
		});
	},
	load: function() {
		for (var key in this.sprite) {
			this.sprite[key] = new Image();
			this.sprite[key].src = "image/" + key + ".png";
		}
	},
	create: function() {
		for (var row = 0; row < this.rows; row++) {
			for (var col = 0; col < this.cols; col++) {
				this.blocks.push({
					x: 85*col + 20,
					y: 45*row + 10,
					width: 80,
					height: 40,
					isAlive: true
				});
			}	
		}
	},
	start: function(needInit) {
		if (needInit) {
			this.init();
			this.load();
		}
		this.create();
		this.run();
	},
	render: function() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctx.drawImage(this.sprite.background, 0, 0);
		this.ctx.drawImage(this.sprite.platform, this.platform.x, this.platform.y);

		this.blocks.forEach(function(item) {
			if (item.isAlive) {
				this.ctx.drawImage(this.sprite.block, item.x, item.y);
			}
		}, this);

		this.ctx.drawImage(this.sprite.ball, this.ball.x, this.ball.y);
		this.ctx.fillText("SCORE: " + this.score, 10, this.height - 20);
	},
	update: function() {
		if (this.ball.collide(this.platform)) {
			this.ball.bumpPlatform(this.platform);
		}

		if (this.platform.dx) {
			this.platform.move();
		}

		if (this.ball.dx && this.ball.dy) {
			this.ball.move();
		}

		this.blocks.forEach(function(block) {
			if (block.isAlive) {
				if (this.ball.collide(block)) {
					this.ball.bumpBlock(block);
				}
			}
		}, this);

		this.ball.checkBounds();
	},
	run: function() {
		this.update();
		this.render();

		if (this.isRunning) {
			window.requestAnimationFrame(function() {
				game.run();
			});
		}
	}, 
	over: function(result) {
		this.isRunning = false;
		var message = `You ${result} with score: ${this.score}`;
		alert(message);
		this.ball.x = this.ball.y = 0;
		this.start(false);
	}
};

game.ball = {
	width: 15,
	height: 15,
	x: 303,
	y: 484,
	velocity: 5,
	dx: 0,
	dy: 0,
	jump: function() {
		this.dx = this.velocity; 
		this.dy = -this.velocity; 
	},
	move: function() {
		this.x += this.dx/2;
		this.y += this.dy;
	},
	collide: function(block) {
		var x = this.x + this.dx;
		var y = this.y + this.dy;

		if (x + this.width > block.x && x < block.x + block.width &&
			y + this.height > block.y && y < block.y + block.height) {
			return true;
		}
		return false;
	},
	checkBounds: function() {
		var x = this.x + this.dx;
		var y = this.y + this.dy;

		if (x <= 0) {
			this.x = 0;
			this.dx = this.velocity;
		} else if (x + this.width >= game.width) {
			this.x = game.width - this.width;
			this.dx = -this.velocity;
		} else if (y <= 0) {
			this.y = 0;
			this.dy = this.velocity;
		} else if (y + this.height >= game.height) {
			game.over("lose");
		}
	},
	bumpBlock: function(block) {
		this.dy *= -1;
		block.isAlive = false;
		game.score++;

		if (game.score === game.blocks.length) {
			game.over("win");
		}
	},
	isOnLeftSide: function(platform) {
		 return this.x + this.width / 2 < platform.x + platform.width / 2;
	},
	bumpPlatform: function(platform) {
		this.dy = -this.velocity;
		this.dx = this.isOnLeftSide(platform) ? -this.velocity : this.velocity;
	}
};

game.platform = {
	width: 100,
	height: 25,
	x: 260,
	y: 500, 
	velocity: 5,
	dx: 0,
	ball: game.ball,
	releaseBall: function() {
		this.ball.jump();
		this.ball = false;  
	},
	move: function() {
		this.x += this.dx;

		if (this.ball) {
			this.ball.x += this.dx;
		}
	},
	stop: function() {
		this.dx = 0;

		if (this.ball) {
			this.ball.dx = 0;
		}
	}
};

window.addEventListener("load", function() {
	game.start(true);
});