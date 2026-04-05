
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

    

}