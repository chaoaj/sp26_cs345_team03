let gameState = "menu";
let selectedClass = "";

let startButton;
let settingsButton;
let quitButton;
let backButton;
let volumeSlider;
let mouseReleased = false;

let mageButton;
let meleeButton;

let HP;
let maxHP;
let magic;
let maxMagic;
let stamina;
let maxStamina;

let stars = [];
let particles = [];
let poemLines;
let frames = 0;
let fireflies = [];

// main menu panel
let menuPanel = {
  x: 110,
  y: 34,
  w: 360,
  h: 472
};

// intro level
let introStage = 0;
let cameraX = 0;
let worldWidth = 2400;

let introDialogue = "";
let introPrompt = "";
let introObjective = "";

// player
let spriteSheet;
let playerX = 200;
let playerY;
let groundY;
let velY = 0;
let facingLeft = false;
let currentFrame = 0;
let moveFrameIndex = 0;
let animTimer = 0;
let onGround = false;

const frameWidth = 320;
const frameHeight = 320;
const drawSize = 80;
const gravity = 0.6;
const jumpForce = -14;

// attacks
let atkLightSheet;
let atkHeavySheet;
let attackType = "";   // "", "light", "heavy"
let attackFrame = 0;
let attackTimer = 0;
const attackFrameSpeed = 5; // draw frames per sprite frame

function setup() {
  createCanvas(windowWidth, windowHeight);

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

  for (let i = 0; i < 18; i++) {
    fireflies.push({
      x: random(worldWidth),
      y: random(180, 360),
      offset: random(1000),
      size: random(3, 5)
    });
  }

  startButton = createMainMenuButton("Start", 0, 0, function() {
    gameState = "poem";
    updateUI();
  });

  settingsButton = createMainMenuButton("Settings", 0, 0, function() {
    gameState = "settings";
    updateUI();
  });

  quitButton = createMainMenuButton("Quit", 0, 0, function() {
    gameState = "quit";
    updateUI();
  });

  let classButtonX = width / 2 - 100;

  mageButton = createMainMenuButton("Mage", classButtonX, 245, function() {
    selectedClass = "Mage";
    initIntroLevel();
    gameState = "introLevel";
    mouseReleased = false;
    updateUI();
  });
  mageButton.size(200, 62);

  meleeButton = createMainMenuButton("Melee", classButtonX, 325, function() {
    selectedClass = "Melee";
    initIntroLevel();
    gameState = "introLevel";
    mouseReleased = false;
    updateUI();
  });
  meleeButton.size(200, 62);

  backButton = createButton("Back");
  backButton.size(98, 40);
  backButton.position(26, 22);
  styleSecondaryButton(backButton);
  backButton.mousePressed(function() {
    if (gameState === "settings" || gameState === "quit" || gameState === "poem") {
      mouseReleased = false;
      gameState = "menu";
    } else if (gameState === "classSelect") {
      mouseReleased = false;
      gameState = "poem";
    } else if (gameState === "introLevel") {
      gameState = "classSelect";
    } else {
      gameState = "menu";
    }
    updateUI();
  });

  volumeSlider = createSlider(0, 100, 50);
  volumeSlider.position(width / 2 - 190/2, 300);
  volumeSlider.size(190);

  layoutMenuButtons();
  updateUI();
}

function preload() {

  poemLines = loadStrings("./libraries/data/intro_poem.txt");


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
  } else if (gameState === "poem") {
    drawPoemScreen();
  } else if (gameState === "classSelect") {
    drawClassSelectScreen();
  } else if (gameState === "introLevel") {
    drawIntroLevelScreen();
  } else if (gameState === "settings") {
    drawSettingsScreen();
  } else if (gameState === "quit") {
    drawQuitScreen();
  }
}

function keyPressed() {
  if (gameState !== "introLevel") return;

  if ((key === 'w' || key === 'W') && onGround) {
    velY = jumpForce;
    return;
  }

  if ((key === 'q' || key === 'Q') && attackType === "") {
    if (magic <= 0 || stamina <= 0) {
      return;
    }
    attackType = "heavy";
    attackFrame = 0;
    attackTimer = 0;
    

    if (selectedClass === "Mage") {
      magic = max(0, magic - 18);
    } else {
      stamina = max(0, stamina - 18);
    }
    return;
  }

  if (key === ' ' || keyCode === ENTER) {
    if (introStage < 4) {
      introStage++;
    }
  }
}

