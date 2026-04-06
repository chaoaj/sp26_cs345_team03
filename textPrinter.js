
function printLongLine(lineText, x, y, maxLength, textSpace) {
    printY = y;
    if (lineText.length > maxLength) {
        
        for (i = maxLength ; i < lineText.length; i += maxLength) {

            text(lineText.substring(i - maxLength, i), x, printY);
            printY += textSpace;

        }
        if (lineText.length % maxLength > 1) {
            text(lineText.substring(lineText.length - (lineText.length % maxLength)), x, printY);
            return printY + textSpace;

        }
        return printY;

    } else {

        text(lineText, x, y);
        return printY + textSpace;

    }

}

function printByWord(lineText, x, y, maxLength, textSpace) {

    words = lineText.split(" ")
    textY = y;
    charCount = 0;
    currLine = "";
    if (lineText.length > maxLength) {

        for (word of words) {

            currLine += word + " ";
            charCount += word.length + 1;
            if (charCount > maxLength) {

                text(currLine, x, textY);
                textY += textSpace;
                currLine = "";
                charCount = 0;

            }

        }
        if (currLine !== "") {

            text(currLine, x, textY)
            textY += textSpace;

        }
        

    } else {

        text(lineText, x, textY);
        textY += textSpace;

    }
    
    return textY;

}