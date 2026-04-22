let entities = [];
let entityCount = 0;

//Function for methods that change in discrete steps over time
//Example: a fireball moving or chars for dialogue to be added to text
function frameCalls() {

  for (i = 0; i < entityCount; i++) {
    if (entities[i].isAlive()) {
        entities[i].frameChange();
    } else {
        if (entityCount == 1) {
            entities = [];
            entityCount = 0;
        } else {
            entities[i] = entities[entityCount - 1];
            entityCount--;
        }
    }
  }

}

//interface for entities updated by frameCalls()
class Entity {
    constructor() {

        if (this.constructor === Entity) {
            throw new Error("Entity is an interface, cannot construct.")
        }
        if (entities.length <= entityCount) {
            entities.push(this)
        } else {
            entities[entityCount] = this;
        }
        entityCount++;

    }

    //check if the entity should be destroyed this frame or not
    isAlive() {
        throw new Error("Must be implemented.")
    }

    //performs whatever change will be made
    frameChange() {
        throw new Error("Must be implemented.")
    }


}
class Dialogue extends Entity {
    
    constructor(fullText, startText = "", lastLine = true) {
        super();
        if (fullText.length <= 0) {
            throw new Error("Text is empty or invalid.")
        }
        this.fullText = fullText;
        this.outText = startText;
        this.startLen = this.outText.length
        this.finished = false;
        isDialogue = true;
        nextDialogueReady = false;
        this.letterIndex = 0;
        this.lastLine = lastLine;
    }

    isAlive() {
        if (this.finished && entityWaitingForMouse == 1) {
            entityWaitingForMouse = -1;
            if (this.lastLine) {
                isDialogue = false;
            } else {
                nextDialogueReady = true;
                printDialogue(currDiaFile[nextDiaLine], nextDiaLine)
            }
            
            return false;
        }
        return true;
    }
    frameChange() {
        
        if (!(this.finished)) {
            this.outText += this.fullText[this.letterIndex]
            this.letterIndex++;
        }
        if (this.outText.length == this.fullText.length + this.startLen) {
            this.finished = true;
            entityWaitingForMouse = 0;
        }
    }
    getText() {
        return this.outText;
    }
}

//class describing enemies
class Enemy extends Entity {

    //making a new enemy, will either be 'sml' , 'med', or 'lar' for size
    constructor(enemy_type) {
        super();
        this.health = 100;
        this.setSprites(enemy_type);
        this.type = enemy_type;
        this.state = "walking";
        this.scale = 1 / 6;
        this.enemy_frame = 0;
        this.direction = "R";
        this.onGround = false;

        this.x = 100;
        this.y = 100;
        this.xVel = 0;
        this.yVel = 1;
    }

    isAlive() {
        return this.health > 0;
    }

    frameChange() {
        this.enemy_frame += 0.13;
        if (gameState === "introLevel") {
            this.load_enemies();
            this.move_ya_body();
            this.intelligence();
        }
    }

    setSprites(type) {
        switch (type) {
            case "sml":
                this.sprite_info = {
                    "sheet": "/sprites/sprint_1/small_enemy_320x320.png",
                    "walk_start": 2,
                    "walk_end": 9,
                    "jump": 1,
                    "atk_sheet": "/sprites/sprint_1/small_enemy_atk_400x400.png",
                    "atk_start": 0,
                    "atk_end": 5
                }
                this.health = 10;
                break;
            case "med":
                this.sprite_info = {
                    "sheet": "/sprites/sprint_1/medium_enemy_400x400.png",
                    "walk_start": 2,
                    "walk_end": 12,
                    "jump": 1,
                    "atk_sheet": "/sprites/sprint_1/medium_enemy_atk_580x400.png",
                    "atk_start": 0,
                    "atk_end": 11
                }
                this.health = 20;
                break;
            case "lar":
                this.sprite_info = {
                    "sheet": "/sprites/sprint_1/large_enemy.png",
                    "walk_start": 2,
                    "walk_end": 10,
                    "jump": 1,
                    "atk_sheet": "/sprites/sprint_1/large_enemy_atk_800x700.png",
                    "atk_start": 0,
                    "atk_end": 7
                }
                this.health = 30;
                break;
        }
        this.img0 = loadImage(this.sprite_info["sheet"]);
        this.img1 = loadImage(this.sprite_info["atk_sheet"]);
    }

    load_enemies() {
        switch (this.state) {
            case "walking":
                if (this.direction == "R") {
                    image(
                        this.img0, //image
                        this.x, //x
                        this.y, //y
                        320 * this.scale, //img h
                        320 * this.scale, //img w
                        320 * floor(this.enemy_frame),
                        0,
                        320,
                        320
                    )
                } else {
                    push();
                    translate(320,0);
                    scale(-1, 1);
                    image(
                        this.img0, //image
                        this.x, //x
                        this.y, //y
                        320 * this.scale, //img h
                        320 * this.scale, //img w
                        320 * floor(this.enemy_frame),
                        0,
                        320,
                        320
                    )
                    pop();
                }

                if (this.enemy_frame > this.sprite_info["walk_end"]) {
                    this.enemy_frame = this.sprite_info["walk_start"];
                }

                break;
            case "jumping":
                //bow
                if (this.direction == "R") {
                    image(
                        this.img0, //image
                        this.x, //x
                        this.y, //y
                        320 * this.scale, //img h
                        320 * this.scale, //img w
                        320 * floor(this.enemy_frame),
                        0,
                        320,
                        320
                    )
                } else {
                    push();
                    translate(320,0);
                    scale(-1, 1);
                    image(
                        this.img0, //image
                        this.x, //x
                        this.y, //y
                        320 * this.scale, //img h
                        320 * this.scale, //img w
                        320 * 1,
                        0,
                        320,
                        320
                    )
                    pop();
                }

                this.enemy_frame = this.sprite_info["jump"];

                break;
            case "attack":
                //bow
                if (this.direction == "R") {
                    image(
                        this.img1, //image
                        this.x, //x
                        this.y, //y
                        400 * this.scale, //img h
                        400 * this.scale, //img w
                        400 * floor(this.enemy_frame),
                        0,
                        400,
                        400
                    )
                } else {
                    push();
                    translate(320,0);
                    scale(-1, 1);
                    image(
                        this.img1, //image
                        this.x, //x
                        this.y, //y
                        400 * this.scale, //img h
                        400 * this.scale, //img w
                        400 * floor(this.enemy_frame),
                        0,
                        400,
                        400
                    )
                    pop();
                }

                if (this.enemy_frame > this.sprite_info["atk_end"]) {
                    this.enemy_frame = this.sprite_info["atk_start"];
                }

                break;
        }
        
    }

    move_ya_body() {

        this.yVel += gravity;

        // if (this.y >= groundY) {
        //     this.y = groundY;
        //     this.yVel = 0;
        //     this.onGround = true;
        // } else {
        //     this.onGround = false;
        //     this.state = "jump";
        // }

        if (this.y >= groundY + 25) {
            this.y = groundY + 25;
            this.yVel = 0;
            this.onGround = true;
            this.state = "walking";
        } else {
            this.onGround = false;
            this.state = "jumping";
        }
        this.y += this.yVel
        this.x += this.xVel
    }

    intelligence () {
        if (playerX - cameraX > this.x) {
            this.xVel = 3;
            this.direction = "R";
        } else {
            this.xVel = -3;
            //this.direction = "L";

        }

    }

}