function initIntroLevel() {
  introStage = 0;
  cameraX = 0;

  HP = 100;
  maxHP = 100;
  magic = 100;
  maxMagic = 100;
  stamina = 100;
  maxStamina = 100;

  introDialogue = "Placeholder intro text.";
  introPrompt = "SPACE";
  introObjective = "Begin";

  // init player
  groundY = 440 - drawSize;
  playerX = 200;
  playerY = groundY;
  velY = 0;
  onGround = false;
  currentFrame = 0;
  moveFrameIndex = 0;
  animTimer = 0;

  let spritePath = selectedClass === "Mage"
    ? "sprites/sprint2/mage_class_320x320.png"
    : "sprites/sprint2/melee_class_320x320.png";
  spriteSheet = loadImage(spritePath);

  if (selectedClass === "Melee") {
    atkLightSheet = loadImage("sprites/sprint2/melee_attack_320x160.png");
    atkHeavySheet = loadImage("sprites/sprint2/heavy_melee_atk_320x320.png");
  } else {
    atkLightSheet = loadImage("sprites/sprint2/light_spell_atk_320x320.png");
    atkHeavySheet = loadImage("sprites/sprint2/heavy_spell_atk_320x320.png");
  }

  attackType = "";
  attackFrame = 0;
  attackTimer = 0;
}

function drawHUD() {
  let x = 22;
  let y = 76; 

  drawBar(x, y, 180, 14, HP, maxHP, color(0, 64, 0), "HP");

  if (selectedClass === "Mage") {
    drawBar(x, y + 26, 180, 14, magic, maxMagic, color(0, 0, 80), "MP");
  } else {
    drawBar(x, y + 26, 180, 14, stamina, maxStamina, color(253, 216, 10), "ST");
  }
}

function drawBar(x, y, w, h, val, maxVal, col, label) {
  let fill_w = (val / maxVal) * w;

  fill(10, 12, 18, 200);
  noStroke();
  rect(x, y, w, h, 4);

  fill(col);
  rect(x, y, fill_w, h, 4);

  fill(255, 255, 255, 22);
  rect(x, y, fill_w, h / 2, 4);

  fill(220, 220, 230);
  textFont("Georgia");
  textSize(12);
  textAlign(LEFT, CENTER);
  text(label, x + w + 8, y + h / 2);
}

function drawFantasyBackground() {
  drawSkyGradient();
  drawBackGlow();
  drawStars();
  drawBackMountains();
  drawMidMountains();
  drawCastleSilhouette();
  drawMistLayer(height - 70, 210, 0.12);
  drawMistLayer(height - 22, 260, 0.20);
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
  let glowX = width * 0.63;
  let glowY = height * 0.22;

  noStroke();

  for (let i = 0; i < 10; i++) {
    fill(205, 215, 255, 10 - i * 0.7);
    ellipse(glowX, glowY, 320 - i * 24, 220 - i * 16);
  }

  fill(220, 230, 255, 14);
  ellipse(glowX, glowY, 130, 90);
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
  fill(25, 22, 42);
  beginShape();
  vertex(0, height * 0.72);
  vertex(width * 0.06, height * 0.63);
  vertex(width * 0.14, height * 0.68);
  vertex(width * 0.22, height * 0.56);
  vertex(width * 0.30, height * 0.65);
  vertex(width * 0.39, height * 0.50);
  vertex(width * 0.49, height * 0.63);
  vertex(width * 0.58, height * 0.52);
  vertex(width * 0.68, height * 0.66);
  vertex(width * 0.78, height * 0.56);
  vertex(width * 0.88, height * 0.67);
  vertex(width, height * 0.58);
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}

function drawMidMountains() {
  fill(17, 15, 28);
  beginShape();
  vertex(0, height * 0.82);
  vertex(width * 0.08, height * 0.73);
  vertex(width * 0.16, height * 0.79);
  vertex(width * 0.24, height * 0.67);
  vertex(width * 0.33, height * 0.78);
  vertex(width * 0.42, height * 0.69);
  vertex(width * 0.52, height * 0.83);
  vertex(width * 0.61, height * 0.70);
  vertex(width * 0.71, height * 0.81);
  vertex(width * 0.81, height * 0.69);
  vertex(width * 0.91, height * 0.80);
  vertex(width, height * 0.73);
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}

