let gameState = "menu";

let startButton;
let settingsButton;
let quitButton;
let backButton;
let volumeSlider;

let stars = [];
let particles = [];
let poemLines;
let frames = 0;

function setup() {
  createCanvas(960, 540);

  for (let i = 0; i < 80; i++) {
    stars.push({
      x: random(width),
      y: random(height * 0.55),
      size: random(1, 2.8),
      alpha: random(60, 170),
      speed: random(0.002, 0.01)
    });
  }

  for (let i = 0; i < 35; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(2, 4),
      speedX: random(-0.12, 0.12),
      speedY: random(-0.22, -0.04),
      alpha: random(20, 70)
    });
  }

  startButton = createMainMenuButton("Start", 40, 280, function() {
    gameState = "start";
    updateUI();
  });

  settingsButton = createMainMenuButton("Settings", 40, 354, function() {
    gameState = "settings";
    updateUI();
  });

  quitButton = createMainMenuButton("Quit", 40, 428, function() {
    gameState = "quit";
    updateUI();
  });

  backButton = createButton("Back");
  backButton.size(120, 46);
  backButton.position(35, 35);
  styleButton(backButton);
  backButton.mousePressed(function() {
    gameState = "menu";
    updateUI();
  });

  volumeSlider = createSlider(0, 100, 50);
  volumeSlider.position(385, 300);
  volumeSlider.size(190);

  updateUI();
}

function preload() {

  poemLines = loadStrings("/data/intro_poem.txt");
  

}

function draw() {
  frames++;
  if (frames > 9) {

    frames = 0;

  }
  drawFantasyBackground();

  if (gameState === "menu") {
    drawMenuPanel();
    drawTitle();
  } else if (gameState === "start") {
    drawSubScreenPanel();
    drawStartScreen();
  } else if (gameState === "settings") {
    drawSubScreenPanel();
    drawSettingsScreen();
  } else if (gameState === "quit") {
    drawSubScreenPanel();
    drawQuitScreen();
  }
}

function drawFantasyBackground() {
  drawSkyGradient();
  drawBackGlow();
  drawStars();
  drawBackMountains();
  drawMidMountains();
  drawCastleSilhouette();
  drawMistLayer(height - 45, 180, 0.14);
  drawMistLayer(height - 8, 220, 0.22);
  drawParticles();
  drawForegroundVignette();
}

function drawSkyGradient() {
  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);

    let top = color(13, 14, 28);
    let mid = color(28, 24, 48);
    let bottom = color(70, 52, 92);

    let c;
    if (t < 0.55) {
      c = lerpColor(top, mid, t / 0.55);
    } else {
      c = lerpColor(mid, bottom, (t - 0.55) / 0.45);
    }

    stroke(c);
    line(0, y, width, y);
  }
  noStroke();
}

function drawBackGlow() {
  // softer light source instead of a big visible moon
  for (let i = 0; i < 8; i++) {
    fill(205, 215, 255, 10 - i);
    ellipse(480, 120, 190 - i * 18, 150 - i * 12);
  }

  fill(220, 230, 255, 12);
  ellipse(480, 120, 95, 70);
}

function drawStars() {
  noStroke();
  for (let s of stars) {
    let twinkle = map(sin(frameCount * s.speed), -1, 1, 0.45, 1);
    fill(255, 255, 255, s.alpha * twinkle);
    ellipse(s.x, s.y, s.size, s.size);
  }
}

function drawBackMountains() {
  fill(27, 23, 43);
  beginShape();
  vertex(0, 380);
  vertex(60, 330);
  vertex(120, 355);
  vertex(180, 300);
  vertex(255, 345);
  vertex(330, 280);
  vertex(410, 335);
  vertex(500, 285);
  vertex(600, 350);
  vertex(600, 600);
  vertex(0, 600);
  endShape(CLOSE);
}

function drawMidMountains() {
  fill(18, 16, 30);
  beginShape();
  vertex(0, 430);
  vertex(70, 390);
  vertex(145, 420);
  vertex(220, 360);
  vertex(295, 410);
  vertex(355, 370);
  vertex(430, 430);
  vertex(520, 375);
  vertex(600, 440);
  vertex(600, 600);
  vertex(0, 600);
  endShape(CLOSE);
}

function drawCastleSilhouette() {
  push();
  translate(450, 315);
  fill(9, 9, 15);

  rect(-25, 80, 140, 160);
  rect(15, 20, 28, 220);
  rect(70, 55, 32, 185);
  rect(-55, 50, 28, 190);

  triangle(-55, 50, -41, 18, -27, 50);
  triangle(15, 20, 29, -18, 43, 20);
  triangle(70, 55, 86, 18, 102, 55);

  rect(12, 160, 34, 80, 12);

  // Castle lighting
  fill(255, 210, 50, 30);
  rect(-18, 120, 10, 16);
  rect(60, 110, 10, 16);
  rect(82, 118, 10, 16);

  pop();
}

function drawMistLayer(yBase, h, driftSpeed) {
  push();
  noStroke();

  for (let i = -2; i < 8; i++) {
    let offset = (frameCount * driftSpeed + i * 115) % (width + 240) - 120;
    fill(220, 225, 255, 16);
    ellipse(offset, yBase, 220, h * 0.65);
    ellipse(offset + 45, yBase - 20, 180, h * 0.55);
    ellipse(offset - 50, yBase + 12, 200, h * 0.6);
  }

  pop();
}

function drawParticles() {
  noStroke();
  for (let p of particles) {
    fill(230, 235, 255, p.alpha);
    ellipse(p.x, p.y, p.size, p.size);

    p.x += p.speedX;
    p.y += p.speedY;

    if (p.y < -10) {
      p.y = height + random(10, 80);
      p.x = random(width);
    }

    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
  }
}

