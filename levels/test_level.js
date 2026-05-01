/**
 * Test Level – Attack Range Arena
 *
 * A flat training room for testing attacks and ranges.
 * Dummies are placed at increasing distances from spawn.
 *
 * Controls: A/D move, W jump, Click light, Hold Q charge heavy (Mage), Q heavy (Melee), M toggle class
 */

let selectedClass = "Mage";

let spriteSheetMelee;
let spriteSheetMage;
let spriteSheet;
let atkMeleeLight;
let atkMeleeHeavy;
let atkMageLight;
let atkMageHeavy;
let atkLightSheet;
let atkHeavySheet;

let playerX = 160;
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

let cameraX = 0;
const worldWidth = 2000;

let attackType = "";
let attackFrame = 0;
let attackTimer = 0;
const attackFrameSpeed = 5;

let magic = 100;
let maxMagic = 100;
let stamina = 100;
let maxStamina = 100;

// mage projectile system
let mageProjectiles = [];
let isCharging = false;
let chargeTime = 0;
const maxChargeTime = 180;

// dummies: x position, label, hp
const DUMMY_DEFS = [
  { x: 380,  label: "CLOSE\n(melee)" },
  { x: 560,  label: "MID\n(240px)" },
  { x: 760,  label: "FAR\n(heavy)" },
  { x: 1060, label: "VERY FAR" },
  { x: 1400, label: "MAX RANGE" }
];

let dummies = [];

const SPR = "../../sprites/sprint2/";

function preload() {
  spriteSheetMelee = loadImage(SPR + "melee_class_320x320.png");
  spriteSheetMage  = loadImage(SPR + "mage_class_320x320.png");
  atkMeleeLight    = loadImage(SPR + "melee_attack_320x160.png");
  atkMeleeHeavy    = loadImage(SPR + "heavy_melee_atk_320x320.png");
  atkMageLight     = loadImage(SPR + "light_spell_atk_320x320.png");
  atkMageHeavy     = loadImage(SPR + "heavy_spell_atk_320x320.png");
}

function syncClassAssets() {
  if (selectedClass === "Mage") {
    spriteSheet  = spriteSheetMage;
    atkLightSheet = atkMageLight;
    atkHeavySheet = atkMageHeavy;
  } else {
    spriteSheet  = spriteSheetMelee;
    atkLightSheet = atkMeleeLight;
    atkHeavySheet = atkMeleeHeavy;
  }
}

function resetDummies() {
  dummies = [];
  for (let def of DUMMY_DEFS) {
    dummies.push({
      x: def.x,
      label: def.label,
      hp: 100,
      maxHp: 100,
      flashTimer: 0,
      dead: false,
      respawnTimer: 0
    });
  }
}

function setup() {
  createCanvas(960, 540);

  let urlClass = null;
  try {
    let params = new URLSearchParams(window.location.search);
    urlClass = params.get("class");
  } catch (e) {}
  if (urlClass === "Mage" || urlClass === "Melee") selectedClass = urlClass;

  syncClassAssets();
  groundY = height - 110 - drawSize * 0.35;
  playerY = groundY;
  playerX = 160;
  cameraX = 0;
  resetDummies();
}

function draw() {
  updatePlayer();
  updateMageProjectiles();
  updateDummies();

  drawArena();
  drawRangeMarkers();
  drawDummies();
  drawPlayer();
  drawMageProjectiles();

  drawHUD();
  drawControlsHint();
}

// ── input ─────────────────────────────────────────────────────────────────────