function drawCastleSilhouette() {
  push();

  let castleX = width * 0.67;
  let castleY = height * 0.52;

  translate(castleX, castleY);
  fill(9, 9, 15);

  rect(-36, 95, 170, 170);
  rect(18, 18, 32, 247);
  rect(82, 52, 36, 213);
  rect(-74, 46, 34, 219);

  triangle(-74, 46, -57, 6, -40, 46);
  triangle(18, 18, 34, -28, 50, 18);
  triangle(82, 52, 100, 10, 118, 52);

  rect(17, 176, 40, 89, 13);

  fill(255, 210, 50, 32);
  rect(-24, 130, 12, 18);
  rect(66, 118, 12, 18);
  rect(92, 128, 12, 18);

  pop();
}

function drawMistLayer(yBase, h, driftSpeed) {
  push();
  noStroke();

  for (let i = -2; i < 9; i++) {
    let offset = (frameCount * driftSpeed + i * 140) % (width + 280) - 140;
    fill(220, 225, 255, 16);
    ellipse(offset, yBase, 250, h * 0.65);
    ellipse(offset + 55, yBase - 20, 210, h * 0.55);
    ellipse(offset - 55, yBase + 12, 230, h * 0.60);
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
  let x = menuPanel.x;
  let y = menuPanel.y;
  let w = menuPanel.w;
  let h = menuPanel.h;

  fill(7, 8, 12, 180);
  rect(x, y, w, h, 22);

  fill(255, 255, 255, 10);
  rect(x + 6, y + 6, w - 12, h - 12, 20);

  stroke(190, 195, 225, 36);
  noFill();
  rect(x + 12, y + 12, w - 24, h - 24, 20);

  stroke(255, 255, 255, 10);
  line(x + 42, y + 195, x + w - 42, y + 195);
  line(x + 42, y + h - 80, x + w - 42, y + h - 80);
  noStroke();

  drawMenuDecoration(x, y, w, h);
}

function drawMenuDecoration(x, y, w, h) {
  push();
  noFill();
  stroke(180, 190, 230, 18);
  strokeWeight(1.2);

  arc(x + 74, y + 84, 64, 64, PI * 0.15, PI * 1.15);
  arc(x + w - 74, y + h - 84, 64, 64, PI * 1.15, PI * 2.15);

  stroke(255, 255, 255, 8);
  line(x + 42, y + h - 108, x + w - 42, y + h - 108);

  pop();
}

function drawSubScreenPanel() {
  let panelW = 590;
  let panelH = 470;
  let panelX = width * 0.5 - panelW * 0.5;
  let panelY = 34;

  fill(7, 8, 12, 176);
  rect(panelX, panelY, panelW, panelH, 18);

  fill(255, 255, 255, 10);
  rect(panelX + 6, panelY + 6, panelW - 12, panelH - 12, 16);

  stroke(190, 195, 225, 32);
  noFill();
  rect(panelX + 12, panelY + 12, panelW - 24, panelH - 24, 16);

  stroke(255, 255, 255, 12);
  line(panelX + 30, panelY + 78, panelX + panelW - 30, panelY + 78);
  noStroke();
}

function drawTitle() {
  let centerX = menuPanel.x + menuPanel.w / 2;
  let y = menuPanel.y + 42;

  textAlign(CENTER, TOP);
  textFont("Georgia");

  fill(165, 175, 220, 28);
  textStyle(BOLD);
  textSize(40);
  text("That Time I Was", centerX + 3, y + 3);
  text("An Office Worker", centerX + 3, y + 54);

  fill(245, 245, 250);
  text("That Time I Was", centerX, y);
  text("An Office Worker", centerX, y + 50);

  fill(206, 206, 220);
  textStyle(NORMAL);
  textSize(15);
  text("and Was Put in a Coma by a", centerX, y + 118);
  text("Demon Sleep God", centerX, y + 140);
}

function layoutMenuButtons() {
  let buttonW = 250;
  let buttonH = 56;
  let startY = menuPanel.y + 245;
  let gap = 72;
  let buttonX = menuPanel.x + (menuPanel.w - buttonW) / 2;

  startButton.size(buttonW, buttonH);
  settingsButton.size(buttonW, buttonH);
  quitButton.size(buttonW, buttonH);

  startButton.position(buttonX, startY);
  settingsButton.position(buttonX, startY + gap);
  quitButton.position(buttonX, startY + gap * 2);
}

function createMainMenuButton(label, x, y, action) {
  let button = createButton(label);
  button.size(250, 56);
  button.position(x, y);
  styleMainButton(button);
  button.mousePressed(action);
  return button;
}

function styleMainButton(button) {
  button.style("background", "rgba(20, 21, 31, 0.92)");
  button.style("color", "#f2f2f7");
  button.style("border", "1px solid rgba(210, 216, 240, 0.18)");
  button.style("font-family", "Georgia");
  button.style("font-size", "22px");
  button.style("letter-spacing", "0.4px");
  button.style("border-radius", "10px");
  button.style("box-shadow", "0 0 0 rgba(0,0,0,0)");
  button.style("cursor", "pointer");
  button.style("text-align", "center");
  button.style("transition", "all 0.18s ease");

  button.mouseOver(function() {
    button.style("background", "rgba(34, 36, 52, 0.98)");
    button.style("border", "1px solid rgba(230, 235, 255, 0.32)");
    button.style("box-shadow", "0 0 20px rgba(160, 170, 220, 0.12)");
    button.style("transform", "translateY(-1px)");
  });

  button.mouseOut(function() {
    button.style("background", "rgba(20, 21, 31, 0.92)");
    button.style("border", "1px solid rgba(210, 216, 240, 0.18)");
    button.style("box-shadow", "0 0 0 rgba(0,0,0,0)");
    button.style("transform", "translateY(0px)");
  });
}

function styleSecondaryButton(button) {
  button.style("background", "rgba(14, 15, 24, 0.92)");
  button.style("color", "#f2f2f7");
  button.style("border", "1px solid rgba(205, 210, 235, 0.18)");
  button.style("font-family", "Georgia");
  button.style("font-size", "18px");
  button.style("border-radius", "8px");
  button.style("box-shadow", "0 0 0 rgba(0,0,0,0)");
  button.style("cursor", "pointer");
  button.style("text-align", "center");
  button.style("transition", "all 0.16s ease");

  button.mouseOver(function() {
    button.style("background", "rgba(32, 34, 48, 0.96)");
    button.style("border", "1px solid rgba(225, 230, 255, 0.30)");
    button.style("box-shadow", "0 0 18px rgba(160, 170, 220, 0.10)");
  });

  button.mouseOut(function() {
    button.style("background", "rgba(14, 15, 24, 0.92)");
    button.style("border", "1px solid rgba(205, 210, 235, 0.18)");
    button.style("box-shadow", "0 0 0 rgba(0,0,0,0)");
  });
}

function updateUI() {
  startButton.hide();
  settingsButton.hide();
  quitButton.hide();
  backButton.hide();
  volumeSlider.hide();
  mageButton.hide();
  meleeButton.hide();

  if (gameState === "menu") {
    startButton.show();
    settingsButton.show();
    quitButton.show();
  } else if (gameState === "poem") {
    backButton.show();
  } else if (gameState === "classSelect") {
    backButton.show();
    mageButton.show();
    meleeButton.show();
  } else if (gameState === "introLevel") {
    backButton.show();
  } else if (gameState === "settings") {
    backButton.show();
    volumeSlider.show();
  } else if (gameState === "quit") {
    backButton.show();
  }
}

function drawPoemScreen() {

  drawSubScreenPanel();

  fill(244, 244, 248);
  textAlign(CENTER, CENTER);
  textFont("Georgia");
  textStyle(BOLD);
  textHeight = 70;
  textSize(15);
  lineLength = 60;
  for (let x of poemLines) {

    textHeight = printByWord(x, width / 2, textHeight, lineLength, 15);
    textHeight += 10;

  }
  fill(100, 100, 100);
  text("Click to continue", width / 2, height - 60)
  if (mouseIsPressed) {

    if (mouseReleased) {

      gameState = "classSelect";
      updateUI();

    }

  } else {

    mouseReleased = true;

  }

}

function drawClassSelectScreen() {
  drawSubScreenPanel();

  fill(244, 244, 248);
  textAlign(CENTER, CENTER);
  textFont("Georgia");
  textStyle(BOLD);
  textSize(34);
  text("Select a Class", width / 2, 160);

  textStyle(NORMAL);
  textSize(18);
  fill(214, 214, 226);
  text("Mage uses spell power and ranged magic.", width / 2, 410);
  text("Melee focuses on close combat and raw strength.", width / 2, 440);
}

function drawSettingsScreen() {
  drawSubScreenPanel();

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
  drawSubScreenPanel();

  fill(244, 244, 248);
  textAlign(CENTER, CENTER);
  textFont("Georgia");
  textStyle(BOLD);
  textSize(34);
  text("Return to Sleep", width / 2 + 35, 200);

  textStyle(NORMAL);
  textSize(20);
  fill(214, 214, 226);
  text("Leave this screen and return to the title menu.", width / 2 + 35, 285);
  text("Press Back to continue.", width / 2 + 35, 318);
}

function drawIntroLevelScreen() {
  if (!mouseIsPressed) {
    mouseReleased = true;
  }

  updateIntroLevel();
  updatePlayer();
  drawIntroWorld();
  drawPlayer();
  drawIntroTopUI();
  drawHUD();
  drawIntroDialogueBox();
}

function updatePlayer() {
  let moving = false;
  if (keyIsDown(68)) { playerX += 5; moving = true; facingLeft = false; } // D
  if (keyIsDown(65)) { playerX -= 5; moving = true; facingLeft = true; }  // A

  // clamp to world bounds (no walking off-screen)
  playerX = constrain(playerX, 0, worldWidth - drawSize);

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

  // camera follows player, clamped to world
  cameraX = constrain(playerX - width / 2, 0, worldWidth - width);

  // advance attack animation
  if (attackType !== "") {
    attackTimer++;
    if (attackTimer % attackFrameSpeed === 0) {
      attackFrame++;
      if (attackFrame >= getAtkInfo(attackType).frames) {
        attackType = "";
        attackFrame = 0;
        attackTimer = 0;
      }
    }
  }
}

// returns { frames, srcH, drawW, drawH } for current class + attack type
function getAtkInfo(type) {
  if (selectedClass === "Melee") {
    if (type === "light") return { frames: 4, srcH: 160, drawW: 160, drawH: 80  };
    else                  return { frames: 5, srcH: 320, drawW: 160, drawH: 160 };
  } else {
    if (type === "light") return { frames: 3, srcH: 320, drawW: 120, drawH: 120 };
    else                  return { frames: 3, srcH: 320, drawW: 160, drawH: 160 };
  }
}

function drawPlayer() {
  if (!spriteSheet) return;

  let screenX = playerX - cameraX;
  let sx = currentFrame * frameWidth;

  push();
  if (facingLeft) {
    translate(screenX + drawSize, playerY);
    scale(-1, 1);
    image(spriteSheet, 0, 0, drawSize, drawSize, sx, 0, frameWidth, frameHeight);
  } else {
    image(spriteSheet, screenX, playerY, drawSize, drawSize, sx, 0, frameWidth, frameHeight);
  }
  pop();

  drawAttack();
}

function drawAttack() {
  if (attackType === "" || !atkLightSheet || !atkHeavySheet) return;

  let info = getAtkInfo(attackType);
  let sheet = attackType === "light" ? atkLightSheet : atkHeavySheet;
  let screenX = playerX - cameraX;
  let sx = attackFrame * frameWidth;

  // center effect vertically on the player, push it in front
  let effW = info.drawW;
  let effH = info.drawH;
  let effY = playerY + drawSize / 2 - effH / 2;

  // melee overlaps the player body; mage pushes clearly in front for a casting feel
  let xOff = selectedClass === "Mage" ? drawSize + 20 : drawSize * 0.4;

  push();
  if (facingLeft) {
    // mirror xOff to the left: translate to the right edge of the effect then flip
    translate(screenX - xOff + effW, effY);
    scale(-1, 1);
    image(sheet, 0, 0, effW, effH, sx, 0, frameWidth, info.srcH);
  } else {
    image(sheet, screenX + xOff, effY, effW, effH, sx, 0, frameWidth, info.srcH);
  }
  pop();
}

function mousePressed() {
  if (gameState !== "introLevel") return;
  // ignore clicks on the back button area (top-left)
  if (mouseX < 140 && mouseY < 70) return;
  if (!mouseReleased) return;
  if (stamina <= 0 || magic <= 0) {
    return;
  }
  if (attackType === "") {
    attackType = "light";
    attackFrame = 0;
    attackTimer = 0;
  
    if (selectedClass == "Mage") {
      magic = max(0, magic - 9);
    } else {
      stamina = max(0, stamina - 9);
    }
  }
}

function updateIntroLevel() {
  introPrompt = "";

  if (introStage === 0) {
    introObjective = "Begin";
    introDialogue = "Placeholder intro text.";
    introPrompt = "SPACE";
  } else if (introStage === 1) {
    introObjective = "Continue";
    introDialogue = "Placeholder.";
    introPrompt = "SPACE";
  } else if (introStage === 2) {
    introObjective = "Continue";
    introDialogue = "Placeholder.";
    introPrompt = "SPACE";
  } else if (introStage === 3) {
    introObjective = "Continue";
    introDialogue = "Placeholder.";
    introPrompt = "SPACE";
  } else {
    introObjective = "Continue";
    introDialogue = "Placeholder next area.";
  }
}

function drawIntroWorld() {
  drawIntroSky();
  drawIntroParallaxBack();

  push();
  translate(-cameraX, 0);
  drawIntroGround();
  drawIntroPondArea();
  drawIntroForestArea();
  drawIntroVillagePathArea();
  drawAmbientFireflies();
  drawForegroundPlants();
  pop();
}

function drawIntroSky() {
  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);
    let c1 = color(17, 15, 31);
    let c2 = color(48, 61, 72);
    let c3 = color(84, 90, 88);

    let c;
    if (t < 0.58) {
      c = lerpColor(c1, c2, t / 0.58);
    } else {
      c = lerpColor(c2, c3, (t - 0.58) / 0.42);
    }

    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  fill(220, 240, 255, 18);
  ellipse(width * 0.72, 110, 180, 120);
}

