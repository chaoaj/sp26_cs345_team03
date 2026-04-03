let spriteSheet;
let playerX = 100;
let frameHeight = 320;
let frameWidth = 320;
let drawSize = 100;
let currentFrame = 0;
let facingLeft = false;
let moveFrameIndex = 0;
let animTimer = 0;

let velY = 0;
let playerY;
let groundY;
const gravity = 0.6;
const jumpForce = -14;
let onGround = false;

const classes = {
    Mage: {
        sheet: "sprites/sprint2/mage_class_320x320.png"
    },
    Melee: {
        sheet: "sprites/sprint2/melee_class_320x320.png"
    }
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    groundY = height - drawSize;
    playerY = groundY;
}

function preload() {
    spriteSheet = loadImage("sprites/sprint2/melee_class_320x320.png");
}

function draw() {
    background(0);


    let moving = false;
    if (keyIsDown(68)) { playerX += 5; moving = true; facingLeft = false; } // D
    if (keyIsDown(65)) { playerX -= 5; moving = true; facingLeft = true; } // A


    velY += gravity;
    playerY += velY;

    if (playerY >= groundY) {
        playerY = groundY;
        velY = 0;
        onGround = true;
    } else {
        onGround = false;
    }


    if (!onGround) {
        currentFrame = 1;
    } else if (moving) {
        animTimer++;
        if (animTimer % 8 === 0) moveFrameIndex = (moveFrameIndex + 1) % 3;
        currentFrame = 2 + moveFrameIndex;
    } else {
        currentFrame = 0;
        moveFrameIndex = 0;
        animTimer = 0;
    }

    let sx = currentFrame * frameWidth;

    push();
    if (facingLeft) {
        translate(playerX + drawSize, playerY);
        scale(-1, 1);
        image(spriteSheet, 0, 0, drawSize, drawSize, sx, 0, frameWidth, frameHeight);
    } else {
        image(spriteSheet, playerX, playerY, drawSize, drawSize, sx, 0, frameWidth, frameHeight);
    }
    pop();
}

function keyPressed() {
    if (key === 'w' && onGround) {
        velY = jumpForce;
    }
}