function keyPressed() {
  if ((key === "w" || key === "W") && onGround) {
    velY = jumpForce;
    return;
  }
  if (key === "m" || key === "M") {
    selectedClass = selectedClass === "Mage" ? "Melee" : "Mage";
    attackType = "";
    attackFrame = 0;
    attackTimer = 0;
    isCharging = false;
    chargeTime = 0;
    mageProjectiles = [];
    syncClassAssets();
    return;
  }
  if (key === "r" || key === "R") {
    resetDummies();
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
  if (isCharging) return;
  if (attackType === "") {
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
}

// ── player ────────────────────────────────────────────────────────────────────

function updatePlayer() {
  let moving = false;
  if (keyIsDown(68)) { playerX += 5; moving = true; facingLeft = false; }
  if (keyIsDown(65)) { playerX -= 5; moving = true; facingLeft = true; }

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

  cameraX = constrain(playerX - width / 2, 0, worldWidth - width);

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

  // charge tick
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
    if (selectedClass === "Mage") magic = min(maxMagic, magic + 0.06);
    else stamina = min(maxStamina, stamina + 0.06);
  }
}

function getAtkInfo(type) {
  if (selectedClass === "Melee") {
    if (type === "light") return { frames: 4, srcH: 160, drawW: 160, drawH: 80 };
    return { frames: 5, srcH: 320, drawW: 160, drawH: 160 };
  }
  if (type === "light") return { frames: 3, srcH: 320, drawW: 120, drawH: 120 };
  return { frames: 3, srcH: 320, drawW: 160, drawH: 160 };
}

function drawPlayer() {
  if (!spriteSheet || !spriteSheet.width) return;
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
  if (!atkLightSheet.width || !atkHeavySheet.width) return;

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

// ── mage projectile system ────────────────────────────────────────────────────

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

function updateMageProjectiles() {
  for (let i = mageProjectiles.length - 1; i >= 0; i--) {
    let p = mageProjectiles[i];
    p.x += p.velX;
    p.distTraveled += abs(p.velX);
    p.animTimer++;
    if (p.animTimer % 5 === 0) p.frame++;

    // hit detection — light stops on first hit, heavy pierces all
    let hit = false;
    for (let d of dummies) {
      if (d.dead) continue;
      if (p.x > d.x - 22 && p.x < d.x + 22 &&
          p.y > groundY - 88 && p.y < groundY + drawSize) {
        d.hp = max(0, d.hp - p.damage);
        d.flashTimer = 14;
        if (d.hp <= 0) { d.dead = true; d.respawnTimer = 180; }
        if (p.type === "light") { hit = true; break; }
      }
    }

    let screenX = p.x - cameraX;
    let offScreen = screenX < -120 || screenX > width + 120;
    let expired = p.distTraveled >= p.maxDist;
    if (hit || offScreen || expired) mageProjectiles.splice(i, 1);
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

// ── dummies ───────────────────────────────────────────────────────────────────

function updateDummies() {
  for (let d of dummies) {
    if (d.flashTimer > 0) d.flashTimer--;
    if (d.dead) {
      d.respawnTimer--;
      if (d.respawnTimer <= 0) {
        d.dead = false;
        d.hp = d.maxHp;
      }
    }
  }
}

function drawDummies() {
  push();
  translate(-cameraX, 0);
  noStroke();

  for (let d of dummies) {
    let base = groundY + drawSize * 0.35;
    let top  = base - 90;
    let flash = d.flashTimer > 0;

    if (d.dead) {
      fill(90, 65, 45, 170);
      rect(d.x - 4, base - 20, 8, 20);
      fill(80, 55, 38, 120);
      rect(d.x - 20, base - 14, 40, 7);

      // respawn countdown ring
      let prog = 1 - (d.respawnTimer / 180);
      noFill();
      stroke(140, 100, 70, 100);
      strokeWeight(2);
      arc(d.x, base - 10, 28, 28, -HALF_PI, -HALF_PI + TWO_PI * prog);
      noStroke();
      continue;
    }

    // post shadow
    fill(0, 0, 0, 40);
    ellipse(d.x, base - 2, 38, 10);

    // vertical post
    fill(flash ? color(255, 80, 60) : color(110, 80, 55));
    rect(d.x - 5, top + 24, 10, 66, 2);

    // horizontal arm
    fill(flash ? color(240, 90, 60) : color(95, 68, 44));
    rect(d.x - 30, top + 34, 60, 9, 2);

    // head
    fill(flash ? color(255, 80, 60) : color(145, 105, 72));
    ellipse(d.x, top + 14, 30, 30);

    // X eyes
    fill(flash ? color(255, 255, 80) : color(48, 28, 18));
    textAlign(CENTER, CENTER);
    textSize(11);
    textFont("Georgia");
    text("x  x", d.x, top + 12);

    // mouth line
    stroke(flash ? color(255, 255, 80) : color(48, 28, 18));
    strokeWeight(1.5);
    line(d.x - 6, top + 21, d.x + 6, top + 22);
    noStroke();

    // HP bar bg
    fill(10, 10, 10, 190);
    rect(d.x - 34, top - 20, 68, 10, 3);
    // HP bar fill — green > yellow > red
    let ratio = d.hp / d.maxHp;
    let barCol = ratio > 0.5 ? lerpColor(color(200, 160, 0), color(60, 180, 60), (ratio - 0.5) * 2)
                             : lerpColor(color(200, 50, 50), color(200, 160, 0), ratio * 2);
    fill(flash ? color(255, 80, 60) : barCol);
    rect(d.x - 34, top - 20, 68 * ratio, 10, 3);

    // HP number
    fill(220, 220, 220);
    textSize(9);
    textAlign(CENTER, CENTER);
    text(floor(d.hp), d.x, top - 14);

    // range label
    fill(180, 180, 200, 180);
    textSize(9);
    textAlign(CENTER, BOTTOM);
    text(d.label, d.x, top - 24);
  }
  pop();
}

// ── arena background ──────────────────────────────────────────────────────────

function drawArena() {
  // sky
  for (let y = 0; y < height; y++) {
    let t = y / height;
    stroke(lerpColor(color(18, 16, 28), color(36, 32, 52), t));
    line(0, y, width, y);
  }
  noStroke();

  // title
  fill(180, 180, 200, 50);
  textAlign(CENTER, TOP);
  textFont("Georgia");
  textSize(13);
  text("TEST ARENA — R to reset dummies", width / 2, 8);

  push();
  translate(-cameraX, 0);

  // back wall
  fill(28, 26, 38);
  rect(0, 0, worldWidth, groundY + drawSize * 0.35);

  // wall texture grid
  stroke(38, 36, 50, 80);
  strokeWeight(1);
  for (let x = 0; x < worldWidth; x += 60) line(x, 0, x, groundY + drawSize * 0.35);
  for (let y = 0; y < groundY; y += 40) line(0, y, worldWidth, y);
  noStroke();

  // floor
  let floorY = groundY + drawSize * 0.35;
  fill(46, 44, 56);
  rect(0, floorY, worldWidth, height - floorY);

  // floor stone tiles
  for (let x = 0; x < worldWidth; x += 80) {
    fill(52 + (x % 3) * 3, 50 + (x % 2) * 2, 62);
    rect(x + 1, floorY + 1, 78, 38, 2);
    rect(x + 41, floorY + 40, 78, 38, 2);
  }

  // floor highlight strip
  fill(255, 255, 255, 8);
  rect(0, floorY, worldWidth, 4);

  // torches along the wall
  for (let tx = 200; tx < worldWidth; tx += 350) {
    drawTorch(tx, floorY - 120);
  }

  pop();
}

function drawTorch(x, y) {
  // bracket
  fill(60, 55, 70);
  rect(x - 3, y, 6, 20, 1);
  rect(x - 8, y + 16, 16, 5, 1);

  // flame glow
  let flicker = sin(frameCount * 0.18 + x) * 6;
  fill(255, 160, 40, 18);
  ellipse(x, y - 10 + flicker * 0.3, 36, 36);
  fill(255, 200, 80, 35);
  ellipse(x, y - 6 + flicker * 0.2, 22, 22);

  // flame core
  fill(255, 230, 130, 200);
  ellipse(x, y + flicker * 0.15, 8, 12);
  fill(255, 255, 200, 240);
  ellipse(x, y + 3 + flicker * 0.1, 4, 6);
}

function drawRangeMarkers() {
  push();
  translate(-cameraX, 0);

  let floorY = groundY + drawSize * 0.35;

  // light attack range indicator (240px from spawn)
  stroke(120, 180, 255, 60);
  strokeWeight(1);
  setLineDash([6, 4]);
  line(playerX + 240, floorY - 5, playerX + 240, floorY + 44);
  noStroke();
  fill(120, 180, 255, 80);
  textAlign(CENTER, TOP);
  textFont("Georgia");
  textSize(9);
  text("light\nrange", playerX + 240, floorY + 6);

  pop();
  setLineDash([]);
}

function setLineDash(list) {
  drawingContext.setLineDash(list);
}

// ── HUD ───────────────────────────────────────────────────────────────────────

function drawHUD() {
  let x = 22;
  let y = 26;
  if (selectedClass === "Mage") {
    drawBar(x, y, 180, 13, magic, maxMagic, color(30, 30, 160), "MP");
  } else {
    drawBar(x, y, 180, 13, stamina, maxStamina, color(160, 120, 0), "ST");
  }
}

function drawBar(x, y, w, h, val, maxVal, col, label) {
  let fw = (val / maxVal) * w;
  fill(10, 12, 18, 200);
  noStroke();
  rect(x, y, w, h, 4);
  fill(col);
  rect(x, y, fw, h, 4);
  fill(220, 220, 230);
  textFont("Georgia");
  textSize(11);
  textAlign(LEFT, CENTER);
  text(label, x + w + 8, y + h / 2);
}

function drawControlsHint() {
  fill(24, 26, 36, 160);
  noStroke();
  rect(10, height - 36, 520, 26, 6);
  fill(150, 158, 172);
  textAlign(LEFT, CENTER);
  textFont("Georgia");
  textSize(11);

  let hint = selectedClass === "Mage"
    ? "A/D move   W jump   Click light (240px)   Hold Q charge + release (full screen)   M class (Mage)   R reset"
    : "A/D move   W jump   Click light   Q heavy   M class (Melee)   R reset";
  text(hint, 20, height - 23);
}