function drawIntroParallaxBack() {
  push();

  let p1 = -cameraX * 0.18;
  let p2 = -cameraX * 0.34;

  noStroke();

  fill(28, 30, 40, 180);
  beginShape();
  vertex(p1, 350);
  vertex(p1 + 120, 290);
  vertex(p1 + 260, 340);
  vertex(p1 + 420, 260);
  vertex(p1 + 620, 350);
  vertex(p1 + 820, 270);
  vertex(p1 + 1080, 360);
  vertex(p1 + 1400, 260);
  vertex(p1 + 1800, 350);
  vertex(p1 + 1800, height);
  vertex(p1, height);
  endShape(CLOSE);

  fill(18, 20, 28, 210);
  beginShape();
  vertex(p2, 390);
  vertex(p2 + 140, 320);
  vertex(p2 + 270, 390);
  vertex(p2 + 420, 300);
  vertex(p2 + 630, 400);
  vertex(p2 + 850, 320);
  vertex(p2 + 1120, 410);
  vertex(p2 + 1420, 310);
  vertex(p2 + 1760, 410);
  vertex(p2 + 1760, height);
  vertex(p2, height);
  endShape(CLOSE);

  pop();
}

function drawIntroGround() {
  noStroke();

  fill(42, 54, 40);
  rect(0, 410, worldWidth, 130);

  fill(26, 33, 27);
  rect(0, 470, worldWidth, 70);

  fill(60, 82, 59);
  ellipse(270, 418, 560, 100);
  ellipse(980, 420, 680, 110);
  ellipse(1710, 422, 700, 110);
  ellipse(2200, 424, 420, 90);
}

