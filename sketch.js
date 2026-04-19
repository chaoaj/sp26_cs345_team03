let this_guy;

let gameState = "music";
let selectedClass = "";

let startButton;
let settingsButton;
let quitButton;
let backButton;
let level1DevButton;
let testLevelButton;
let volumeSlider;
let mouseReleased = false;
//-1 means not waiting, 0 means waiting with no click
//1 means something is waiting and the mouse has been clicked
let entityWaitingForMouse = -1;

let isDialogue = false;

let mageButton;
let meleeButton;

let sfxLightMelee;
let sfxHeavyMelee;
let sfxLightMage;
let sfxHeavyMage;
let sfxAmbience;

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
  get x() { return width * 0.073 },
  get y() { return height * 0.05 },
  get w() { return width * 0.238 },
  get h() { return height * 0.80 }
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

// mage projectile system
let mageProjectiles = [];

// Hollow Purple charge system (mage heavy)
let isCharging = false;
let chargeTime = 0;
const maxChargeTime = 180; // 3 seconds at 60fps caps the charge

// extra sfx globals
let sfxWalking;
let sfxBarFull;
let sfxTextLoop;
let wasWalking = false;

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

  musicButton = createMusicButton("Allow music?", 0, 0, function() {
    initMusic();
    updateUI();
    musicButton.hide();
    gameState = "menu"
    updateUI();
  })
  musicButton.size(300, 100);
  musicButton.position((width / 2) - 150, (height / 2) - 50);


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


  mageButton = createMainMenuButton("Mage", 0, 0, function() {
    selectedClass = "Mage";
    initIntroLevel();
    gameState = "introLevel";
    musicIntro.stop();
    musicDream.stop();
    musicDream.loop();
    mouseReleased = false;
    updateUI();
  });
  mageButton.size(200, 62);

  meleeButton = createMainMenuButton("Melee", 0, 0, function() {
    selectedClass = "Melee";
    initIntroLevel();
    gameState = "introLevel";
    musicIntro.stop();
    musicDream.stop();
    musicDream.loop();
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
      musicIntro.stop();
      musicDream.stop();
      musicIntro.loop();
    } else if (gameState === "classSelect") {
      mouseReleased = false;
      gameState = "poem";
    } else if (gameState === "introLevel") {
      gameState = "classSelect";
      sfxAmbience.stop();
      if (sfxWalking && sfxWalking.isPlaying()) sfxWalking.stop();
      if (sfxTextLoop && sfxTextLoop.isPlaying()) sfxTextLoop.stop();
    } else {
      gameState = "menu";
    }
    updateUI();
  });

  // TEMP: open standalone Level 1 prototype in a new tab (remove when merged into main sketch)
  level1DevButton = createButton("Level 1 (dev)");
  level1DevButton.size(168, 38);
  level1DevButton.position(width - 184, 98);
  styleSecondaryButton(level1DevButton);
  level1DevButton.mousePressed(function() {
    let path = window.location.pathname.indexOf("dev/index.html") >= 0
      ? "levels/your_level.html"
      : "dev/levels/your_level.html";
    let classParam = selectedClass === "Mage" ? "Mage" : "Melee";
    window.open(path + "?class=" + encodeURIComponent(classParam), "_blank", "noopener,noreferrer");
  });
  level1DevButton.hide();

  testLevelButton = createButton("Test Level");
  testLevelButton.size(168, 38);
  testLevelButton.position(width - 184, 144);
  styleSecondaryButton(testLevelButton);
  testLevelButton.mousePressed(function() {
    let path = window.location.pathname.indexOf("dev/index.html") >= 0
      ? "levels/test_level.html"
      : "dev/levels/test_level.html";
    let classParam = selectedClass === "Mage" ? "Mage" : "Melee";
    window.open(path + "?class=" + encodeURIComponent(classParam), "_blank", "noopener,noreferrer");
  });
  testLevelButton.hide();

  volumeSlider = createSlider(0, 100, 50);
  volumeSlider.position(width / 2 - 190/2, 300);
  volumeSlider.size(190);

  layoutMenuButtons();
  layoutClassButtons();
  updateUI();
}

