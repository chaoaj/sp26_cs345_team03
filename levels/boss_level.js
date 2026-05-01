let selectedClass = "Melee";

const SPR = "../../sprites/sprint2/";
const frameWidth = 320;
const frameHeight = 320;
const drawSize = 80;
const playerFootOffset = drawSize * 0.35;
const gravity = 0.6;
const jumpForce = -14;
const moveSpeed = 5;
const worldWidth = 3200;

let cameraX = 0;
let groundY = 0;

let spriteSheetMelee;
let spriteSheetMage;
let spriteSheet;
let atkMeleeLight;
let atkMeleeHeavy;
let atkMageLight;
let atkMageHeavy;
let atkLightSheet;
let atkHeavySheet;

let playerX = 220;
let playerY = 0;
let velY = 0;
let onGround = false;
let facingLeft = false;
let currentFrame = 0;
let moveFrameIndex = 0;
let animTimer = 0;

let attackType = "";
let attackFrame = 0;
let attackTimer = 0;
const attackFrameSpeed = 5;

let HP = 100;
let maxHP = 100;
let magic = 100;
let maxMagic = 100;
let stamina = 100;
let maxStamina = 100;

let isCharging = false;
let chargeTime = 0;
const maxChargeTime = 180;
let mageProjectiles = [];
let dungeonPlatforms = [];
const platformVisualOffset = 44;

let emberParticles = [];
let backButton;