function drawIntroPondArea() {
  noStroke();

  fill(48, 63, 44);
  ellipse(320, 412, 360, 92);

  fill(35, 45, 33);
  ellipse(320, 418, 325, 70);

  fill(62, 125, 150, 220);
  ellipse(320, 392, 270, 82);

  fill(105, 180, 205, 55);
  ellipse(285, 382, 125 + sin(frameCount * 0.03) * 6, 22);

  fill(145, 215, 235, 30);
  ellipse(350, 395, 150 + sin(frameCount * 0.025) * 5, 18);

  fill(82, 95, 78);
  ellipse(210, 405, 28, 14);
  ellipse(238, 414, 18, 10);
  ellipse(430, 410, 34, 16);
  ellipse(458, 404, 24, 12);

  fill(92, 132, 86);
  ellipse(255, 397, 18, 10);
  ellipse(274, 402, 14, 8);
  ellipse(388, 398, 20, 11);

  for (let i = 0; i < 8; i++) {
    let gx = 170 + i * 34;
    drawGrassClump(gx, 410, 0.9);
  }

  for (let i = 0; i < 5; i++) {
    let gx = 395 + i * 26;
    drawGrassClump(gx, 411, 0.75);
  }
}

function drawGrassClump(x, y, s) {
  push();
  translate(x, y);
  scale(s);

  fill(76, 116, 74);
  triangle(-8, 0, -2, -16, 2, 0);
  triangle(-2, 0, 4, -20, 8, 0);
  triangle(4, 0, 10, -14, 14, 0);

  pop();
}