function preload() {
  this_guy = new Enemy("sml");
  poemLines = loadStrings("./libraries/data/intro_poem.txt");
  fairyDia = loadStrings("./libraries/data/dialogue/fairy.txt");
  
  sfxLightMelee = loadSound("sounds/light swing.mp3");
  sfxHeavyMelee = loadSound("sounds/heavy swing.mp3");
  sfxLightMage  = loadSound("sounds/light spell.mp3");
  sfxHeavyMage  = loadSound("sounds/heavy spell.mp3");
  sfxAmbience = loadSound("sounds/forest ambience.mp3");
  musicIntro = loadSound("sounds/music/introScreen.mp3");
  musicDream = loadSound("sounds/music/Dream3.wav");

  sfxHeavyMage.setVolume(0.5);
  sfxLightMage.setVolume(0.2);
  sfxHeavyMelee.setVolume(0.3);
  sfxLightMelee.setVolume(0.3);

  sfxWalking  = loadSound("sounds/walking hard_surface2.mp3");
  sfxBarFull  = loadSound("sounds/bar full.mp3");
  sfxTextLoop = loadSound("sounds/text loop.mp3");
  sfxWalking.setVolume(0.35);
  sfxBarFull.setVolume(0.5);
  sfxTextLoop.setVolume(0.2);

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
  if (entityWaitingForMouse == 0 && mouseIsPressed) {
    entityWaitingForMouse = 1;
  }
  frameCalls();
}

