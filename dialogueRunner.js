let fairyDia;
let traderDia;
let nextDialogueReady = false;
let diaIndex = 0;
let nextDiaLine = 0;
let currDiaFile;
let leftRight;
let playerIsTalker = false;

function initDiaFile() {
    currDiaFile = traderDia;
    printDialogue(currDiaFile[0], 0);
}

function printDialogue(line, lineNumber) {

    marker = line[0]
    
    if (marker === "#") {
        splitLine = line.split(": ")
        if (splitLine[0] === "#N") {
            playerIsTalker = true;
            dialogue = new Dialogue(splitLine[1], "", false);
        } else {
            personTalking = splitLine[0].substring(1);
            if (personTalking === "Fairy") {
                playerIsTalker = false;
                dialogueSprite = fairySprite;
            } else if (personTalking === "Player") {
                playerIsTalker = true;
            } else if (personTalking === "Trader") {
                playerIsTalker = false;
                dialogueSprite = traderSprite;
            } else {
                playerIsTalker = false;
            }
            dialogue = personDialogue(personTalking + ": ", splitLine[1]);
        }
    }

    if (marker === "=") {
        workingString = line.substring(line.indexOf("["), line.indexOf("]"))
        splitLine = workingString.split("|");
        leftOption = createMainMenuButton(splitLine[0].substring(1), (width / 8) - 125, (height * 5) / 6, function() {
            leftRight = "left";
            mouseReleased = false;
            updateUI();
            nextDiaLine = int(currDiaFile[lineNumber + 1]) - 1;
            printDialogue(currDiaFile[nextDiaLine], nextDiaLine)
            leftOption.hide();
            rightOption.hide();
        });
        leftOption.style('font-size', '12px');
        rightOption = createMainMenuButton(splitLine[1], ((width * 7) / 8) - 125, (height * 5) / 6, function() {
            leftRight = "right";
            mouseReleased = false;
            updateUI();
            nextDiaLine = int(currDiaFile[lineNumber + 2]) - 1;
            printDialogue(currDiaFile[nextDiaLine], nextDiaLine);
            leftOption.hide();
            rightOption.hide();
        });
        rightOption.style('font-size', '12px');
    }

    if (marker === "%") {
        nextDiaLine = int(line.substring(1)) - 1;
        printDialogue(currDiaFile[nextDiaLine], nextDiaLine);
    } else if (marker !== "=" && marker !== "~") {
        nextDiaLine++;
    }
    if (marker === "~") {
        diaIndex = 0;
        nextDiaLine = 0;
        isDialogue = false;
        skipDialogueButton.hide();
    }
    

}

function personDialogue(name, dialogue) {
    return new Dialogue(dialogue, name, false)
}