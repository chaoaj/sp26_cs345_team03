let this_guy;
let this_guy2;
let this_guy3;
let retryScreenOpacity = 140;

let gameState = "music";
let selectedClass = "";

let fadingFromBlack = false;
let blackFadeCount = 500;

let startButton;
let settingsButton;
let quitButton;
let backButton;
let level1DevButton;
let testLevelButton;
let bossLevelButton;

let isPaused = false;
let pauseSubScreen = "main"
let pauseMenuButton;
let pauseResumeButton;
let pauseSettingsButton;
let pauseQuitButton;
let pauseSnapshot = null;

let masterVolumeSlider;
let musicVolumeSlider;
let sfxVolumeSlider;

let musicTrack = [];
let sfxTrack = [];

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
let fairySprite;
let playerTalkSprite;
let dialogueSprite;
let npcSprites;
let traderSprite;
let skipDialogueButton;
let mageSprite;
let meleeSprite;

// pre-rendered static background buffers
let menuBgBuffer;
let introSkyBuffer;
let vignetteBuffer;

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

// melee attack system
let meleeAttacks = [];

// Hollow Purple charge system (mage heavy)
let isCharging = false;
let chargeTime = 0;
const maxChargeTime = 180; // 3 seconds at 60fps caps the charge

// extra sfx globals
let sfxWalking;
let sfxBarFull;
let sfxTextLoop;
let wasWalking = false;

function buildMenuBgBuffer() {
  if (menuBgBuffer) menuBgBuffer.remove();
  menuBgBuffer = createGraphics(width, height);
  let pg = menuBgBuffer;

  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);
    let top = color(13, 14, 28);
    let mid = color(28, 24, 48);
    let bot = color(70, 52, 92);
    let c = t < 0.55 ? lerpColor(top, mid, t / 0.55) : lerpColor(mid, bot, (t - 0.55) / 0.45);
    pg.stroke(c);
    pg.line(0, y, width, y);
  }
  pg.noStroke();

  let glowX = width * 0.63;
  let glowY = height * 0.22;
  for (let i = 0; i < 10; i++) {
    pg.fill(205, 215, 255, 10 - i * 0.7);
    pg.ellipse(glowX, glowY, 320 - i * 24, 220 - i * 16);
  }
  pg.fill(220, 230, 255, 14);
  pg.ellipse(glowX, glowY, 130, 90);

  pg.fill(25, 22, 42);
  pg.beginShape();
  pg.vertex(0, height * 0.72);
  pg.vertex(width * 0.06, height * 0.63);
  pg.vertex(width * 0.14, height * 0.68);
  pg.vertex(width * 0.22, height * 0.56);
  pg.vertex(width * 0.30, height * 0.65);
  pg.vertex(width * 0.39, height * 0.50);
  pg.vertex(width * 0.49, height * 0.63);
  pg.vertex(width * 0.58, height * 0.52);
  pg.vertex(width * 0.68, height * 0.66);
  pg.vertex(width * 0.78, height * 0.56);
  pg.vertex(width * 0.88, height * 0.67);
  pg.vertex(width, height * 0.58);
  pg.vertex(width, height);
  pg.vertex(0, height);
  pg.endShape(CLOSE);

  pg.fill(17, 15, 28);
  pg.beginShape();
  pg.vertex(0, height * 0.82);
  pg.vertex(width * 0.08, height * 0.73);
  pg.vertex(width * 0.16, height * 0.79);
  pg.vertex(width * 0.24, height * 0.67);
  pg.vertex(width * 0.33, height * 0.78);
  pg.vertex(width * 0.42, height * 0.69);
  pg.vertex(width * 0.52, height * 0.83);
  pg.vertex(width * 0.61, height * 0.70);
  pg.vertex(width * 0.71, height * 0.81);
  pg.vertex(width * 0.81, height * 0.69);
  pg.vertex(width * 0.91, height * 0.80);
  pg.vertex(width, height * 0.73);
  pg.vertex(width, height);
  pg.vertex(0, height);
  pg.endShape(CLOSE);

  pg.push();
  pg.translate(width * 0.67, height * 0.52);
  pg.fill(9, 9, 15);
  pg.rect(-36, 95, 170, 170);
  pg.rect(18, 18, 32, 247);
  pg.rect(82, 52, 36, 213);
  pg.rect(-74, 46, 34, 219);
  pg.triangle(-74, 46, -57, 6, -40, 46);
  pg.triangle(18, 18, 34, -28, 50, 18);
  pg.triangle(82, 52, 100, 10, 118, 52);
  pg.rect(17, 176, 40, 89, 13);
  pg.fill(255, 210, 50, 32);
  pg.rect(-24, 130, 12, 18);
  pg.rect(66, 118, 12, 18);
  pg.rect(92, 128, 12, 18);
  pg.pop();
}