function keyPressed() {
  if (gameState !== "introLevel") return;

  if ((key === 'w' || key === 'W') && onGround) {
    velY = jumpForce;
    return;
  }

  if ((key === 'q' || key === 'Q') && attackType === "" && !isCharging) {
    if (magic <= 0 || stamina <= 0) {
      return;
    }
    if (selectedClass === "Mage") {
      isCharging = true;
      chargeTime = 0;
    } else {
      attackType = "heavy";
      attackFrame = 0;
      attackTimer = 0;
      sfxHeavyMelee.play();
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

function initMusic() {
  musicIntro.setVolume(0.4);
  musicIntro.loop();
}

function keyReleased() {
  if (gameState !== "introLevel") return;
  if ((key === 'q' || key === 'Q') && isCharging && selectedClass === "Mage") {
    fireHeavyMageProjectile();
    isCharging = false;
    chargeTime = 0;
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

  sfxAmbience.setVolume(0.4);
  sfxAmbience.loop();

  introDialogue = "Placeholder intro text.";
  introPrompt = "Click to continue";
  introObjective = "Begin";

  //init test dialogue
  //dialogue = new Dialogue("This is test dialogue. This should print on the screen letter by letter if it is working.")
  initDiaFile();
  isDialogue = true;
  // init player
  groundY = (height * 3 / 4) - drawSize;
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

  isCharging = false;
  chargeTime = 0;
  mageProjectiles = [];
  wasWalking = false;
  if (sfxWalking && sfxWalking.isPlaying()) sfxWalking.stop();
  if (sfxTextLoop && sfxTextLoop.isPlaying()) sfxTextLoop.stop();
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
  let glowX = width * 0.75;
  let glowY = height * 0.25;

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

  let s = height / 900;
  let castleX = width * 0.67;
  let castleY = height * 0.52;

  translate(castleX, castleY);
  fill(9, 9, 15);

  rect(-36*s, 95*s,  170*s, 170*s);
  rect( 18*s, 18*s,   32*s, 247*s);
  rect( 82*s, 52*s,   36*s, 213*s);
  rect(-74*s, 46*s,   34*s, 219*s);

  triangle(-74*s, 46*s, -57*s,  6*s, -40*s, 46*s);
  triangle( 18*s, 18*s,  34*s, -28*s,  50*s, 18*s);
  triangle( 82*s, 52*s, 100*s,  10*s, 118*s, 52*s);

  rect(17*s, 176*s, 40*s, 89*s, 13);

  fill(255, 210, 50, 32);
  rect(-24*s, 130*s, 12*s, 18*s);
  rect( 66*s, 118*s, 12*s, 18*s);
  rect( 92*s, 128*s, 12*s, 18*s);

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
  let panelY = height * 0.04;

  fill(7, 8, 12, 176);
  rect(panelX, panelY, panelW, panelH, 18);

  fill(255, 255, 255, 10);
  rect(panelX + 6, panelY + 6, panelW - 12, panelH - 12, 16);

  stroke(190, 195, 225, 32);
  noFill();
  rect(panelX + 12, panelY + 12, panelW - 24, panelH - 24, 16);

  return { x: panelX, y: panelY, w: panelW, h: panelH };
}

function drawTitle() {
  let centerX = menuPanel.x + menuPanel.w / 2;
  let y = menuPanel.y + menuPanel.h * 0.06;

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
  let startY = menuPanel.y + menuPanel.h * 0.52;
  let gap = menuPanel.h * 0.152;
  let buttonX = menuPanel.x + (menuPanel.w - buttonW) / 2;

  startButton.size(buttonW, buttonH);
  settingsButton.size(buttonW, buttonH);
  quitButton.size(buttonW, buttonH);

  startButton.position(buttonX, startY);
  settingsButton.position(buttonX, startY + gap);
  quitButton.position(buttonX, startY + gap * 2);
}

function layoutClassButtons() {
  let panelW = 590;
  let panelH = 470;
  let panelX = width * 0.5 - panelW * 0.5;
  let panelY = height * 0.04;

  let titleY = panelY + panelH * 0.18;
  let descY  = panelY + panelH * 0.82;
  let midY   = (titleY + descY) / 2;

  mageButton.position(panelX + panelW / 2 - 100, midY - 72);
  meleeButton.position(panelX + panelW / 2 - 100, midY + 10);
}

function createMusicButton(label, x, y, action) {
  let button = createButton(label);
  button.size(300, 100);
  button.position((width / 2) - (150), (height / 2) - 50);
  styleMainButton(button);
  button.mousePressed(action);
  return button;
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
  level1DevButton.hide();
  testLevelButton.hide();
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
    level1DevButton.show();
    level1DevButton.position(width - 184, 98);
    testLevelButton.show();
    testLevelButton.position(width - 184, 144);
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
  let p = drawSubScreenPanel();

  fill(244, 244, 248);
  textAlign(CENTER, CENTER);
  textFont("Georgia");
  textStyle(BOLD);
  textSize(34);
  text("Select a Class", p.x + p.w / 2, p.y + p.h * 0.18);

  textStyle(NORMAL);
  textSize(18);
  fill(214, 214, 226);
  text("Mage uses spell power and ranged magic.", p.x + p.w / 2, p.y + p.h * 0.82);
  text("Melee focuses on close combat and raw strength.", p.x + p.w / 2, p.y + p.h * 0.90);
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
  let p = drawSubScreenPanel();

  fill(244, 244, 248);
  textAlign(CENTER, CENTER);
  textFont("Georgia");
  textStyle(BOLD);
  textSize(34);
  text("Return to Sleep", p.x + p.w / 2, p.y + p.h * 0.35);

  textStyle(NORMAL);
  textSize(20);
  fill(214, 214, 226);
  text("Leave this screen and return to the title menu.", p.x + p.w / 2, p.y + p.h * 0.55);
  text("Press Back to continue.", p.x + p.w / 2, p.y + p.h * 0.65);
}

function drawIntroLevelScreen() {
  if (!mouseIsPressed) {
    mouseReleased = true;
  }

  if (!(isDialogue)) {
    updateIntroLevel();
    updatePlayer();
    updateMageProjectiles();
  }
  
  drawIntroWorld();
  drawPlayer();
  drawMageProjectiles();
  drawIntroTopUI();
  drawHUD();
  if (isDialogue) {
    drawIntroDialogueBox();
  }
}

function windowResized() {
  let minW = 960;
  let minH = 540;

  resizeCanvas(max(windowWidth, minW), max(windowHeight, minH));

  groundY = (height * 3 / 4) - drawSize;
  if (playerY > groundY) playerY = groundY;
  layoutMenuButtons();
  layoutClassButtons();
  level1DevButton.position(width - 184, 98);
  testLevelButton.position(width - 184, 144);
  volumeSlider.position(width / 2 - 95, height * 0.35);
  musicButton.position((width / 2) - 150, (height / 2) - 50);
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

  // hollow purple charge tick
  if (isCharging && selectedClass === "Mage") {
    chargeTime = min(chargeTime + 1, maxChargeTime);
    magic = max(0, magic - 0.15);
    if (magic <= 0) {
      fireHeavyMageProjectile();
      isCharging = false;
      chargeTime = 0;
    }
  }

  // gradual regen
  if (!isCharging) {
    if (selectedClass === "Mage") {
      let prev = magic;
      magic = min(maxMagic, magic + 0.07);
      if (prev < maxMagic && magic >= maxMagic && sfxBarFull) sfxBarFull.play();
    } else {
      let prev = stamina;
      stamina = min(maxStamina, stamina + 0.15);
      if (prev < maxStamina && stamina >= maxStamina && sfxBarFull) sfxBarFull.play();
    }
  }

  // footstep SFX
  let isWalking = moving && onGround;
  if (isWalking && !wasWalking && sfxWalking) {
    sfxWalking.loop();
  } else if (!isWalking && wasWalking && sfxWalking) {
    sfxWalking.stop();
  }
  wasWalking = isWalking;
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

  if (selectedClass === "Mage") {
    drawChargeEffect();
  } else {
    drawAttack();
  }
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

function spawnLightMageProjectile() {
  let dir = facingLeft ? -1 : 1;
  mageProjectiles.push({
    x: playerX + drawSize / 2 + dir * (drawSize / 2 + 10),
    y: playerY + drawSize / 2,
    velX: dir * 9,
    type: "light",
    damage: 15,
    drawW: 80,
    drawH: 80,
    maxDist: 340,
    distTraveled: 0,
    frame: 0,
    animTimer: 0
  });
}

function fireHeavyMageProjectile() {
  if (chargeTime <= 0) return;
  let ratio = chargeTime / maxChargeTime;
  let damage = lerp(22, 80, ratio);
  if (ratio === 1.0) {
    damage = 999999999;
  }
  let radius = lerp(18, 55, ratio);
  let dir = facingLeft ? -1 : 1;
  sfxHeavyMage.play();
  mageProjectiles.push({
    x: playerX + drawSize / 2 + dir * (drawSize / 2 + 10),
    y: playerY + drawSize / 2,
    velX: dir * 11,
    type: "heavy",
    damage: damage,
    radius: radius,
    maxDist: Infinity,
    distTraveled: 0,
    frame: 0,
    animTimer: 0,
    ratio: ratio
  });
}

function updateMageProjectiles() {
  for (let i = mageProjectiles.length - 1; i >= 0; i--) {
    let p = mageProjectiles[i];
    p.x += p.velX;
    p.distTraveled += abs(p.velX);
    p.animTimer++;
    if (p.animTimer % 5 === 0) p.frame++;

    // when enemies are added: light stops on first hit (hit=true; break),
    // heavy pierces all — do NOT break, let it continue through every enemy

    let screenX = p.x - cameraX;
    let offScreen = screenX < -120 || screenX > width + 120;
    let expired = p.distTraveled >= p.maxDist;
    if (offScreen || expired) mageProjectiles.splice(i, 1);
  }
}

function drawMageProjectiles() {
  for (let p of mageProjectiles) {
    let screenX = p.x - cameraX;
    if (p.type === "light") drawLightProjectile(p, screenX);
    else drawHeavyProjectile(p, screenX);
  }
}

function drawLightProjectile(p, screenX) {
  if (!atkLightSheet) return;
  let alpha = 255;
  let remaining = p.maxDist - p.distTraveled;
  if (remaining < 60) alpha = map(remaining, 0, 60, 0, 255);

  let sx = (p.frame % 3) * frameWidth;
  let goingLeft = p.velX < 0;

  push();
  tint(255, alpha);
  if (goingLeft) {
    translate(screenX, p.y - p.drawH / 2);
    scale(-1, 1);
    image(atkLightSheet, -p.drawW / 2, 0, p.drawW, p.drawH, sx, 0, frameWidth, 320);
  } else {
    image(atkLightSheet, screenX - p.drawW / 2, p.y - p.drawH / 2, p.drawW, p.drawH, sx, 0, frameWidth, 320);
  }
  noTint();
  pop();
}

function drawHeavyProjectile(p, screenX) {
  if (!atkHeavySheet) return;
  let drawSize = lerp(100, 300, p.ratio);
  let sx = (p.frame % 3) * frameWidth;
  let goingLeft = p.velX < 0;

  push();
  if (goingLeft) {
    translate(screenX, p.y - drawSize / 2);
    scale(-1, 1);
    image(atkHeavySheet, -drawSize / 2, 0, drawSize, drawSize, sx, 0, frameWidth, 320);
  } else {
    image(atkHeavySheet, screenX - drawSize / 2, p.y - drawSize / 2, drawSize, drawSize, sx, 0, frameWidth, 320);
  }
  pop();
}

function drawChargeEffect() {
  if (!isCharging) return;
  let ratio = chargeTime / maxChargeTime;
  let r = lerp(6, 28, ratio);
  let pulse = sin(frameCount * 0.22) * 3;
  let screenX = playerX - cameraX + (facingLeft ? -r - 8 : drawSize + r + 8);
  let ey = playerY + drawSize / 2;

  push();
  noStroke();
  fill(180, 60, 240, 30);
  ellipse(screenX, ey, (r + pulse) * 4, (r + pulse) * 4);
  fill(210, 100, 255, 60);
  ellipse(screenX, ey, (r + pulse) * 2.5, (r + pulse) * 2.5);
  fill(240, 160, 255, 140);
  ellipse(screenX, ey, (r + pulse) * 1.4, (r + pulse) * 1.4);
  fill(255, 240, 255, 220);
  ellipse(screenX, ey, r * 0.7, r * 0.7);

  if (ratio > 0.85) {
    fill(255, 235, 100);
    textAlign(CENTER, BOTTOM);
    textFont("Georgia");
    textSize(13);
    text("MAX", screenX, ey - r - 10);
  }
  pop();
}

function mousePressed() {
  if (gameState !== "introLevel") return;
  // ignore clicks on the back button area (top-left)
  if (mouseX < 140 && mouseY < 70) return;
  // ignore clicks where the Level 1 (dev) button sits (below objective panel)
  if (mouseX > width - 200 && mouseY > 88 && mouseY < 148) return;
  if (!mouseReleased) return;
  if (stamina <= 0 || magic <= 0) return;
  if (isCharging) return;
  if (!(isDialogue)) {
    if (attackType === "") {
      if (selectedClass === "Mage") {
        spawnLightMageProjectile();
        sfxLightMage.play();
        magic = max(0, magic - 9);
      } else {
        attackType = "light";
        attackFrame = 0;
        attackTimer = 0;
        sfxLightMelee.play();
        stamina = max(0, stamina - 9);
      }
    }
  }
  
}

function updateIntroLevel() {
  introPrompt = "";

  if (introStage === 0) {
    introObjective = "Begin";
    introDialogue = "Placeholder intro text.";
    introPrompt = "Click to continue";
  } else if (introStage === 1) {
    introObjective = "Continue";
    introDialogue = "Placeholder.";
    introPrompt = "Click to continue";
  } else if (introStage === 2) {
    introObjective = "Continue";
    introDialogue = "Placeholder.";
    introPrompt = "Click to continue";
  } else if (introStage === 3) {
    introObjective = "Continue";
    introDialogue = "Placeholder.";
    introPrompt = "Click to continue";
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
  textSize(30)
  rect(0, (3 * height) / 4, worldWidth, (height * 19) / 80);
  //rect(0, 410, worldWidth, (height * 19) / 100);


  fill(26, 33, 27);
  //rect(0, 470, worldWidth, 70);
  rect(0, (7 * height) / 8, worldWidth, (height) / 8);

  fill(60, 82, 59);
  //text(width + " " + height, width / 2, height / 2)
  ellipse(270, 523, 560, 125);
  ellipse(980, 525, 680, 138);
  ellipse(1710, 528, 700, 138);
  ellipse(2200, 530, 420, 113);
}

function drawIntroPondArea() {
  noStroke();

  fill(48, 63, 44);
  ellipse(320, 515, 360, 115);

  fill(35, 45, 33);
  ellipse(320, 523, 325, 88);

  fill(62, 125, 150, 220);
  ellipse(320, 490, 270, 103);

  fill(105, 180, 205, 55);
  ellipse(285, 478, 125 + sin(frameCount * 0.03) * 6, 28);

  fill(145, 215, 235, 30);
  ellipse(350, 494, 150 + sin(frameCount * 0.025) * 5, 23);

  fill(82, 95, 78);
  ellipse(210, 506, 28, 18);
  ellipse(238, 518, 18, 13);
  ellipse(430, 513, 34, 20);
  ellipse(458, 505, 24, 15);

  fill(92, 132, 86);
  ellipse(255, 496, 18, 13);
  ellipse(274, 503, 14, 10);
  ellipse(388, 498, 20, 14);

  for (let i = 0; i < 8; i++) {
    let gx = 170 + i * 34;
    drawGrassClump(gx, 513, 0.9);
  }

  for (let i = 0; i < 5; i++) {
    let gx = 395 + i * 26;
    drawGrassClump(gx, 514, 0.75);
  }
}

function drawGrassClump(x, y, s) {
  push();
  translate(x, y);
  scale(s);

  fill(76, 116, 74);
  triangle(-8, 0, -2, -20, 2, 0);
  triangle(-2, 0, 4, -25, 8, 0);
  triangle(4, 0, 10, -18, 14, 0);

  pop();
}

function drawIntroForestArea() {
  for (let i = 0; i < 24; i++) {
    let tx = 760 + i * 68;
    let sway = sin(frameCount * 0.01 + i) * 2;

    fill(50, 34, 30);
    quad(tx, 538, tx + 16, 538, tx + 10 + sway, 388, tx - 6 + sway, 388);

    fill(34, 66, 45);
    ellipse(tx + 6, 365, 78, 90);
    ellipse(tx - 10, 381, 52, 58);
    ellipse(tx + 22, 381, 52, 58);

    fill(20, 30, 25, 80);
    ellipse(tx + 6, 431, 70, 25);
  }

  for (let i = 0; i < 18; i++) {
    let mx = 780 + i * 84;
    fill(110, 70, 130);
    ellipse(mx, 534, 12, 10);
    ellipse(mx + 6, 528, 10, 10);
  }
}

function drawIntroVillagePathArea() {
  fill(130, 112, 84);
  // double check later
  rect(1880, 513, 300, 23, 9);

  fill(228, 220, 190);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("Path", 2030, 378);

  fill(235, 200, 110, 70);
  ellipse(2060, 450, 60, 75);
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
    triangle(gx, 538, gx + 10, 500, gx + 18, 538);
    triangle(gx + 12, 538, gx + 22, 494, gx + 30, 538);
  }
}

function drawIntroTopUI() {
  let panelW = 220;
  let panelH = 90;
  let x = width - panelW - 22;
  let y = 25;

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
  let boxX = width / 4;
  let boxY = height - 153;
  let boxW = width / 2;
  let boxH = 120;

  fill(9, 11, 18, 210);
  rect(boxX, boxY, boxW, boxH, 14);

  fill(255, 255, 255, 8);
  rect(boxX + 5, boxY + 5, boxW - 10, boxH - 10, 12);

  fill(240, 240, 246);
  textAlign(LEFT, TOP);
  textFont("Georgia");
  textSize(16);
  //text("Intro Sketch", boxX + 18, boxY + 14);

  fill(214, 214, 226);
  textSize(15);
  if (isDialogue) {
    textAlign(LEFT, TOP);
    printByWord(dialogue.getText(), boxX + 18, boxY + 40, 80, 18);
    if (!dialogue.finished && sfxTextLoop && !sfxTextLoop.isPlaying()) sfxTextLoop.loop();
    else if (dialogue.finished && sfxTextLoop && sfxTextLoop.isPlaying()) sfxTextLoop.stop();
  }
  //text(introDialogue, boxX + 18, boxY + 40, boxW - 150, 60);

  if (introPrompt !== "") {
    textAlign(RIGHT, BOTTOM);
    fill(255, 235, 180);
    textSize(14);
    text(introPrompt, boxX + boxW - 18, boxY + boxH - 14);
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