function drawIntroForestArea() {
  for (let i = 0; i < 24; i++) {
    let tx = 760 + i * 68;
    let sway = sin(frameCount * 0.01 + i) * 2;

    fill(50, 34, 30);
    quad(tx, 430, tx + 16, 430, tx + 10 + sway, 310, tx - 6 + sway, 310);

    fill(34, 66, 45);
    ellipse(tx + 6, 292, 78, 72);
    ellipse(tx - 10, 305, 52, 46);
    ellipse(tx + 22, 305, 52, 46);

    fill(20, 30, 25, 80);
    ellipse(tx + 6, 345, 70, 20);
  }

  for (let i = 0; i < 18; i++) {
    let mx = 780 + i * 84;
    fill(110, 70, 130);
    ellipse(mx, 427, 12, 8);
    ellipse(mx + 6, 422, 10, 8);
  }
}

function drawIntroVillagePathArea() {
  fill(130, 112, 84);
  rect(1880, 410, 300, 18, 9);

  fill(228, 220, 190);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("Path", 2030, 378);

  fill(235, 200, 110, 70);
  ellipse(2060, 360, 60, 60);
}

function drawAmbientFireflies() {
  noStroke();
  for (let f of fireflies) {
    let bobX = sin(frameCount * 0.02 + f.offset) * 10;
    let bobY = cos(frameCount * 0.03 + f.offset) * 8;
    let glow = map(sin(frameCount * 0.05 + f.offset), -1, 1, 20, 90);

    fill(255, 235, 170, glow * 0.2);
    ellipse(f.x + bobX, f.y + bobY, f.size * 4, f.size * 4);

    fill(255, 235, 170, glow);
    ellipse(f.x + bobX, f.y + bobY, f.size, f.size);
  }
}