function preload() {
  spriteSheetMelee = loadImage(SPR + "melee_class_320x320.png");
  spriteSheetMage = loadImage(SPR + "mage_class_320x320.png");
  atkMeleeLight = loadImage(SPR + "melee_attack_320x160.png");
  atkMeleeHeavy = loadImage(SPR + "heavy_melee_atk_320x320.png");
  atkMageLight = loadImage(SPR + "light_spell_atk_320x320.png");
  atkMageHeavy = loadImage(SPR + "heavy_spell_atk_320x320.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  try {
    let params = new URLSearchParams(window.location.search);
    let urlClass = params.get("class");
    if (urlClass === "Mage" || urlClass === "Melee") selectedClass = urlClass;
  } catch (e) {}

  syncClassAssets();
  groundY = height - 110 - playerFootOffset;
  playerY = groundY;
  buildDungeonPlatforms();
  seedEmbers();

  backButton = createButton("Back");
  backButton.size(96, 38);
  backButton.position(22, 20);
  styleBackButton(backButton);
  backButton.mousePressed(function() {
    window.location.href = "../../index.html?state=introLevel&class=" + encodeURIComponent(selectedClass);
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  groundY = height - 110 - playerFootOffset;
  buildDungeonPlatforms();
  if (playerY > groundY) playerY = groundY;
  if (backButton) backButton.position(22, 20);
}

function buildDungeonPlatforms() {
  let baseY = groundY - 88;
  dungeonPlatforms = [
    // Practical progression: alternating short climbs and recovery landings.
    { x: 430, y: baseY - 8, w: 150, h: 16 },
    { x: 670, y: baseY - 44, w: 150, h: 16 },
    { x: 910, y: baseY - 78, w: 160, h: 16 },
    { x: 1180, y: baseY - 44, w: 154, h: 16 },
    { x: 1420, y: baseY - 14, w: 160, h: 16 },
    { x: 1690, y: baseY - 52, w: 154, h: 16 },
    { x: 1940, y: baseY - 90, w: 166, h: 16 },
    { x: 2210, y: baseY - 58, w: 156, h: 16 },
    { x: 2460, y: baseY - 22, w: 162, h: 16 },
    { x: 2730, y: baseY - 64, w: 172, h: 16 }
  ];
}

function seedEmbers() {
  emberParticles = [];
  for (let i = 0; i < 80; i++) {
    emberParticles.push({
      x: random(worldWidth),
      y: random(60, height - 140),
      vy: random(-0.24, -0.05),
      vx: random(-0.12, 0.12),
      a: random(35, 115),
      r: random(1.2, 3.2)
    });
  }
}

function syncClassAssets() {
  if (selectedClass === "Mage") {
    spriteSheet = spriteSheetMage;
    atkLightSheet = atkMageLight;
    atkHeavySheet = atkMageHeavy;
  } else {
    spriteSheet = spriteSheetMelee;
    atkLightSheet = atkMeleeLight;
    atkHeavySheet = atkMeleeHeavy;
  }
}

function draw() {
  updatePlayer();
  updateMageProjectiles();
  updateEmbers();

  drawDungeonBackground();
  drawPlayer();
  drawMageProjectiles();
  drawChargeEffect();
  drawHUD();
}

function keyPressed() {
  if ((key === "w" || key === "W") && onGround) {
    velY = jumpForce;
    return;
  }

  if ((key === "q" || key === "Q") && attackType === "" && !isCharging) {
    if (selectedClass === "Mage") {
      if (magic <= 0) return;
      isCharging = true;
      chargeTime = 0;
    } else {
      if (stamina <= 0) return;
      attackType = "heavy";
      attackFrame = 0;
      attackTimer = 0;
      stamina = max(0, stamina - 18);
    }
  }
}

function keyReleased() {
  if ((key === "q" || key === "Q") && isCharging && selectedClass === "Mage") {
    fireHeavyMageProjectile();
    isCharging = false;
    chargeTime = 0;
  }
}

function mousePressed() {
  if (mouseX < 140 && mouseY < 72) return;
  if (isCharging || attackType !== "") return;
  if (selectedClass === "Mage") {
    if (magic <= 0) return;
    spawnLightMageProjectile();
    magic = max(0, magic - 9);
  } else {
    if (stamina <= 0) return;
    attackType = "light";
    attackFrame = 0;
    attackTimer = 0;
    stamina = max(0, stamina - 9);
  }
}

function updatePlayer() {
  let moving = false;
  let prevY = playerY;
  if (keyIsDown(68)) {
    playerX += moveSpeed;
    moving = true;
    facingLeft = false;
  }
  if (keyIsDown(65)) {
    playerX -= moveSpeed;
    moving = true;
    facingLeft = true;
  }

  playerX = constrain(playerX, 0, worldWidth - drawSize);
  velY += gravity;
  playerY += velY;
  onGround = false;

  let playerFootPrev = prevY + playerFootOffset;
  let playerFootNow = playerY + playerFootOffset;
  let playerLeft = playerX + 8;
  let playerRight = playerX + drawSize - 8;

  // Platform landing checks: only catch while falling through platform tops.
  if (velY >= 0) {
    for (let p of dungeonPlatforms) {
      let top = p.y;
      let overlapsX = playerRight > p.x + 6 && playerLeft < p.x + p.w - 6;
      if (overlapsX && playerFootPrev <= top + 2 && playerFootNow >= top) {
        playerY = top - playerFootOffset;
        velY = 0;
        onGround = true;
        break;
      }
    }
  }

  if (!onGround && playerY >= groundY) {
    playerY = groundY;
    velY = 0;
    onGround = true;
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

  cameraX = constrain(playerX - width * 0.45, 0, worldWidth - width);

  if (attackType !== "") {
    attackTimer++;
    if (attackTimer % attackFrameSpeed === 0) {
      attackFrame++;
      let info = getAtkInfo(attackType);
      if (attackFrame >= info.frames) {
        attackType = "";
        attackFrame = 0;
        attackTimer = 0;
      }
    }
  }

  if (selectedClass === "Mage") {
    magic = min(maxMagic, magic + 0.11);
  } else {
    stamina = min(maxStamina, stamina + 0.21);
  }

  if (isCharging && selectedClass === "Mage") {
    chargeTime = min(maxChargeTime, chargeTime + 1);
  }

}

function updateMageProjectiles() {
  for (let i = mageProjectiles.length - 1; i >= 0; i--) {
    let p = mageProjectiles[i];
    p.x += p.velX;
    p.distTraveled += abs(p.velX);
    p.animTimer++;
    if (p.animTimer % 5 === 0) p.frame++;

    let screenX = p.x - cameraX;
    let offScreen = screenX < -120 || screenX > width + 120;
    let expired = p.distTraveled >= p.maxDist;
    if (offScreen || expired) {
      mageProjectiles.splice(i, 1);
    }
  }
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
    maxDist: 240,
    distTraveled: 0,
    frame: 0,
    animTimer: 0
  });
}

function fireHeavyMageProjectile() {
  if (chargeTime <= 0) return;
  let ratio = chargeTime / maxChargeTime;
  let dir = facingLeft ? -1 : 1;
  mageProjectiles.push({
    x: playerX + drawSize / 2 + dir * (drawSize / 2 + 10),
    y: playerY + drawSize / 2,
    velX: dir * 11,
    type: "heavy",
    damage: lerp(22, 80, ratio),
    radius: lerp(18, 55, ratio),
    maxDist: Infinity,
    distTraveled: 0,
    frame: 0,
    animTimer: 0,
    ratio: ratio
  });
}

function updateEmbers() {
  for (let e of emberParticles) {
    e.x += e.vx;
    e.y += e.vy;
    if (e.y < 40) e.y = height - 120;
    if (e.x < 0) e.x = worldWidth;
    if (e.x > worldWidth) e.x = 0;
  }
}

function drawDungeonBackground() {
  background(16, 14, 24);

  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);
    stroke(lerpColor(color(22, 20, 30), color(8, 8, 13), t));
    line(0, y, width, y);
  }

  push();
  translate(-cameraX, 0);
  noStroke();

  fill(36, 33, 42);
  rect(0, 0, worldWidth, height);

  drawFarBackdrop();
  drawBrickRows(0, 0, worldWidth, groundY - 80);
  drawUpperButtresses();
  drawDungeonPillars();
  drawTorches();
  drawChains();
  drawBanners();
  drawMidgroundDetails();
  drawDungeonPlatforms();

  fill(44, 42, 52);
  rect(0, groundY + drawSize * 0.55, worldWidth, height - groundY);
  drawFloorTiles();
  drawLowerWallBase();

  for (let e of emberParticles) {
    fill(255, 150, 80, e.a);
    ellipse(e.x, e.y, e.r, e.r);
  }

  pop();
}