function buildIntroSkyBuffer() {
  if (introSkyBuffer) introSkyBuffer.remove();
  introSkyBuffer = createGraphics(width, height);
  let pg = introSkyBuffer;

  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);
    let c1 = color(17, 15, 31);
    let c2 = color(48, 61, 72);
    let c3 = color(84, 90, 88);
    let c = t < 0.58 ? lerpColor(c1, c2, t / 0.58) : lerpColor(c2, c3, (t - 0.58) / 0.42);
    pg.stroke(c);
    pg.line(0, y, width, y);
  }
  pg.noStroke();
  pg.fill(220, 240, 255, 18);
  pg.ellipse(width * 0.72, 110, 180, 120);
}

function buildVignetteBuffer() {
  if (vignetteBuffer) vignetteBuffer.remove();
  vignetteBuffer = createGraphics(width, height);
  let pg = vignetteBuffer;
  pg.noFill();
  for (let i = 0; i < 78; i++) {
    pg.stroke(0, 0, 0, 3);
    pg.rect(-i, -i, width + i * 2, height + i * 2);
  }
  pg.noStroke();
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  traderSprite = npcSprites.get(40, 0, 240, 240);
  mageSprite = mageSprite.get(40, 0, 240, 240);
  meleeSprite = meleeSprite.get(40, 0, 240, 240);

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
  skipDialogueButton = createMusicButton("Skip Dialogue", 0, 0, function() {
    diaIndex = 0;
    nextDiaLine = 0;
    isDialogue = false;
    sfxTextLoop.stop();
    skipDialogueButton.hide();
    updateUI();
  })
  skipDialogueButton.hide();
  skipDialogueButton.size(200, 80);
  skipDialogueButton.position((width / 2) - 100, (height / 2) - 40)

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

  retryButton = createRetryButton("Retry", width * 0.4, height * 0.66, function () {
    gameState = "menu";
    mouseReleased = false;
    retryScreenOpacity = 0;
    HP = maxHP;
    updateUI();
  });
  


  mageButton = createMainMenuButton("Mage", 0, 0, function() {
    selectedClass = "Mage";
    initIntroLevel();
    fadingFromBlack = true;
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
    fadingFromBlack = true;
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
    if (isPaused && pauseSubScreen === "settings") {
      pauseSubScreen = "main";
      mouseReleased = false;
      updateUI();
      return;
    }
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

pauseMenuButton = createButton("☰");
pauseMenuButton.size(44, 44);
pauseMenuButton.position(26, 22);
styleSecondaryButton(pauseMenuButton);
pauseMenuButton.style("font-size", "22px");
pauseMenuButton.mousePressed(function() {
  if (gameState === "introLevel") {
    isPaused = true;
    pauseSubScreen = "main";
    mouseReleased = false;
    updateUI();
  }
});

pauseResumeButton = createMainMenuButton("Resume", 0, 0, function() {
  isPaused = false;
  pauseSnapshot = null;
  mouseReleased = false;
  updateUI();
  mouseReleased = false;
  updateUI();
});

pauseSettingsButton = createMainMenuButton("Settings", 0, 0, function() {
  pauseSubScreen = "settings";
  mouseReleased = false;
  updateUI();
});

pauseQuitButton = createMainMenuButton("Quit", 0, 0, function() {
  isPaused = false;
  pauseSnapshot = null;
  pauseSubScreen = "main";
  gameState = "menu";
  sfxAmbience.stop();
  if (sfxWalking && sfxWalking.isPlaying()) sfxWalking.stop();
  if (sfxTextLoop && sfxTextLoop.isPlaying()) sfxTextLoop.stop();
  musicDream.stop();
  musicIntro.loop();
  mouseReleased = false;
  updateUI();
});

layoutPauseButtons();


  // Open Level 1 in the same tab so gameplay stays in one site flow.
  level1DevButton = createButton("Level 1 (dev)");
  level1DevButton.size(168, 38);
  level1DevButton.position(width - 184, 98);
  styleSecondaryButton(level1DevButton);
  level1DevButton.mousePressed(function() {
    let path = window.location.pathname.indexOf("dev/index.html") >= 0
      ? "levels/your_level.html"
      : "dev/levels/your_level.html";
    let classParam = selectedClass === "Mage" ? "Mage" : "Melee";
    window.location.href = path + "?class=" + encodeURIComponent(classParam);
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

  bossLevelButton = createButton("Boss Level");
  bossLevelButton.size(168, 38);
  bossLevelButton.position(width - 184, 190);
  styleSecondaryButton(bossLevelButton);
  bossLevelButton.mousePressed(function() {
    let path = window.location.pathname.indexOf("dev/index.html") >= 0
      ? "levels/boss_level.html"
      : "dev/levels/boss_level.html";
    let classParam = selectedClass === "Mage" ? "Mage" : "Melee";
    window.location.href = path + "?class=" + encodeURIComponent(classParam);
  });
  bossLevelButton.hide();

  masterVolumeSlider = createSlider(0, 100, 50);
  musicVolumeSlider  = createSlider(0, 100, 50);
  sfxVolumeSlider    = createSlider(0, 100, 50);
  layoutVolumeSliders();

  buildMenuBgBuffer();
  buildIntroSkyBuffer();
  buildVignetteBuffer();
  layoutMenuButtons();
  layoutClassButtons();
  updateUI();

  // Allow direct return links into intro level from sub-pages.
  try {
    let params = new URLSearchParams(window.location.search);
    let startState = params.get("state");
    let urlClass = params.get("class");
    if (urlClass === "Mage" || urlClass === "Melee") {
      selectedClass = urlClass;
    }
    if (startState === "introLevel" && (selectedClass === "Mage" || selectedClass === "Melee")) {
      initIntroLevel(true);
      fadingFromBlack = true;
      gameState = "introLevel";
      musicButton.hide();
      musicIntro.stop();
      musicDream.stop();
      musicDream.loop();
      mouseReleased = false;
      updateUI();
    }
  } catch (e) {
    // Ignore malformed URL params.
  }
}

function preload() {
  this_guy = new Enemy("sml");
  this_guy2 = new Enemy("med");
  this_guy3 = new Enemy("boss");
  poemLines = loadStrings("./libraries/data/intro_poem.txt");
  fairyDia = loadStrings("./libraries/data/dialogue/fairy.txt");
  traderDia = loadStrings("./libraries/data/dialogue/trader.txt");
  npcSprites = loadImage("sprites/sprint2/npcs_320x320.png");
  mageSprite = loadImage("sprites/sprint2/mage_class_320x320.png");
  meleeSprite = loadImage("sprites/sprint2/melee_class_320x320.png");
  
  sfxLightMelee = loadSound("sounds/light swing.mp3");
  sfxHeavyMelee = loadSound("sounds/heavy swing.mp3");
  sfxLightMage  = loadSound("sounds/light spell.mp3");
  sfxHeavyMage  = loadSound("sounds/heavy spell.mp3");
  sfxAmbience = loadSound("sounds/forest ambience.mp3");
  musicIntro = loadSound("sounds/music/introScreen.mp3");
  musicDream = loadSound("sounds/music/Dream3.wav");


  sfxWalking  = loadSound("sounds/walking hard_surface2.mp3");
  sfxBarFull  = loadSound("sounds/bar full.mp3");
  sfxTextLoop = loadSound("sounds/text loop.mp3");
  
  musicTrack = [
  { sound: musicIntro, base: 0.4 },
  { sound: musicDream, base: 0.4 },
];

sfxTrack = [
  { sound: sfxLightMelee, base: 0.3 },
  { sound: sfxHeavyMelee, base: 0.3 },
  { sound: sfxLightMage,  base: 0.2 },
  { sound: sfxHeavyMage,  base: 0.5 },
  { sound: sfxAmbience,   base: 0.4 },
  { sound: sfxWalking,    base: 0.35 },
  { sound: sfxBarFull,    base: 0.5 },
  { sound: sfxTextLoop,   base: 0.2 },
];
}

function draw() {
  
  frames++;
  if (frames > 9) frames = 0;

  
  if (gameState !== "introLevel") drawFantasyBackground();

  if (gameState === "menu") {
    drawMenuPanel();
    drawTitle();
  } else if (gameState === "poem") {
    drawPoemScreen();
  } else if (gameState === "classSelect") {
    drawClassSelectScreen();
  } else if (gameState === "introLevel") {
    drawIntroLevelScreen();
    if (fadingFromBlack) {
      fill(0, 0, 0, blackFadeCount)
      rect(0, 0, width, height)
      blackFadeCount -= 5;
      if (blackFadeCount <= 0) {
        fadingFromBlack = false;
        skipDialogueButton.show();
        level1DevButton.show();
        testLevelButton.show();
        bossLevelButton.show();
        pauseMenuButton.show();
        blackFadeCount = 500;
      }
    }
  } else if (gameState === "settings") {
    drawSettingsScreen();
  } else if (gameState === "quit") {
    drawQuitScreen();
  } else if (gameState === "deathScreen") {
    drawRetryScreen();
  }
  if (entityWaitingForMouse == 0 && mouseIsPressed) {
    if (isDialogue) {
      if (mouseY > (height * 3) / 4) {
        entityWaitingForMouse = 1;
      }
    } else {
      entityWaitingForMouse = 1;
    }
    
  }

  outputVolume(masterVolumeSlider.value() / 100);

  let musicMul = musicVolumeSlider.value() / 100;
  for (let t of musicTrack) t.sound.setVolume(t.base * musicMul);

  let sfxMul = sfxVolumeSlider.value() / 100;
  for (let t of sfxTrack) t.sound.setVolume(t.base * sfxMul);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildMenuBgBuffer();
  buildIntroSkyBuffer();
  buildVignetteBuffer();
  layoutMenuButtons();
}

function keyPressed() {
  if (gameState !== "introLevel") return;

  if (keyCode === ESCAPE) {
    if(!isPaused) {
      isPaused = true;
      pauseSubScreen = "main"
    } else if (pauseSubScreen === "settings") {
      pauseSubScreen = "main"
    } else {
      isPaused = false;
      pauseSnapshot = null;
    }
    updateUI();
    return false;
  }

  if (isPaused) return;

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
      spawnHeavyMeleeAttack();
    }
    return;
  }

  if (key === ' ' || keyCode === ENTER) {
    if (introStage < 4) {
      introStage++;
    }
  }

  if (key === 'p' || key === 'P') {
    decrementHealth();
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

function initIntroLevel(skipDialogue = false) {
  introStage = skipDialogue ? 4 : 0;
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

  if (skipDialogue) {
    introDialogue = "Placeholder next area.";
    introPrompt = "";
    introObjective = "Continue";
    isDialogue = false;
    skipDialogueButton.hide();
    entityWaitingForMouse = -1;
    if (sfxTextLoop && sfxTextLoop.isPlaying()) sfxTextLoop.stop();
  } else {
    //init test dialogue
    //dialogue = new Dialogue("This is test dialogue. This should print on the screen letter by letter if it is working.")
    fairySprite = loadImage("sprites/sprint2/fairy_320x320.png");
    
    

    dialogueSprite = fairySprite
    initDiaFile("fairy");
    skipDialogueButton.show();
    isDialogue = true;
  }
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
  if (selectedClass === "Mage") {
    playerTalkSprite = mageSprite;
  }

  if (selectedClass === "Melee") {
    playerTalkSprite = meleeSprite;
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
  meleeAttacks = [];
  wasWalking = false;
  if (sfxWalking && sfxWalking.isPlaying()) sfxWalking.stop();
  if (sfxTextLoop && sfxTextLoop.isPlaying()) sfxTextLoop.stop();

  // Recreate intro enemies whenever intro level is entered.
  this_guy = new Enemy("sml");
  this_guy2 = new Enemy("med");
  this_guy3 = new Enemy("boss");

  // Returning from Level 1 should be immediately playable with enemies present.
  if (skipDialogue) {
    this_guy.spawnedIn = true;
    this_guy2.spawnedIn = true;
    this_guy3.spawnedIn = true;
  }
}

function decrementHealth() {
  //it hurts!!
  console.log("ow");
  HP -= random(5, 20);
  if (HP <= 0) {
    playerDie();
  }
}

function playerDie() {
  //should do death animation and then change gamestate
  //updateUI();
  gameState = "deathScreen";
  updateUI();
}

function drawHUD() {
  let x = 22;
  let y = 76;

  HP = constrain(HP, 0, maxHP);
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
  image(menuBgBuffer, 0, 0);
  drawStars();
  drawMistLayer(height - 70, 210, 0.12);
  drawMistLayer(height - 22, 260, 0.20);
  drawParticles();
  image(vignetteBuffer, 0, 0);
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

function drawRetryScreen() {
  pauseSnapshot = null;
  pauseCheck();

  
  fill(0, 0, 0, retryScreenOpacity);
  
  retryScreenOpacity += 2;
  retryScreenOpacity = constrain(retryScreenOpacity, 0, 140);
  rect(0, 0, width, height);

  for (i = 0; i < entityCount; i++) {
    if (entities[i].isAlive() && entities[i].constructor === Enemy) {
        if (entities[i].spawnedIn) {
            entities[i].health = 0;
            entities[i].load_enemies();

        }
    }
    entities[i].frameChange();
  }
  fill(245);
  textSize(100);
  text("YOU DIED", width / 2 - textSize() * 2.55, height * 0.33);
  retryButton.position(width / 2 - (width * 0.1) / 2, height * 0.66);
  retryButton.size(width * 0.1, height * 0.1);
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

  let bigFont = menuPanel.h * 0.056;
  let smallFont = menuPanel.h * 0.030;

  let bigGap = bigFont * 1.05;
  let smallGap = smallFont * 1.1;

  let subX = menuPanel.x + menuPanel.w * 0.12;

  textAlign(CENTER, TOP);
  textFont("Georgia");

  fill(165, 175, 220, 28);
  textStyle(BOLD);
  textSize(bigFont);
  text("That Time I Was", centerX + 3, y + 3);
  text("An Office Worker", centerX + 3, y + bigGap + 3);

  fill(245, 245, 250);
  text("That Time I Was", centerX, y);
  text("An Office Worker", centerX, y + bigGap);

  fill(206, 206, 220);
  textStyle(NORMAL);
  textSize(smallFont);
  let subY = y + bigGap + bigFont + smallFont * 0.8;
  textAlign(LEFT, TOP);
  text("and Was Put in a Coma by a", subX, subY);
  text("Demon Sleep God", subX, subY + smallGap);
  textAlign(CENTER, TOP);
}

function layoutMenuButtons() {
  let buttonW = menuPanel.w * 0.82;
  let buttonH = menuPanel.h * 0.078;

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

function layoutVolumeSliders() {
  let sliderW = 220;
  let sliderX = width / 2 - sliderW / 2;

  let panelY = height * 0.04;
  let panelH = 470;
  let startY = panelY + panelH * 0.55;
  let gap = panelH * 0.11;

  masterVolumeSlider.size(sliderW);
  musicVolumeSlider.size(sliderW);
  sfxVolumeSlider.size(sliderW);

  masterVolumeSlider.position(sliderX, startY);
  musicVolumeSlider.position(sliderX,  startY + gap);
  sfxVolumeSlider.position(sliderX,    startY + gap * 2);
}

function volumeSliderY(index) {
  let panelY = height * 0.04;
  let panelH = 470
  return panelY + panelH * 0.55 + index * panelH * 0.11;
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

function createRetryButton(label, x, y, action) {
  let button = createButton(label);
  button.size(300, 100);
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
  button.style("font-size", "clamp(14px, 1.6vw, 26px)");
  button.style("letter-spacing", "0.4px");
  button.style("border-radius", "10px");
  button.style("box-shadow", "0 0 0 rgba(0,0,0,0)");
  button.style("cursor", "pointer");
  button.style("text-align", "center");
  button.style("transition" , "all 0.18s ease");

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
  musicButton.hide();
  startButton.hide();
  settingsButton.hide();
  quitButton.hide();
  backButton.hide();
  pauseMenuButton.hide();
  pauseResumeButton.hide();
  pauseSettingsButton.hide();
  pauseQuitButton.hide();
  level1DevButton.hide();
  testLevelButton.hide();
  bossLevelButton.hide();
  masterVolumeSlider.hide();
  musicVolumeSlider.hide();
  sfxVolumeSlider.hide();  
  mageButton.hide();
  meleeButton.hide();

  retryButton.hide();

  if (gameState === "music") {
    musicButton.show();
  } else if (gameState === "menu") {
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
    if (isPaused) {
      if (pauseSubScreen === "main") {
        pauseResumeButton.show();
        pauseSettingsButton.show();
        pauseQuitButton.show();
      } else if (pauseSubScreen === "settings") {
        backButton.show();
        masterVolumeSlider.show();
        musicVolumeSlider.show();
        sfxVolumeSlider.show();
      } 
    } else {
      pauseMenuButton.show();
      level1DevButton.show();
      level1DevButton.position(width - 184, 98);
      testLevelButton.show();
      testLevelButton.position(width - 184, 144);
      bossLevelButton.show();
      bossLevelButton.position(width - 184, 190);
      }
  } else if (gameState === "settings") {
    backButton.show();
    masterVolumeSlider.show();
    musicVolumeSlider.show();
    sfxVolumeSlider.show();
  } else if (gameState === "quit") {
    backButton.show();
  } else if (gameState === "deathScreen") {
    retryButton.show();
    console.log("should be deathscreen");
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
  text("Settings", width / 2, height * 0.04 + 470 * 0.20);

  textStyle(NORMAL);
  textSize(22);
  fill(214, 214, 226);
  text("Volume", width / 2, height * 0.04 + 470 * 0.40);

  textSize(16);
  textAlign(CENTER, BOTTOM);
  text("Main",  width / 2, volumeSliderY(0) - 4);
  text("Music", width / 2, volumeSliderY(1) - 4);
  text("SFX",   width / 2, volumeSliderY(2) - 4);

  textAlign(CENTER, CENTER);
  textSize(16);
  
  text("Main: "  + masterVolumeSlider.value() +
      "   Music: " + musicVolumeSlider.value() +
      "   SFX: "   + sfxVolumeSlider.value(),
      width / 2, volumeSliderY(2) + 470 * 0.11);
}

function drawPauseScreen() {
  // dim
  fill(0, 0, 0, 140);
  rect(0, 0, width, height);

  if (pauseSubScreen === "main") {
    drawSubScreenPanel();

    fill(244, 244, 248);
    textAlign(CENTER, CENTER);
    textFont("Georgia");
    textStyle(BOLD);
    textSize(34);
    text("Paused", width / 2, height * 0.04 + 470 * 0.20);
    textStyle(NORMAL);
  } else if (pauseSubScreen === "settings") {
    drawSettingsScreen();
  }
}

function layoutPauseButtons() {
  let buttonW = 220;
  let buttonH = 50;
  let buttonX = width / 2 - buttonW / 2;

  let panelY = height * 0.04;
  let panelH = 470;
  let startY = panelY + panelH * 0.40;
  let gap    = panelH * 0.15;

  pauseResumeButton.size(buttonW, buttonH);
  pauseSettingsButton.size(buttonW, buttonH);
  pauseQuitButton.size(buttonW, buttonH);

  pauseResumeButton.position(buttonX, startY);
  pauseSettingsButton.position(buttonX, startY + gap);
  pauseQuitButton.position(buttonX, startY + gap * 2);
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

function pauseCheck() {
  if (pauseSnapshot) {
      // Subsequent paused frames: just blit the frozen image
      image(pauseSnapshot, 0, 0);
    } else {
      // First paused frame: draw world fresh, including enemies, then snapshot
      drawIntroWorld();
      drawPlayer();
      drawMageProjectiles();
      drawIntroTopUI();
      drawHUD();
      if (isDialogue) drawIntroDialogueBox();
      frameCalls();
      pauseSnapshot = get();
    }

}

function drawIntroLevelScreen() {
  if (!mouseIsPressed) {
    mouseReleased = true;
  }

  if (isPaused) {
    pauseCheck();
    drawPauseScreen();
    return;
  }
  

  if (!isDialogue) {
    if (this_guy && this_guy2 && this_guy3 && !this_guy.spawnedIn && !this_guy2.spawnedIn && !this_guy3.spawnedIn) {
      this_guy.spawnedIn = true;
      this_guy2.spawnedIn = true;
      this_guy3.spawnedIn = true;
    }
    updateIntroLevel();
    updatePlayer();
    updateMageProjectiles();
    updateMeleeAttacks();
  }

  drawIntroWorld();
  drawPlayer();
  if (fadingFromBlack) {
    skipDialogueButton.hide();
    level1DevButton.hide();
    testLevelButton.hide();
    bossLevelButton.hide();
    pauseMenuButton.hide();
    return;
  }
  drawMageProjectiles();
  drawIntroTopUI();
  drawHUD();
  if (isDialogue) drawIntroDialogueBox();
  frameCalls();
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
  bossLevelButton.position(width - 184, 190);
  layoutVolumeSliders();
  musicButton.position((width / 2) - 150, (height / 2) - 50);
  layoutPauseButtons();
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
    animTimer: 0,
    hitEnemies: []
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
    ratio: ratio,
    hitEnemies: []
  });
}

function spawnLightMeleeAttack() {
  let dir = facingLeft ? -1 : 1;
  let info = getAtkInfo("light");
  meleeAttacks.push({
    type: "light",
    damage: 15,
    dir: dir,
    x: playerX + (dir > 0 ? drawSize * 0.4 : -(info.drawW + drawSize * 0.4)),
    y: playerY + drawSize / 2 - info.drawH / 2,
    hitW: info.drawW,
    hitH: info.drawH,
    hitEnemies: []
  });
  attackType = "light";
  attackFrame = 0;
  attackTimer = 0;
  sfxLightMelee.play();
  stamina = max(0, stamina - 9);
}

function spawnHeavyMeleeAttack() {
  let dir = facingLeft ? -1 : 1;
  let info = getAtkInfo("heavy");
  meleeAttacks.push({
    type: "heavy",
    damage: 30,
    dir: dir,
    x: playerX + (dir > 0 ? drawSize * 0.4 : -(info.drawW + drawSize * 0.4)),
    y: playerY + drawSize / 2 - info.drawH / 2,
    hitW: info.drawW,
    hitH: info.drawH,
    hitEnemies: []
  });
  attackType = "heavy";
  attackFrame = 0;
  attackTimer = 0;
  sfxHeavyMelee.play();
  stamina = max(0, stamina - 18);
}

function updateMeleeAttacks() {
  for (let i = meleeAttacks.length - 1; i >= 0; i--) {
    let a = meleeAttacks[i];
    // keep hitbox anchored to player position each frame
    let xOff = a.dir > 0 ? drawSize * 0.4 : -(a.hitW + drawSize * 0.4);
    a.x = playerX + xOff;
    a.y = playerY + drawSize / 2 - a.hitH / 2;
    // expire when animation finishes (attackType cleared by updatePlayer)
    if (attackType === "") meleeAttacks.splice(i, 1);
  }
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
  if (isPaused) return;
  // ignore clicks on the back button area (top-left)
  if (mouseX < 140 && mouseY < 70) return;
  // ignore clicks where the Level 1 (dev) button sits (below objective panel)
  if (mouseX > width - 200 && mouseY > 88 && mouseY < 234) return;
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
        spawnLightMeleeAttack();
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
  drawIntroStaticGrass();
  pop();
}

function drawIntroSky() {
  image(introSkyBuffer, 0, 0);
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
  let gY = (3 * height) / 4;

  fill(42, 54, 40);
  rect(0, gY, worldWidth, (height * 19) / 80);

  fill(26, 33, 27);
  rect(0, (7 * height) / 8, worldWidth, (height) / 8);

  fill(60, 82, 59);
  ellipse(270, gY - 17, 560, 125);
  ellipse(980, gY - 15, 680, 138);
  ellipse(1710, gY - 12, 700, 138);
  ellipse(2200, gY - 10, 420, 113);
}

function drawIntroPondArea() {
  noStroke();
  let gY = (3 * height) / 4;

  fill(48, 63, 44);
  ellipse(320, gY - 25, 360, 115);

  fill(35, 45, 33);
  ellipse(320, gY - 17, 325, 88);

  fill(62, 125, 150, 220);
  ellipse(320, gY - 50, 270, 103);

  fill(105, 180, 205, 55);
  ellipse(285, gY - 62, 125 + sin(frameCount * 0.03) * 6, 28);

  fill(145, 215, 235, 30);
  ellipse(350, gY - 46, 150 + sin(frameCount * 0.025) * 5, 23);

  fill(82, 95, 78);
  ellipse(210, gY - 34, 28, 18);
  ellipse(238, gY - 22, 18, 13);
  ellipse(430, gY - 27, 34, 20);
  ellipse(458, gY - 35, 24, 15);

  fill(92, 132, 86);
  ellipse(255, gY - 44, 18, 13);
  ellipse(274, gY - 37, 14, 10);
  ellipse(388, gY - 42, 20, 14);

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
  let gY = (3 * height) / 4;
  for (let i = 0; i < 24; i++) {
    let tx = 760 + i * 68;
    let sway = sin(frameCount * 0.01 + i) * 2;

    fill(50, 34, 30);
    quad(tx, gY - 2, tx + 16, gY - 2, tx + 10 + sway, gY - 152, tx - 6 + sway, gY - 152);

    fill(34, 66, 45);
    ellipse(tx + 6, gY - 175, 78, 90);
    ellipse(tx - 10, gY - 159, 52, 58);
    ellipse(tx + 22, gY - 159, 52, 58);

    fill(20, 30, 25, 80);
    ellipse(tx + 6, gY - 109, 70, 25);
  }

  for (let i = 0; i < 18; i++) {
    let mx = 780 + i * 84;
    fill(110, 70, 130);
    ellipse(mx, gY - 6, 12, 10);
    ellipse(mx + 6, gY - 12, 10, 10);
  }
}

function drawIntroVillagePathArea() {
  let gY = (3 * height) / 4;
  fill(130, 112, 84);
  rect(1880, gY - 27, 300, 23, 9);

  fill(228, 220, 190);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("Path", 2030, gY - 162);

  fill(235, 200, 110, 70);
  ellipse(2060, gY - 90, 60, 75);
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

function drawIntroStaticGrass() {
  let gY = (3 * height) / 4;
  noStroke();
  for (let i = 0; i < width + 32; i += 24) {
    let gx = i - 8;
    let h1 = 16 + (i % 5) * 2;
    let h2 = 20 + (i % 7);
    let h3 = 14 + (i % 4) * 2;

    fill(28, 64, 32, 170);
    triangle(gx, gY + 3, gx + 5, gY - h1, gx + 10, gY + 3);

    fill(36, 84, 42, 175);
    triangle(gx + 7, gY + 3, gx + 13, gY - h2, gx + 19, gY + 3);

    fill(48, 104, 52, 160);
    triangle(gx + 14, gY + 3, gx + 18, gY - h3, gx + 22, gY + 3);
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
    printByWord(dialogue.getText(), boxX + 18, boxY + 40, 60, 18);
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
   if (!(showDiaSprite)) {
    fill(0, 0, 0)
    rect(boxX + ((boxW * 47) / 56) - 10, boxY + (boxH / 5) - 10, 70, 70)
    fill(50, 50, 50)
    rect(boxX + ((boxW * 47) / 56) - 5, boxY + (boxH / 5) - 5, 60, 60)
    image(dialogueSprite, boxX + ((boxW * 47) / 56), boxY + (boxH / 5), 50, 50);
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