function drawForegroundVignette() {
  noFill();
  for (let i = 0; i < 78; i++) {
    stroke(0, 0, 0, 3);
    rect(-i, -i, width + i * 2, height + i * 2);
  }
  noStroke();
}

function drawMenuPanel() {
  fill(7, 8, 12, 158);
  rect(20, 24, 358, 500, 14);

  fill(255, 255, 255, 10);
  rect(24, 28, 350, 492, 12);

  stroke(190, 195, 225, 34);
  noFill();
  rect(28, 32, 342, 484, 12);

  stroke(255, 255, 255, 10);
  line(40, 284, 230, 284);
  noStroke();
}

function drawSubScreenPanel() {
  fill(7, 8, 12, 168);
  rect(210, 25, 550, 490, 14);

  fill(255, 255, 255, 10);
  rect(215, 30, 540, 482, 12);

  stroke(190, 195, 225, 30);
  noFill();
  rect(220, 34, 532, 474, 12);
  noStroke();
}

function drawTitle() {
  textAlign(LEFT, TOP);
  textFont("Georgia");

  // glow/shadow
  fill(165, 175, 220, 32);
  textStyle(BOLD);
  textSize(34);
  text("That Time I Was", 45, 82);
  text("An Office Worker", 45, 120);

  fill(244, 244, 248);
  text("That Time I Was", 42, 79);
  text("An Office Worker", 42, 117);

  fill(205, 205, 216);
  textStyle(NORMAL);
  textSize(15);
  text("and Was Put in a Coma by a", 50, 160);
  text("Demon Sleep God", 53, 180);
}

function createMainMenuButton(label, x, y, action) {
  let button = createButton(label);
  button.size(178, 56);
  button.position(x, y);
  styleButton(button);
  button.mousePressed(action);
  return button;
}

function styleButton(button) {
  button.style("background", "rgba(18, 19, 28, 0.88)");
  button.style("color", "#f2f2f7");
  button.style("border", "1px solid rgba(205, 210, 235, 0.16)");
  button.style("font-family", "Georgia");
  button.style("font-size", "21px");
  button.style("border-radius", "8px");
  button.style("box-shadow", "0 0 0 rgba(0,0,0,0)");
  button.style("cursor", "pointer");
  button.style("text-align", "center");
  button.style("transition", "all 0.16s ease");

  button.mouseOver(function() {
    button.style("background", "rgba(32, 34, 48, 0.96)");
    button.style("border", "1px solid rgba(225, 230, 255, 0.28)");
    button.style("box-shadow", "0 0 18px rgba(160, 170, 220, 0.10)");
  });

  button.mouseOut(function() {
    button.style("background", "rgba(18, 19, 28, 0.88)");
    button.style("border", "1px solid rgba(205, 210, 235, 0.16)");
    button.style("box-shadow", "0 0 0 rgba(0,0,0,0)");
  });
}

function updateUI() {
  startButton.hide();
  settingsButton.hide();
  quitButton.hide();
  backButton.hide();
  volumeSlider.hide();

  if (gameState === "menu") {
    startButton.show();
    settingsButton.show();
    quitButton.show();
  } else if (gameState === "start") {
    backButton.show();
  } else if (gameState === "settings") {
    backButton.show();
    volumeSlider.show();
  } else if (gameState === "quit") {
    backButton.show();
  }
}

function drawStartScreen() {
  
  
  
  fill(244, 244, 248);
  textAlign(CENTER, CENTER);
  textFont("Georgia");
  textStyle(BOLD);
  textSize(34);
  //text("The Dream Begins", width / 2, 100);

  textStyle(NORMAL);
  textSize(20);
  fill(214, 214, 226);
  /*text("You wake up with no memory.", width / 2, 250);
  text("The world feels wrong.", width / 2, 286);
  text("Something ancient is keeping you asleep.", width / 2, 322);*/
  textHeight = 100;
  textSize(20);
  lineLength = 50;
  for (let x of poemLines) {
    
    textHeight = printLongLine(x, width / 2, textHeight, lineLength, 25);
    /*if (currLine.length > lineLength) {
      stringStart = 0;
      for (stringStart = 0; stringStart < currLine.length - lineLength; stringStart += lineLength) {

        text(currLine.substring(stringStart, stringStart + lineLength), width / 2, textHeight)
        textHeight += 22

      }
      if (currLine.length > stringStart) {

        text(currLine.substring(stringStart), width / 2, textHeight)
        textHeight += 40;  

      } else {

        text(textHeight, width / 2, textHeight)
        textHeight += 18;

      }
      

    } else {

      text(x, width / 2, textHeight);
      textHeight += 40;

    }*/

  }
}

function drawSettingsScreen() {
  fill(244, 244, 248);
  textAlign(CENTER, CENTER);
  textFont("Georgia");
  textStyle(BOLD);
  textSize(34);
  text("Settings", width / 2, 170);

  textStyle(NORMAL);
  textSize(22);
  fill(214, 214, 226);
  text("Volume", width / 2, 270);

  textSize(18);
  text("Current: " + volumeSlider.value(), width / 2, 350);
}

function drawQuitScreen() {
  fill(244, 244, 248);
  textAlign(CENTER, CENTER);
  textFont("Georgia");
  textStyle(BOLD);
  textSize(34);
  text("Return to Sleep", width / 2, 200);

  textStyle(NORMAL);
  textSize(20);
  fill(214, 214, 226);
  text("This is your quit screen placeholder.", width / 2, 285);
  text("Press Back to return.", width / 2, 318);
}