function drawDungeonPlatforms() {
  for (let p of dungeonPlatforms) {
    let py = p.y + platformVisualOffset;

    // platform shadow on wall behind for depth
    fill(18, 16, 24, 85);
    rect(p.x + 6, py + 8, p.w, 8, 3);

    // top stone slab
    fill(74, 70, 84, 210);
    rect(p.x, py, p.w, p.h, 4);
    fill(118, 114, 130, 60);
    rect(p.x + 8, py + 3, p.w - 16, 4, 2);

    // underside trim
    fill(44, 40, 52, 220);
    rect(p.x + 4, py + p.h - 2, p.w - 8, 7, 3);

    // short hanging supports to tie into dungeon look
    fill(56, 52, 64, 150);
    rect(p.x + 16, py + p.h + 5, 6, 15, 2);
    rect(p.x + p.w - 22, py + p.h + 5, 6, 15, 2);
  }
}

function drawFarBackdrop() {
  push();
  translate(cameraX * 0.15, 0);
  noStroke();

  // distant fortress silhouettes
  fill(20, 18, 28, 170);
  for (let x = -220; x < worldWidth + 240; x += 240) {
    rect(x, 70, 160, 240);
    triangle(x - 8, 70, x + 80, 18, x + 168, 70);
    rect(x + 54, 42, 52, 28);
  }

  // faint high windows for depth
  for (let x = -120; x < worldWidth + 120; x += 180) {
    fill(60, 68, 84, 45);
    rect(x, 132, 18, 34, 4);
    fill(120, 150, 180, 25);
    rect(x + 4, 138, 10, 20, 2);
  }

  pop();
}

function drawBrickRows(x, y, w, h) {
  for (let yy = y; yy < y + h; yy += 26) {
    for (let xx = x; xx < x + w; xx += 46) {
      let off = (floor(yy / 26) % 2) * 20;
      fill(35 + (xx % 4), 33 + (yy % 5), 43);
      rect(xx + off, yy, 42, 22, 2);
    }
  }
}

function drawUpperButtresses() {
  // Repeating vertical supports and arches to make walls read as a large keep.
  for (let x = 90; x < worldWidth; x += 210) {
    fill(42, 38, 50, 150);
    rect(x, 58, 32, 208);
    fill(58, 54, 66, 120);
    rect(x - 6, 46, 44, 12, 2);
    fill(26, 24, 34, 145);
    arc(x + 16, 266, 72, 58, PI, TWO_PI, CHORD);
  }

  // horizontal trim bands break up large wall areas
  fill(52, 48, 60, 95);
  rect(0, 188, worldWidth, 10);
  fill(28, 26, 36, 100);
  rect(0, 198, worldWidth, 5);
}

function drawDungeonPillars() {
  for (let x = 220; x < worldWidth; x += 320) {
    let pillarTop = 128;
    let pillarBottom = groundY + drawSize * 0.55;
    fill(48, 45, 56);
    rect(x, pillarTop, 42, pillarBottom - pillarTop);
    fill(58, 56, 66);
    rect(x - 9, pillarTop - 14, 60, 14, 3);
    rect(x - 9, pillarBottom - 12, 60, 12, 3);
  }
}

