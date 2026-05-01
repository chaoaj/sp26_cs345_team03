let fairyDia;
let traderDia;
let nextDialogueReady = false;
let diaIndex = 0;
let nextDiaLine = 0;
let currDiaFile;
let leftRight;
let helpDia = ["#???: HEEEEELLLLLLLPP!!!!", "~"]


// indicates whether or not there should be a image loaded for speaker
// false means there should be an image loaded
let showDiaSprite = false;

function initDiaFile(person) {
    if (person === "fairy") {
        isDialogue = true;
        currDiaFile = fairyDia;
        printDialogue(currDiaFile[0], 0);
    } else if (person === "trader") {
        isDialogue = true;
        currDiaFile = traderDia;
        printDialogue(currDiaFile[0], 0);
    } else if (person === "help") {
        isDialogue = true;
        currDiaFile = helpDia;
        printDialogue(currDiaFile[0], 0);
    }
    
}

function printDialogue(line, lineNumber) {

    //reads the first char of the dialogue file line to see what the command is
    marker = line[0]
    
    // # marks that someone is talking
    if (marker === "#") {

        //splits the speaker name and the dialogue
        splitLine = line.split(": ")

        // #N indicates that the narrator is talking
        if (splitLine[0] === "#N") {
            showDiaSprite = true;
            dialogue = new Dialogue(splitLine[1], "", false);
        } else {
            personTalking = splitLine[0].substring(1);
            if (personTalking === "Fairy") {
                showDiaSprite = false;
                dialogueSprite = fairySprite;
            } else if (personTalking === "Player") {
                showDiaSprite = false;
                dialogueSprite = playerTalkSprite;
            } else if (personTalking === "Trader") {
                showDiaSprite = false;
                dialogueSprite = traderSprite;
            } else {
                showDiaSprite = true;
            }
            if (personTalking === "Player") {
                dialogue = new Dialogue(splitLine[1], "", false);
            } else {
                dialogue = personDialogue(personTalking + ": ", splitLine[1]);
            }
        }
    }

    // indicates dialogue choices
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

    // indicates that the dialogue should skip to a certain line
    if (marker === "%") {
        nextDiaLine = int(line.substring(1)) - 1;
        printDialogue(currDiaFile[nextDiaLine], nextDiaLine);
    } else if (marker !== "=" && marker !== "~") {
        nextDiaLine++;
    }

    // indicates that the dialogue file should stop being read
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