function drawForegroundPlants() {
  for (let i = 0; i < 24; i++) {
    let gx = cameraX + i * 45;

    fill(18, 28, 20, 180);
    triangle(gx, 430, gx + 10, 400, gx + 18, 430);
    triangle(gx + 12, 430, gx + 22, 395, gx + 30, 430);
  }
}

function drawIntroTopUI() {
  let panelW = 220;
  let panelH = 72;
  let x = width - panelW - 22;
  let y = 20;

  fill(10, 12, 18, 190);
  rect(x, y, panelW, panelH, 12);

  fill(255, 255, 255, 10);
  rect(x + 4, y + 4, panelW - 8, panelH - 8, 10);

  fill(240, 240, 246);
  textAlign(LEFT, TOP);
  textFont("Georgia");
  textSize(16);
  text("Objective", x + 16, y + 12);

  fill(214, 214, 226);
  textSize(14);
  text(introObjective, x + 16, y + 36);
}

function drawIntroDialogueBox() {
  let boxX = 22;
  let boxY = height - 122;
  let boxW = width - 44;
  let boxH = 96;

  fill(9, 11, 18, 210);
  rect(boxX, boxY, boxW, boxH, 14);

  fill(255, 255, 255, 8);
  rect(boxX + 5, boxY + 5, boxW - 10, boxH - 10, 12);

  fill(240, 240, 246);
  textAlign(LEFT, TOP);
  textFont("Georgia");
  textSize(16);
  text("Intro Sketch", boxX + 18, boxY + 14);

  fill(214, 214, 226);
  textSize(15);
  text(introDialogue, boxX + 18, boxY + 40, boxW - 150, 60);

  if (introPrompt !== "") {
    textAlign(RIGHT, BOTTOM);
    fill(255, 235, 180);
    textSize(14);
    text(introPrompt, boxX + boxW - 18, boxY + boxH - 14);
  }
}