function drawTorches() {
  for (let x = 170; x < worldWidth; x += 300) {
    let y = 165 + sin(frameCount * 0.07 + x * 0.03) * 4;
    fill(78, 70, 84);
    rect(x - 4, y, 8, 28, 2);
    fill(255, 180, 80, 65);
    ellipse(x, y - 8, 54, 36);
    fill(255, 136, 60, 140);
    ellipse(x, y - 10, 24, 20);
    fill(255, 232, 180, 190);
    ellipse(x, y - 11, 8, 10);
  }
}

function drawChains() {
  stroke(74, 72, 84, 170);
  strokeWeight(2);
  for (let x = 320; x < worldWidth; x += 420) {
    for (let y = 0; y < 180; y += 12) {
      line(x - 5, y, x + 5, y + 10);
      line(x + 5, y, x - 5, y + 10);
    }
  }
  noStroke();
}

function drawBanners() {
  for (let x = 520; x < worldWidth; x += 640) {
    let sway = sin(frameCount * 0.03 + x * 0.01) * 10;
    fill(68, 26, 40, 220);
    beginShape();
    vertex(x, 134);
    vertex(x + 72, 134);
    vertex(x + 72 + sway, 242);
    vertex(x + 38 + sway * 0.5, 278);
    vertex(x + sway * 0.2, 242);
    endShape(CLOSE);
    fill(180, 140, 70, 180);
    ellipse(x + 36, 176, 18, 18);
  }
}

function drawMidgroundDetails() {
  let bandY = 238;

  // Subtle middle-depth balcony band.
  fill(42, 38, 50, 125);
  rect(0, bandY, worldWidth, 14);
  fill(28, 26, 36, 120);
  rect(0, bandY + 14, worldWidth, 6);

  // Narrow wall recesses/slits that blend with the brickwork.
  for (let x = 150; x < worldWidth; x += 230) {
    fill(30, 28, 38, 150);
    rect(x, bandY - 64, 26, 52, 3);
    fill(58, 54, 68, 90);
    rect(x + 4, bandY - 60, 18, 5, 2);
    rect(x + 4, bandY - 50, 18, 4, 2);
  }

  // Soft shadow arches in the middle plane.
  for (let x = 250; x < worldWidth; x += 420) {
    fill(24, 22, 32, 105);
    arc(x, bandY + 6, 86, 56, PI, TWO_PI, CHORD);
  }

  // Iron grates and hanging chains in middle depth.
  for (let x = 200; x < worldWidth; x += 320) {
    fill(36, 34, 44, 140);
    rect(x, bandY - 118, 52, 40, 3);
    stroke(70, 68, 82, 120);
    strokeWeight(1);
    for (let gx = x + 8; gx < x + 52; gx += 9) line(gx, bandY - 114, gx, bandY - 82);
    for (let gy = bandY - 112; gy < bandY - 82; gy += 8) line(x + 6, gy, x + 46, gy);
    noStroke();

    stroke(62, 60, 72, 110);
    for (let cy = 0; cy < 70; cy += 10) {
      line(x + 60, bandY - 170 + cy, x + 66, bandY - 162 + cy);
      line(x + 66, bandY - 170 + cy, x + 60, bandY - 162 + cy);
    }
    noStroke();
  }
}

function drawFloorTiles() {
  let y = groundY + drawSize * 0.55;
  for (let x = 0; x < worldWidth; x += 64) {
    fill(62, 58, 68);
    rect(x, y, 58, 18, 2);
    fill(40, 38, 46, 110);
    rect(x, y + 18, 58, 6, 2);
    fill(82, 78, 92, 35);
    rect(x + 8, y + 3, 20, 3, 1);
  }

  // occasional cracked stones for variation
  stroke(26, 24, 32, 120);
  strokeWeight(1);
  for (let x = 40; x < worldWidth; x += 170) {
    line(x, y + 8, x + 12, y + 4);
    line(x + 12, y + 4, x + 20, y + 10);
  }
  noStroke();
}

function drawLowerWallBase() {
  let floorY = groundY + drawSize * 0.55;
  let curbY = floorY + 22;

  // Continuous stone curb tying wall and floor together.
  fill(34, 32, 40, 170);
  rect(0, curbY, worldWidth, 16);
  fill(62, 58, 70, 90);
  rect(0, curbY - 2, worldWidth, 3);
  fill(22, 20, 28, 145);
  rect(0, curbY + 16, worldWidth, 8);

  // Repeating support blocks that match wall masonry proportions.
  for (let x = 28; x < worldWidth; x += 118) {
    fill(52, 48, 60, 155);
    rect(x, curbY - 8, 78, 12, 3);
    fill(30, 28, 36, 150);
    rect(x + 6, curbY + 4, 66, 11, 3);

    // subtle chips/rubble from same stone palette
    fill(70, 66, 80, 85);
    ellipse(x + 16, curbY + 21, 8, 6);
    ellipse(x + 36, curbY + 23, 6, 5);
    ellipse(x + 58, curbY + 22, 7, 5);
  }

  // Soft grounded shadow for depth at screen bottom.
  fill(10, 10, 16, 85);
  rect(0, curbY + 24, worldWidth, 24);
}

