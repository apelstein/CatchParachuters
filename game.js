const winWidth = 800;
const winHeight = 550;
const scoreBox =  new Rectangle(30, 50);
const boat = new Rectangle(180, 100);
const sea =  new Rectangle(winWidth, 120);
const plane = new Rectangle(120, 95);
const parachuter = new Rectangle(60, 100);
const seaBoatDelta = 30;
const parachuterBoatDeltaX = 15;
const parachuterBoatDeltaY = 10;
const parachuterSeaDeltaX = 15;
const parachuterSeaDeltaY = seaBoatDelta;
const scoreIndex = 0;
const seaIndex = 1;
const planeIndex = 2;
const boatIndex = 3;
const parachuterIndex = 4;

var score = 0;
var lives = 3;
var droppingPoint = winWidth - plane.width;
var components = [];

var myGameArea = {
	canvas : document.createElement("canvas"),
	start : function() {
		this.canvas.width = winWidth;
		this.canvas.height = winHeight;
		this.canvas.style.minWidth = winWidth;
		this.canvas.style.minHeight = winHeight;
		this.canvas.style.display = "inline-block";
		this.canvas.style.border = "1px solid blue";
		this.canvas.style.backgroundColor = "white";
		this.context = this.canvas.getContext("2d");
		this.frameNo = 0;
		document.body.style.textAlign = "center";
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(updateGameArea, 20);
		window.addEventListener('keydown', onKeydown);
		window.addEventListener('keyup', onKeyup);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	destroy: function() {
		clearInterval(this.interval);
	}
}

function startGame() {
	window.removeEventListener('keypress', onKeypressed);
	initState();
	myGameArea.start();
	components.push(new TextComponent(scoreBox, 0, winHeight * 2/5, 'scorecomp'));
	components.push(new PictureComponent(sea, 0, winHeight-sea.height, 'sea.png'));
	components.push(new MovingComponent(plane,winWidth-plane.width, 0, -1, 0, "plane.png"));
	components.push(new MovingComponent(boat, winWidth-boat.width,
		 winHeight - plane.height - sea.height + seaBoatDelta, 0, 0, "boat.png"));
}

function endGame() {
	myGameArea.clear();
	components = [];
	components.push(new TextComponent(scoreBox, (winWidth-8*scoreBox.width)/2, (winHeight-3*scoreBox.height)/2, 'gameover'));
	window.removeEventListener('keydown', onKeydown);
	window.removeEventListener('keyup', onKeyup);
	window.addEventListener('keypress', onKeypressed)
	myGameArea.destroy();
}

function initState() {
	components = [];
	score = 0;
	lives = 3;
	droppingPoint = updateDroppingPoint(droppingPoint);
}

function onKeypressed(e){
	if(e.keyCode === 13) {
		startGame();
	}
}

function onKeydown(e) {
	myGameArea.key = e.keyCode;
}

function onKeyup(e) {
	myGameArea.key = false;
}

function updateDroppingPoint(oldPoint) {
	let newPoint = oldPoint - 1;
	while(oldPoint - parachuter.width < newPoint && newPoint < oldPoint) {
		newPoint = Math.floor(Math.random() * (winWidth - parachuter.width));
	}
	return newPoint;
}

function checkCollision(parachuter, boat, deltaX, deltaY) {
	return boat.x - parachuter.width + deltaX < parachuter.x 
			&& parachuter.x < boat.x + boat.width + parachuter.width -deltaX
			&& boat.y - parachuter.height + deltaY < parachuter.y 
			&& parachuter.y < boat.y + 3 * deltaY ; 
}

function updateGameArea() {
	myGameArea.clear();
	let indexToDelete = [];
	if(components[parachuterIndex]){
		for(let i = parachuterIndex; i < components.length; i++) {
			if(checkCollision(components[i], components[boatIndex], parachuterBoatDeltaX, parachuterBoatDeltaY)){
				score += 10;
				indexToDelete.push(i);
			} else if(checkCollision(components[i], components[seaIndex], parachuterSeaDeltaX, parachuterSeaDeltaY)) {
				lives -= 1;
				if(lives === 0){
					indexToDelete = [];
					endGame();
				}
				indexToDelete.push(i);
			}
		}
	}
	if(components.length > 1) {
		for(let index of indexToDelete) {
			components.splice(index, 1);
		}
		if (myGameArea.key && myGameArea.key == 37) {
			components[boatIndex].xSpeed += -1;
			// myGameArea.key = false; 
		}
		if (myGameArea.key && myGameArea.key == 39) {
			console.log(components[boatIndex].xSpeed);
			components[boatIndex].xSpeed += 1;
			// myGameArea.key = false; 
		}
		if(!myGameArea.key) {
			components[boatIndex].xSpeed = 0;	
			// components[boatIndex].xSpeed = Math.floor(components[boatIndex].xSpeed/2);
		}
		if(components[planeIndex].x === droppingPoint) {
			components.push(new MovingComponent(parachuter, droppingPoint, plane.height, 0, 1, "parachutist.png"));
			droppingPoint = updateDroppingPoint(droppingPoint);
		} else if (components[planeIndex].x === -plane.width){
			components[planeIndex].x = winWidth;
		}
	}

	for(let i = 0; i<components.length; i++){
		if(components[i].newPos) {
			components[i].newPos();
		}
		components[i].update();
	}
}

function Rectangle(width, height){
	this.width = width;
	this.height = height;
}

function MovingComponent(rectangle, x, y, xSpeed, ySpeed, src){
	var component = new PictureComponent(rectangle, x, y, src);
	component.xSpeed = xSpeed;
	component.ySpeed = ySpeed;
	component.newPos = function() {
		this.x += this.xSpeed;
		this.y += this.ySpeed;
	}
	return component;
}

function PictureComponent(rectangle, x, y, src) {
	var component = new Component(rectangle, x, y);
	component.image = new Image();
	component.image.src = src;
	component.update = function() {
		ctx = myGameArea.context;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
	return component;
}

function TextComponent(rectangle, x, y, type){
	var component = new Component(rectangle, x, y);
	component.update = function() {
		ctx = myGameArea.context;
		ctx.font = this.width.toString() + "px Arial";
		if(type === 'gameover'){
			ctx.fillText("Game Over!", this.x, this.y);
			ctx.fillText('score: ' + score.toString(), this.x, this.y + this.height);
			ctx.fillText('press Enter to restart' , this.x, this.y + 2 * this.height);
		} else {
			ctx.fillText('Score: ' + score.toString(), this.x, this.y);
			ctx.fillText('Lives: ' + lives.toString(), this.x, this.y + this.height);
		}	
		
	}
	return component;
}

function Component(rectangle, x, y) {
	this.width = rectangle.width;
	this.height = rectangle.height;
	this.x = x;
	this.y = y; 
}

startGame();