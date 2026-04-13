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
    
    constructor(fullText) {
        super();
        if (fullText.length <= 0) {
            throw new Error("Text is empty or invalid.")
        }
        this.fullText = fullText;
        this.outText = "";
        this.finished = false;
        this.letterIndex = 0;
    }

    isAlive() {
        if (this.finished && entityWaitingForMouse == 1) {
            entityWaitingForMouse = -1;
            isDialogue = false;
            return false;
        }
        return true;
    }
    frameChange() {
        
        if (!(this.finished)) {
            this.outText += this.fullText[this.letterIndex]
            this.letterIndex++;
        }
        if (this.outText.length == this.fullText.length) {
            this.finished = true;
            entityWaitingForMouse = 0;
        }
    }
    getText() {
        return this.outText;
    }
}