function drawPlayer() {
  if (!spriteSheet) return;

  push();
  let screenX = playerX - cameraX;
  let sx = currentFrame * frameWidth;
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

// returns { frames, srcH, drawW, drawH } for current class + attack type
function getAtkInfo(type) {
  if (selectedClass === "Melee") {
    if (type === "light") return { frames: 4, srcH: 160, drawW: 160, drawH: 80 };
    return { frames: 5, srcH: 320, drawW: 160, drawH: 160 };
  } else {
    if (type === "light") return { frames: 3, srcH: 320, drawW: 120, drawH: 120 };
    return { frames: 3, srcH: 320, drawW: 160, drawH: 160 };
  }
}

function drawAttack() {
  if (attackType === "" || !atkLightSheet || !atkHeavySheet) return;

  let info = getAtkInfo(attackType);
  let sheet = attackType === "light" ? atkLightSheet : atkHeavySheet;
  let screenX = playerX - cameraX;
  let sx = attackFrame * frameWidth;

  let effW = info.drawW;
  let effH = info.drawH;
  let effY = playerY + drawSize / 2 - effH / 2;
  let xOff = drawSize * 0.4;

  push();
  if (facingLeft) {
    translate(screenX - xOff + effW, effY);
    scale(-1, 1);
    image(sheet, 0, 0, effW, effH, sx, 0, frameWidth, info.srcH);
  } else {
    image(sheet, screenX + xOff, effY, effW, effH, sx, 0, frameWidth, info.srcH);
  }
  pop();
}

function drawMageProjectiles() {
  for (let p of mageProjectiles) {
    let screenX = p.x - cameraX;
    if (p.type === "light") drawLightProjectile(p, screenX);
    else drawHeavyProjectile(p, screenX);
  }
}

function drawLightProjectile(p, screenX) {
  if (!atkMageLight || !atkMageLight.width) return;
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
    image(atkMageLight, -p.drawW / 2, 0, p.drawW, p.drawH, sx, 0, frameWidth, 320);
  } else {
    image(atkMageLight, screenX - p.drawW / 2, p.y - p.drawH / 2, p.drawW, p.drawH, sx, 0, frameWidth, 320);
  }
  noTint();
  pop();
}

function drawHeavyProjectile(p, screenX) {
  if (!atkMageHeavy || !atkMageHeavy.width) return;
  let sz = lerp(100, 300, p.ratio);
  let sx = (p.frame % 3) * frameWidth;
  let goingLeft = p.velX < 0;

  push();
  if (goingLeft) {
    translate(screenX, p.y - sz / 2);
    scale(-1, 1);
    image(atkMageHeavy, -sz / 2, 0, sz, sz, sx, 0, frameWidth, 320);
  } else {
    image(atkMageHeavy, screenX - sz / 2, p.y - sz / 2, sz, sz, sx, 0, frameWidth, 320);
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

function drawHUD() {
  drawBar(18, 74, 190, 14, HP, maxHP, color(0, 90, 0), "HP");
  if (selectedClass === "Mage") drawBar(18, 100, 190, 14, magic, maxMagic, color(28, 64, 140), "MP");
  else drawBar(18, 100, 190, 14, stamina, maxStamina, color(176, 145, 26), "ST");
}

function drawBar(x, y, w, h, val, maxVal, col, label) {
  let fw = (val / maxVal) * w;
  noStroke();
  fill(8, 10, 16, 190);
  rect(x, y, w, h, 4);
  fill(col);
  rect(x, y, fw, h, 4);
  fill(255, 255, 255, 22);
  rect(x, y, fw, h / 2, 4);
  fill(220, 220, 230);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(label, x + w + 7, y + h / 2);
}

function styleBackButton(button) {
  button.style("font-family", "Georgia");
  button.style("font-size", "16px");
  button.style("font-weight", "bold");
  button.style("background", "linear-gradient(180deg, #d6d6db 0%, #a6a8b2 100%)");
  button.style("color", "#1f2230");
  button.style("border", "1px solid rgba(255,255,255,0.3)");
  button.style("border-radius", "10px");
  button.style("cursor", "pointer");
  button.style("box-shadow", "0 2px 7px rgba(0,0,0,0.35)");
}

