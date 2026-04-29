let entities = [];
let entityCount = 0;

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

//Function for methods that change in discrete steps over time
//Example: a fireball moving or chars for dialogue to be added to text
function frameCalls() {

  for (i = 0; i < entityCount; i++) {
    if (entities[i].isAlive()) {
        if (!(isDialogue)) {
            entities[i].frameChange();
        } else if (entities[i].constructor === Dialogue) {
            entities[i].frameChange();
        }
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
            } else if (isDialogue) {
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
        this.enemy_frame = 0;
        this.direction = "R";
        this.onGround = false;

        this.x = 100; //spawn location
        this.y = 100; // spawn location
        this.xVel = 0; 
        this.yVel = 0; 
        this.ableToJump;

        this.spawnedIn = false;

        //im ngl this is the stupidest variable 
        //i just dont like using AI cuz its bad
        //for the environment
        //so excuse this bad code
        this.deathJump = -5;
    }

    //self explanatory
    isAlive() {
        if (this.health <= 0) {
            this.health = 0;
            this.yVel = this.deathJump;
            this.y += this.yVel;
            this.state = "jumping";
            this.deathJump += 0.1;
            this.deathJump = constrain(this.deathJump, -5, 0.1)
            //maps the change in y to the change in opacity
            tint(255, map(this.deathJump, -5, 0, 255, 0, true));
            this.drawHealthBar();
            // if (this.y < 0 - this.sprite_info["sprite_size"][1]) {
            //     return false;
            // }
            if (this.deathJump > 0) {
                tint(255, 255);
                return false;
            }
        }
        return true;
    }

    //moves frame and then if game is not in the menu then will activate
    frameChange() {

        this.enemy_frame += 0.13;
        
        if (gameState === "introLevel" && this.spawnedIn && this.isAlive()) {
            this.load_enemies();
            this.moveAndJumpAndGravity();
            this.intelligence();
            this.processHealth();
            tint(255,255);
        }

        if (playerX > worldWidth - drawSize - 500) {
            this.spawnedIn = true;
        }
    }

    //okay so sprite_info is the dictionary that holds the info
    //for each type of enemy (sml, med, lar) so whenver something,
    //related to the sprite is mentioned, sprite_info is referenced
    setSprites(type) {
        switch (type) {
            case "sml":
                this.sprite_info = {
                    "sheet": "sprites/sprint_1/small_enemy_320x320.png", //img path
                    "walk_start": 2, //walk frame start
                    "walk_end": 9, //walk frame end
                    "walk_speed": 4,
                    "jump": 1, //jump frame
                    "atk_sheet": "sprites/sprint_1/small_enemy_atk_400x400.png", //img path
                    "atk_start": 0, //atk frame start
                    "atk_end": 5, //atk frame end
                    "sprite_size": [320, 320], //w, h
                    "walk_pos_delta": -30, //fix walking pos
                    "atk_sprite_size": [400,400], //w, h of atk
                    "atk_pos_delta": -15, //fix atk pos
                    "scale": 1/6
                }
                this.health = 10;
                this.maxHealth = 10;
                this.ableToJump = true;
                break;
            case "med":
                this.sprite_info = {
                    "sheet": "sprites/sprint_1/medium_enemy_400x400.png",
                    "walk_start": 2,
                    "walk_end": 12,
                    "walk_speed": 3,
                    "jump": 1,
                    "atk_sheet": "sprites/sprint_1/medium_enemy_atk_580x400.png",
                    "atk_start": 0,
                    "atk_end": 11,
                    "sprite_size": [400,400],
                    "walk_pos_delta": -5,
                    "atk_sprite_size": [580, 400],
                    "atk_pos_delta": -5,
                    "scale": 1/5
                }
                this.health = 20;
                this.maxHealth = 20;
                this.ableToJump = true;

                break;
            case "lar":
                this.sprite_info = {
                    "sheet": "sprites/sprint_1/large_enemy.png",
                    "walk_start": 2,
                    "walk_end": 10,
                    "walk_speed": 1,
                    "jump": 1,
                    "atk_sheet": "sprites/sprint_1/large_enemy_atk_800x700.png",
                    "atk_start": 0,
                    "atk_end": 7,
                    "sprite_size": [500,500],
                    "walk_pos_delta": 80,
                    "atk_sprite_size": [800,700],
                    "atk_pos_delta": 150,
                    "scale": 1/3
                }
                this.health = 30;
                this.maxHealth = 30;
                this.ableToJump = false;
                break;

            case "boss":
                this.sprite_info = {
                    "sheet": "sprites/sprint3/boss_70x70.png",
                    "walk_start": 1,
                    "walk_end": 5,
                    "walk_speed": 4,
                    "jump": 2,
                    "atk_sheet": "sprites/sprint3/boss_atk_70x70.png",
                    "atk_start": 0,
                    "atk_end": 8,
                    "sprite_size": [700, 700],
                    "walk_pos_delta": 265,
                    "atk_sprite_size": [700, 700],
                    "atk_pos_delta": 265,
                    "scale": 1/2
                }
                this.health = 100;
                this.maxHealth = 100;
                this.ableToJump = false;
                break;
        }
        this.img0 = loadImage(this.sprite_info["sheet"]);
        this.img1 = loadImage(this.sprite_info["atk_sheet"]);
    }

    load_enemies() {
        let thisEnemyX = this.x - cameraX;
        switch (this.state) {
            case "walking":
                if (this.direction == "R") {
                    image(
                        this.img0, //image
                        thisEnemyX, //x
                        this.y - this.sprite_info["walk_pos_delta"], //y
                        this.sprite_info["sprite_size"][1] * this.sprite_info["scale"], //img h
                        this.sprite_info["sprite_size"][0] * this.sprite_info["scale"], //img w
                        this.sprite_info["sprite_size"][0] * floor(this.enemy_frame), //correct frame
                        0, //i dont know what this variable is
                        this.sprite_info["sprite_size"][0], //i dont know
                        this.sprite_info["sprite_size"][0] //i dont know but it works
                    )
                } else {
                    push();
                    translate(thisEnemyX + (320 * this.sprite_info["scale"]), this.y); //flips it while maintaining pos
                    scale(-1, 1);
                    image(
                        this.img0,
                        0,
                        0 - this.sprite_info["walk_pos_delta"],
                        this.sprite_info["sprite_size"][1] * this.sprite_info["scale"],
                        this.sprite_info["sprite_size"][0] * this.sprite_info["scale"],
                        this.sprite_info["sprite_size"][0] * floor(this.enemy_frame),
                        0,
                        this.sprite_info["sprite_size"][0],
                        this.sprite_info["sprite_size"][0]
                    );
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
                        thisEnemyX, //x
                        this.y - this.sprite_info["walk_pos_delta"], //y
                        this.sprite_info["sprite_size"][1] * this.sprite_info["scale"], //img h
                        this.sprite_info["sprite_size"][0] * this.sprite_info["scale"], //img w
                        this.sprite_info["sprite_size"][0] * this.sprite_info["jump"], //correct frame
                        0, //i dont know what this variable is
                        this.sprite_info["sprite_size"][0], //i dont know
                        this.sprite_info["sprite_size"][0] //i dont know but it works
                    )
                } else {
                    push();
                    translate(thisEnemyX + (320 * this.sprite_info["scale"]), this.y); //flips it while maintaining pos
                    scale(-1, 1);
                    image(
                        this.img0,
                        0,
                        0 - this.sprite_info["walk_pos_delta"],
                        this.sprite_info["sprite_size"][1] * this.sprite_info["scale"],
                        this.sprite_info["sprite_size"][0] * this.sprite_info["scale"],
                        this.sprite_info["sprite_size"][0] * this.sprite_info["jump"],
                        0,
                        this.sprite_info["sprite_size"][0],
                        this.sprite_info["sprite_size"][0]
                    );
                    pop();
                }

                this.enemy_frame = this.sprite_info["jump"];

                break;
            case "attack":
                //bow
                if (this.direction == "R") {
                    image(
                        this.img1, //image
                        thisEnemyX, //x
                        this.y - this.sprite_info["atk_pos_delta"], //y
                        this.sprite_info["atk_sprite_size"][0] * this.sprite_info["scale"], //img h
                        this.sprite_info["atk_sprite_size"][1] * this.sprite_info["scale"], //img w
                        this.sprite_info["atk_sprite_size"][0] * floor(this.enemy_frame),
                        0,
                        this.sprite_info["atk_sprite_size"][0],
                        this.sprite_info["atk_sprite_size"][0]
                    )
                } else {
                    push();
                    translate(thisEnemyX + (400 * this.sprite_info["scale"]),this.y);
                    scale(-1, 1);
                    image(
                        this.img1, //image
                        0, //x
                        0 - this.sprite_info["atk_pos_delta"], //y
                        this.sprite_info["atk_sprite_size"][0] * this.sprite_info["scale"], //img h
                        this.sprite_info["atk_sprite_size"][1] * this.sprite_info["scale"], //img w
                        this.sprite_info["atk_sprite_size"][0] * floor(this.enemy_frame),
                        0,
                        this.sprite_info["atk_sprite_size"][0],
                        this.sprite_info["atk_sprite_size"][0]
                    )
                    pop();
                }
                if (this.enemy_frame > this.sprite_info["atk_end"]) {
                    this.enemy_frame = this.sprite_info["atk_start"];
                }
                break;

            case "jumping":
                image(
                        this.img0, //image
                        thisEnemyX, //x
                        this.y - this.sprite_info["walk_pos_delta"], //y
                        this.sprite_info["sprite_size"][1] * this.sprite_info["scale"], //img h
                        this.sprite_info["sprite_size"][0] * this.sprite_info["scale"], //img w
                        this.sprite_info["sprite_size"][0] * this.sprite_info["jump"], //correct frame
                        0, //i dont know what this variable is
                        this.sprite_info["sprite_size"][0], //i dont know
                        this.sprite_info["sprite_size"][0] //i dont know but it works
                    )
                break;
                
            case "still":
                image(
                        this.img0, //image
                        thisEnemyX, //x
                        this.y - this.sprite_info["walk_pos_delta"], //y
                        this.sprite_info["sprite_size"][1] * this.sprite_info["scale"], //img h
                        this.sprite_info["sprite_size"][0] * this.sprite_info["scale"], //img w
                        this.sprite_info["sprite_size"][0] * 0 , //correct frame
                        0, //i dont know what this variable is
                        this.sprite_info["sprite_size"][0], //i dont know
                        this.sprite_info["sprite_size"][0] //i dont know but it works
                    )
                break;

        }

        this.drawHealthBar();
    }

    drawHealthBar() {
        let ew = this.sprite_info["sprite_size"][0] * this.sprite_info["scale"];
        let screenX = this.x - cameraX;
        let screenY = this.y - this.sprite_info["walk_pos_delta"];
        let barW = ew;
        let barH = 6;
        let barY = screenY - barH - 4;
        let fillW = (this.health / this.maxHealth) * barW;

        push();
        noStroke();
        fill(10, 12, 18, 200);
        rect(screenX, barY, barW, barH, 2);
        fill(160, 30, 30);
        rect(screenX, barY, fillW, barH, 2);
        fill(255, 255, 255, 22);
        rect(screenX, barY, fillW, barH / 2, 2);
        pop();
    }

    moveAndJumpAndGravity() {

        //if on ground stay on ground 
        this.yVel += gravity;
        
        if (this.y >= groundY) {
            this.y = groundY;
            this.yVel = 0;
            this.onGround = true;
            this.state = "walking";
        } else {
            this.onGround = false;
            this.state = "jumping";
        } 
        


        //move the sprite!
        this.y += this.yVel;
        this.x += this.xVel;
    }

    intelligence () {
        //follow player!
        if ((playerX - 50) > this.x) {
            this.xVel = this.sprite_info["walk_speed"];
            this.direction = "R";
        } else if ((playerX + 50) < this.x) {
            this.xVel = this.sprite_info["walk_speed"] * -1;
            this.direction = "L";
        } else {
            this.state = "attack";
            this.xVel = 0;
        }

        //check if should jump
        //150 is arbitrary, i wanted to add in some sort of delay to the jumping or else it looked weird
        if ((this.y > playerY + 150) && this.onGround && this.ableToJump) {
            this.jump();
        }
    }

    processHealth() {
        let ew = this.sprite_info["sprite_size"][0] * this.sprite_info["scale"];
        let ex = this.x;
        let ey = this.y - this.sprite_info["walk_pos_delta"];

        // melee attacks — light stops on first hit per enemy, heavy hits each once
        for (let a of meleeAttacks) {
            if (a.hitEnemies.includes(this)) continue;
            if (rectsOverlap(ex, ey, ew, ew, a.x, a.y, a.hitW, a.hitH)) {
                this.health -= a.damage;
                a.hitEnemies.push(this);
            }
        }

        // mage projectiles — light stops on first hit, heavy pierces all (hits each once)
        for (let i = mageProjectiles.length - 1; i >= 0; i--) {
            let p = mageProjectiles[i];
            if (p.hitEnemies.includes(this)) continue;

            let pSize = p.type === "light" ? p.drawW : lerp(100, 300, p.ratio);
            let px = p.x - pSize / 2;
            let py = p.y - pSize / 2;

            if (rectsOverlap(ex, ey, ew, ew, px, py, pSize, pSize)) {
                this.health -= p.damage;
                p.hitEnemies.push(this);
                if (p.type === "light") mageProjectiles.splice(i, 1);
            }
        }
    }

    jump() {
        this.onGround = false;
        this.state = "jumping";
        this.yVel = -15;
        this.y += this.yVel;
    }
}