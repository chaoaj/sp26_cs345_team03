/**
 * Level 1 – Village (visual prototype, no dialogue/NPCs).
 *
 * Serve the repository root so sprite paths work:
 *   cd <repo root> && ruby -run -e httpd . -p 8766
 *   http://127.0.0.1:8766/dev/levels/your_level.html
 *
 * Controls: A/D move, W jump, click light attack, Q heavy attack, M toggle class.
 */

let selectedClass = "Melee";

let worldWidth = 4400;
let cameraX = 0;

let spriteSheetMelee;
let spriteSheetMage;
let spriteSheet;
let atkMeleeLight;
let atkMeleeHeavy;
let atkMageLight;
let atkMageHeavy;
let atkLightSheet;
let atkHeavySheet;

let playerX = 400;
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

let smokePuffs = [];

const SPR = "../../sprites/sprint2/";

function preload() {
  spriteSheetMelee = loadImage(SPR + "melee_class_320x320.png");
  spriteSheetMage = loadImage(SPR + "mage_class_320x320.png");
  atkMeleeLight = loadImage(SPR + "melee_attack_320x160.png");
  atkMeleeHeavy = loadImage(SPR + "heavy_melee_atk_320x320.png");
  atkMageLight = loadImage(SPR + "light_spell_atk_320x320.png");
  atkMageHeavy = loadImage(SPR + "heavy_spell_atk_320x320.png");
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

function setup() {
  createCanvas(960, 540);
  let urlClass = null;
  try {
    let params = new URLSearchParams(window.location.search);
    urlClass = params.get("class");
  } catch (e) {
    urlClass = null;
  }
  if (urlClass === "Mage" || urlClass === "Melee") {
    selectedClass = urlClass;
  }
  syncClassAssets();
  groundY = height - 110 - drawSize * 0.35;
  playerY = groundY;
  playerX = 320;
  cameraX = 0;

  for (let i = 0; i < 14; i++) {
    smokePuffs.push({
      x: random(worldWidth * 0.2, worldWidth * 0.85),
      y: random(260, 300),
      vy: random(-0.4, -0.15),
      life: random(80, 200),
      maxLife: 200,
      w: random(8, 16)
    });
  }
}

function draw() {
  updatePlayer();
  updateMageProjectiles();
  drawVillageWorld();
  drawPlayer();
  drawMageProjectiles();
  drawHUD();
  drawControlsHint();
}

function drawControlsHint() {
  fill(36, 38, 48, 140);
  noStroke();
  rect(12, height - 36, 420, 26, 6);
  fill(160, 168, 182);
  textAlign(LEFT, CENTER);
  textFont("Georgia");
  textSize(12);
  let hint = selectedClass === "Mage"
    ? "A/D move   W jump   Click light blast   Hold Q charge (release to fire)   M class (Mage)"
    : "A/D move   W jump   Click light   Q heavy   M class (Melee)";
  text(hint, 22, height - 23);
}

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
    syncClassAssets();
    return;
  }
  if ((key === "q" || key === "Q") && attackType === "" && !isCharging) {
    if (selectedClass === "Mage") {
      isCharging = true;
      chargeTime = 0;
    } else {
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
      spawnLightMageProjectile();
      magic = max(0, magic - 9);
    } else {
      attackType = "light";
      attackFrame = 0;
      attackTimer = 0;
      stamina = max(0, stamina - 9);
    }
  }
}

function updatePlayer() {
  let moving = false;
  if (keyIsDown(68)) {
    playerX += 5;
    moving = true;
    facingLeft = false;
  }
  if (keyIsDown(65)) {
    playerX -= 5;
    moving = true;
    facingLeft = true;
  }

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
      let info = getAtkInfo(attackType);
      if (attackFrame >= info.frames) {
        attackType = "";
        attackFrame = 0;
        attackTimer = 0;
      }
    }
  }

  for (let p of smokePuffs) {
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) {
      p.y = random(260, 300);
      p.life = p.maxLife;
      p.x = random(worldWidth * 0.2, worldWidth * 0.85);
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
  let xOff = selectedClass === "Mage" ? drawSize + 20 : drawSize * 0.4;

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

function drawVillageWorld() {
  drawVillageSky();
  drawVillageFarVillageSilhouette();
  drawVillageParallax();
  push();
  translate(-cameraX, 0);
  drawVillageGroundAndPath();
  drawVillageSideAlleysAndYards();
  drawVillageTreeBackdrop();
  drawVillageBuildingShadows();
  drawVillageResidentialRows();
  drawVillageWorkshopsAndBarn();
  drawVillageMarketRow();
  drawVillageHallAndBellTower();
  drawVillagePlazaWellAndProps();
  drawVillageFencesAndPosts();
  drawVillagePathForeground();
  drawVillageSmoke();
  pop();
  drawVillageAtmosphere();
}

/** Screen-space mist — full height (no gap band); soft uniform veil */
function drawVillageAtmosphere() {
  noStroke();
  for (let y = 0; y < height; y++) {
    let t = y / height;
    let a;
    if (t < 0.42) {
      a = map(t, 0, 0.42, 10, 2);
    } else if (t < 0.62) {
      a = map(t, 0.42, 0.62, 2, 8);
    } else {
      a = map(t, 0.62, 1, 8, 28);
    }
    stroke(26, 28, 40, a);
    line(0, y, width, y);
  }
  noStroke();
  fill(92, 98, 112, 22);
  rect(0, 0, width, height);
  fill(14, 12, 22, 14);
  rect(0, 0, width * 0.06, height);
  rect(width * 0.94, 0, width * 0.06, height);
}

function drawVillageSky() {
  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);
    let c = lerpColor(color(42, 36, 58), color(78, 82, 96), t);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  fill(88, 84, 108, 32);
  ellipse(width * 0.18 + sin(frameCount * 0.006) * 10, 68, 130, 42);
  ellipse(width * 0.48, 92, 180, 52);
  fill(72, 70, 92, 24);
  ellipse(width * 0.55, 78, 95, 30);
  ellipse(width * 0.32, 58, 70, 22);
}

function drawVillageFarVillageSilhouette() {
  let p = -cameraX * 0.06;
  noStroke();
  fill(48, 50, 64, 165);
  let y0 = 288;
  for (let i = 0; i < 55; i++) {
    let x = p + i * 86 + sin(i * 1.7) * 12;
    let rw = 48 + (i * 17) % 44;
    let rh = 22 + (i * 23) % 26;
    let peak = 18 + (i * 11) % 18;
    rect(x, y0 - rh, rw, rh);
    triangle(x - 4, y0 - rh, x + rw / 2, y0 - rh - peak, x + rw + 4, y0 - rh);
  }
  fill(38, 40, 54, 130);
  rect(p, y0, worldWidth + 400, height);
}

function drawVillageParallax() {
  let p1 = -cameraX * 0.11;
  let p2 = -cameraX * 0.2;
  noStroke();
  fill(56, 68, 64);
  beginShape();
  vertex(p1, height);
  vertex(p1, 312);
  vertex(p1 + 320, 275);
  vertex(p1 + 720, 298);
  vertex(p1 + 1180, 268);
  vertex(p1 + 1680, 292);
  vertex(p1 + 2200, 265);
  vertex(p1 + 2800, 288);
  vertex(p1 + worldWidth + 200, 302);
  vertex(p1 + worldWidth + 200, height);
  endShape(CLOSE);

  fill(46, 56, 60);
  beginShape();
  vertex(p2, height);
  vertex(p2, 348);
  vertex(p2 + 420, 318);
  vertex(p2 + 920, 338);
  vertex(p2 + 1500, 308);
  vertex(p2 + 2100, 328);
  vertex(p2 + worldWidth + 200, 318);
  vertex(p2 + worldWidth + 200, height);
  endShape(CLOSE);

  fill(38, 48, 52, 95);
  for (let i = 0; i < 28; i++) {
    let tx = p2 + 180 + i * 155;
    ellipse(tx, 318, 22, 10);
  }
}

function villageStreetY() {
  return groundY + drawSize * 0.35;
}

function drawVillageGroundAndPath() {
  let streetY = villageStreetY();
  noStroke();
  fill(40, 52, 48);
  rect(0, streetY, worldWidth, height - streetY);

  for (let g = 0; g < worldWidth; g += 22) {
    fill(44 + (g % 5) * 4, 58 + (g % 3) * 3, 52, 110);
    ellipse(g + (g % 7) * 3, streetY + 52 + (g % 4) * 8, 16 + (g % 5) * 4, 7);
  }

  fill(34, 44, 42);
  rect(0, streetY + 48, worldWidth, 140);

  let pathTop = streetY + 6;
  fill(72, 70, 78);
  rect(0, pathTop, worldWidth, 40);

  fill(58, 56, 64);
  rect(0, pathTop + 10, worldWidth, 22);

  for (let x = -20; x < worldWidth + 40; x += 36) {
    stroke(48, 46, 54);
    strokeWeight(1);
    line(x, pathTop, x + 18, pathTop + 40);
    line(x + 18, pathTop, x + 36, pathTop + 40);
  }
  noStroke();

  for (let x = 0; x < worldWidth; x += 14) {
    let v = (x * 11) % 4;
    fill(50 + v, 48 + v, 56 + v, 55);
    rect(x + (x % 3), pathTop + 4 + (x % 5), 5, 4, 1);
  }
  fill(42, 40, 50, 55);
  for (let x = 0; x < worldWidth; x += 200) {
    ellipse(x + 60, pathTop + 20, 50, 12);
  }
}

function drawVillageSideAlleysAndYards() {
  let streetY = villageStreetY();
  let patches = [
    [40, 95],
    [265, 80],
    [720, 110],
    [980, 85],
    [3050, 100],
    [3520, 115],
    [3920, 90]
  ];
  noStroke();
  for (let pa of patches) {
    let px = pa[0];
    let pw = pa[1];
    fill(48, 42, 46);
    rect(px, streetY + 2, pw, 44, 4);
    fill(38, 52, 48, 140);
    for (let i = 0; i < 8; i++) {
      ellipse(px + 12 + i * 12, streetY + 28, 6, 14);
    }
  }
}

function drawVillageTreeBackdrop() {
  let streetY = villageStreetY();
  for (let i = 0; i < 32; i++) {
    let tx = 40 + i * 138 + (i % 4) * 18;
    let trunkW = 14 + (i % 3) * 4;
    let crownR = 26 + (i % 5) * 6;
    fill(34, 30, 36);
    rect(tx, streetY - crownR * 0.4 - 40, trunkW, 44, 2);
    fill(28, 42, 40);
    ellipse(tx + trunkW / 2, streetY - crownR - 35, crownR * 2.1, crownR * 1.5);
    fill(32, 48, 46, 200);
    ellipse(tx + trunkW / 2 - 8, streetY - crownR - 42, crownR * 1.4, crownR * 1.1);
    ellipse(tx + trunkW / 2 + 10, streetY - crownR - 38, crownR * 1.2, crownR);
  }
}

function drawVillageBuildingShadows() {
  let streetY = villageStreetY();
  fill(18, 16, 28, 62);
  let xs = [94, 212, 336, 458, 582, 702, 1972, 2098, 2224, 2348, 2472, 2598, 2726, 2850, 2972, 3100, 3226, 3350, 3472];
  for (let x of xs) {
    ellipse(x + 52, streetY + 14, 105, 16);
  }
}

/** Double-hung style: outer frame, inset glass, thin mullions, sill */
function drawFramedWindow(left, top, w, h) {
  let inset = max(3, min(w, h) * 0.12);
  let mullion = max(1.2, min(w, h) * 0.04);

  noStroke();
  fill(32, 30, 40);
  rect(left + 1, top + 2, w, h, 2);

  fill(48, 46, 56);
  rect(left, top, w, h, 2);

  fill(108, 118, 128, 115);
  rect(left + inset, top + inset, w - inset * 2, h - inset * 2, 1);

  fill(140, 158, 168, 45);
  rect(left + inset + 2, top + inset + 2, (w - inset * 2) * 0.45, min(5, h * 0.1), 1);

  fill(36, 34, 44);
  let cx = left + w / 2;
  let cy = top + h / 2;
  rect(cx - mullion / 2, top + inset, mullion, h - inset * 2);
  rect(left + inset, cy - mullion / 2, w - inset * 2, mullion);

  stroke(62, 60, 72);
  strokeWeight(1);
  noFill();
  rect(left + inset + 0.5, top + inset + 0.5, w - inset * 2 - 1, h - inset * 2 - 1, 1);
  noStroke();

  fill(42, 40, 50);
  rect(left - 1, top + h - 2, w + 2, 5, 1);
}

function drawWallStuccoTexture(x0, y0, w, h, baseCol) {
  noStroke();
  for (let yy = 0; yy < h; yy += 5) {
    for (let xx = 0; xx < w; xx += 6) {
      let k = (xx * 17 + yy * 13 + floor(x0 * 0.3)) % 9;
      let d = map(k, 0, 8, -0.04, 0.05);
      fill(lerpColor(baseCol, k < 4 ? color(0) : color(255), d));
      rect(x0 + xx, y0 + yy, 6, 5);
    }
  }
}

function drawRoofShingleTexture(wx, roofBaseY, houseW, roofH, roofCol) {
  stroke(lerpColor(roofCol, color(0), 0.2));
  strokeWeight(1);
  for (let i = 0; i < 12; i++) {
    let t = i / 12;
    let y = roofBaseY - roofH * 0.48 * (1 - t * 0.95);
    let span = houseW + 20 - t * 36;
    let x0 = wx - 8 + t * 14;
    line(x0, y, x0 + span, y);
  }
  noStroke();
}

function drawCornerQuoins(wx, yTop, houseW, yBottom) {
  let qh = max(12, yBottom - yTop);
  fill(62, 60, 72);
  rect(wx - 2, yTop, 5, qh, 1);
  rect(wx + houseW - 3, yTop, 5, qh, 1);
}

function drawCottage(wx, baseY, houseW, houseH, wall, roof, door, chimney) {
  let wallTop = baseY - houseH;
  let wallH = houseH - 8;
  let stoneH = wallH * 0.2;
  let stoneTop = wallTop + wallH - stoneH;
  let roofPeak = baseY - houseH - houseH * 0.48;

  noStroke();
  fill(48, 46, 56);
  rect(wx, baseY - 8, houseW, 10, 2);

  fill(lerpColor(wall, color(32, 30, 42), 0.35));
  rect(wx, stoneTop, houseW, stoneH);
  stroke(lerpColor(wall, color(0), 0.4));
  strokeWeight(1);
  for (let row = 0; row < ceil(stoneH / 6); row++) {
    let y = stoneTop + row * 6;
    let off = (row % 2) * 8;
    for (let cx = wx + off + 2; cx < wx + houseW - 6; cx += 16) {
      line(cx, y + 5, cx + 14, y + 5);
    }
  }
  noStroke();

  drawWallStuccoTexture(wx, wallTop, houseW, wallH - stoneH, wall);

  stroke(lerpColor(wall, color(0), 0.2));
  strokeWeight(1);
  for (let ly = 0; ly < 5; ly++) {
    let yy = wallTop + wallH * 0.15 - ly * (wallH * 0.12);
    if (yy > wallTop + 6 && yy < stoneTop - 4) {
      line(wx + 4, yy, wx + houseW - 4, yy);
    }
  }
  noStroke();

  drawCornerQuoins(wx, wallTop + 6, houseW, stoneTop - 3);

  fill(roof);
  triangle(wx - 10, wallTop, wx + houseW / 2, roofPeak, wx + houseW + 10, wallTop);
  fill(lerpColor(roof, color(0), 0.1));
  quad(
    wx + houseW * 0.2,
    wallTop - 4,
    wx + houseW * 0.5,
    roofPeak + 4,
    wx + houseW * 0.8,
    wallTop - 4,
    wx + houseW * 0.5,
    wallTop + 2
  );
  drawRoofShingleTexture(wx, wallTop, houseW, houseH * 0.48, roof);

  let hKey = (floor(wx) + houseW * 2) % 5;
  if (hKey === 0 || hKey === 2) {
    let dx = wx + houseW * 0.32;
    let dw = houseW * 0.36;
    let dh = houseH * 0.2;
    let dy = wallTop - dh * 0.35;
    fill(lerpColor(wall, color(0), 0.06));
    rect(dx, dy, dw, dh, 2);
    fill(lerpColor(roof, color(0), 0.05));
    triangle(dx - 4, dy, dx + dw / 2, dy - dh * 0.55, dx + dw + 4, dy);
    drawFramedWindow(dx + dw * 0.18, dy + dh * 0.35, dw * 0.64, dh * 0.42);
  }

  if (chimney) {
    fill(56, 52, 62);
    rect(wx + houseW * 0.72, wallTop - houseH * 0.42, 16, houseH * 0.38, 2);
    fill(40, 38, 48);
    rect(wx + houseW * 0.72 - 2, wallTop - houseH * 0.45, 20, 6);
  }

  let winW = houseW * 0.22;
  let winH = houseH * 0.24;
  let winY = baseY - houseH * 0.78;
  drawFramedWindow(wx + houseW * 0.12, winY, winW, winH);
  drawFramedWindow(wx + houseW * 0.66, winY, winW, winH);

  let doorLeft = wx + houseW * 0.36;
  let doorW = houseW * 0.28;
  let doorTop = baseY - houseH * 0.44;
  fill(lerpColor(door, color(0), 0.15));
  rect(doorLeft - 4, doorTop - 8, doorW + 8, 10, 2);
  fill(lerpColor(door, color(255), 0.06));
  triangle(doorLeft - 4, doorTop - 8, doorLeft + doorW / 2, doorTop - 18, doorLeft + doorW + 4, doorTop - 8);

  fill(door);
  rect(doorLeft, doorTop, doorW, baseY - doorTop - 10, 2);
  fill(68, 66, 82);
  ellipse(doorLeft + doorW - 10, doorTop + (baseY - doorTop - 10) * 0.45, 7, 7);
  fill(44, 42, 54);
  rect(doorLeft, baseY - 10, doorW, 10, 0, 0, 2, 2);
}

function drawVillageResidentialRows() {
  let base = villageStreetY();

  drawCottage(38, base, 112, 118, color(102, 98, 112), color(66, 62, 78), color(48, 44, 58), true);
  drawCottage(158, base, 108, 114, color(94, 90, 104), color(62, 58, 74), color(44, 40, 54), false);
  drawCottage(276, base, 118, 122, color(108, 104, 118), color(70, 66, 82), color(50, 46, 60), true);
  drawCottage(398, base, 114, 118, color(98, 94, 108), color(64, 60, 76), color(46, 42, 56), true);
  drawCottage(518, base, 120, 124, color(106, 102, 116), color(68, 64, 80), color(48, 44, 58), false);
  drawCottage(646, base, 110, 116, color(92, 88, 102), color(60, 56, 72), color(42, 38, 52), true);

  drawCottage(1910, base, 116, 118, color(100, 96, 110), color(64, 60, 76), color(46, 42, 56), true);
  drawCottage(2032, base, 114, 120, color(96, 92, 106), color(62, 58, 74), color(44, 40, 54), false);
  drawCottage(2152, base, 120, 122, color(104, 100, 114), color(66, 62, 80), color(48, 44, 58), true);
  drawCottage(2280, base, 112, 116, color(90, 86, 100), color(58, 54, 70), color(40, 36, 50), true);
  drawCottage(2398, base, 118, 120, color(102, 98, 112), color(64, 60, 78), color(46, 42, 56), false);
  drawCottage(2524, base, 115, 118, color(98, 94, 108), color(62, 58, 76), color(44, 40, 54), true);
  drawCottage(2645, base, 122, 124, color(108, 104, 118), color(68, 64, 82), color(48, 44, 60), true);
  drawCottage(2773, base, 110, 116, color(92, 88, 102), color(60, 56, 72), color(42, 38, 52), false);
  drawCottage(2891, base, 118, 120, color(100, 96, 110), color(64, 60, 78), color(46, 42, 56), true);
  drawCottage(3015, base, 116, 118, color(96, 92, 106), color(62, 58, 76), color(44, 40, 54), true);
  drawCottage(3137, base, 114, 116, color(94, 90, 104), color(60, 56, 74), color(42, 38, 52), false);
  drawCottage(3255, base, 118, 120, color(102, 98, 112), color(64, 60, 78), color(46, 42, 56), true);
  drawCottage(3381, base, 120, 122, color(106, 102, 116), color(66, 62, 80), color(48, 44, 58), true);
}

function drawVillageWorkshopsAndBarn() {
  let base = villageStreetY();
  let bx = 1188;
  let bw = 155;
  let bh = 98;
  fill(40, 38, 46);
  rect(bx, base - 8, bw, 10);
  fill(72, 68, 78);
  rect(bx, base - bh, bw, bh - 8);
  fill(48, 42, 52);
  beginShape();
  vertex(bx - 6, base - bh);
  vertex(bx + bw * 0.5, base - bh - 38);
  vertex(bx + bw + 6, base - bh);
  endShape(CLOSE);
  fill(34, 30, 38);
  rect(bx + bw * 0.38, base - bh * 0.55, bw * 0.28, bh * 0.55, 2);

  let barnX = 4020;
  fill(52, 44, 48);
  rect(barnX, base - 10, 200, 12);
  fill(78, 62, 58);
  rect(barnX, base - 135, 200, 125);
  fill(44, 36, 42);
  triangle(barnX - 8, base - 135, barnX + 100, base - 195, barnX + 208, base - 135);
  fill(32, 28, 34);
  rect(barnX + 78, base - 95, 44, 95, 2);
  fill(72, 38, 42, 90);
  rect(barnX + 12, base - 110, 28, 40, 2);
  rect(barnX + 160, base - 105, 24, 32, 2);
}

function drawVillageMarketRow() {
  let base = villageStreetY();
  let stalls = [
    [1720, 0],
    [1810, 1],
    [1900, 0],
    [1990, 1]
  ];
  noStroke();
  for (let st of stalls) {
    let sx = st[0];
    let flip = st[1];
    let awningW = 88;
    let poleX = flip ? sx + awningW - 8 : sx;
    fill(44, 40, 48);
    rect(poleX, base - 62, 8, 62);
    rect(poleX + 72, base - 62, 8, 62);
    if (flip) {
      fill(62, 48, 72, 230);
    } else {
      fill(48, 58, 68, 230);
    }
    if (flip) {
      quad(sx, base - 58, sx + awningW, base - 78, sx + awningW, base - 52, sx, base - 42);
    } else {
      quad(sx, base - 78, sx + awningW, base - 58, sx + awningW, base - 42, sx, base - 52);
    }
    fill(56, 50, 58);
    rect(sx + 10, base - 48, awningW - 20, 36, 3);
    fill(42, 52, 50, 160);
    ellipse(sx + 28, base - 32, 22, 14);
    ellipse(sx + 58, base - 30, 18, 12);
    fill(64, 58, 68);
    rect(sx + 34, base - 22, 20, 14, 2);
  }

  fill(48, 42, 50);
  ellipse(1860, base - 8, 30, 15);
  fill(58, 52, 62);
  rect(1838, base - 26, 48, 20, 3);
}

function drawVillageHallAndBellTower() {
  let base = villageStreetY();
  let hallX = 1368;
  let hallW = 220;
  let hallH = 168;
  noStroke();
  fill(40, 38, 48);
  rect(hallX, base - 10, hallW, 12);
  fill(88, 84, 96);
  rect(hallX, base - hallH, hallW, hallH - 10);
  stroke(lerpColor(color(88, 84, 96), color(0), 0.25));
  strokeWeight(2);
  line(hallX + hallW * 0.33, base - hallH, hallX + hallW * 0.33, base - 10);
  line(hallX + hallW * 0.66, base - hallH, hallX + hallW * 0.66, base - 10);
  noStroke();
  fill(48, 42, 54);
  triangle(hallX - 16, base - hallH, hallX + hallW / 2, base - hallH - 78, hallX + hallW + 16, base - hallH);
  fill(36, 32, 42);
  rect(hallX + hallW * 0.4, base - hallH * 0.55, hallW * 0.2, hallH * 0.55, 2);
  let hallWinW = hallW * 0.22;
  let hallWinH = hallH * 0.35;
  let hallWinY = base - hallH * 0.88;
  drawFramedWindow(hallX + hallW * 0.12, hallWinY, hallWinW, hallWinH);
  drawFramedWindow(hallX + hallW * 0.66, hallWinY, hallWinW, hallWinH);

  let tx = hallX + hallW * 0.5 - 22;
  fill(52, 48, 58);
  rect(tx, base - hallH - 120, 44, 120);
  fill(40, 36, 46);
  triangle(tx - 6, base - hallH - 120, tx + 22, base - hallH - 165, tx + 50, base - hallH - 120);
  fill(88, 92, 108, 100);
  ellipse(tx + 22, base - hallH - 128, 18, 18);
}

function drawVillagePlazaWellAndProps() {
  let base = villageStreetY();
  let plazaL = 1240;
  let plazaR = 1880;
  let pathTop = base + 6;

  noStroke();
  fill(52, 50, 58);
  ellipse((plazaL + plazaR) / 2, pathTop + 20, plazaR - plazaL, 36);

  for (let px = plazaL; px < plazaR; px += 38) {
    fill(44, 42, 50);
    rect(px, pathTop - 4, 32, 8, 2);
  }

  let wx = 1560;
  fill(68, 66, 74);
  ellipse(wx, base - 2, 112, 30);
  fill(38, 40, 48);
  ellipse(wx, base - 12, 62, 18);
  fill(32, 58, 72, 200);
  ellipse(wx, base - 12, 42, 12);

  fill(48, 42, 50);
  rect(wx - 5, base - 96, 10, 96);
  rect(wx - 42, base - 78, 84, 12);
  fill(36, 34, 42);
  rect(wx - 38, base - 74, 76, 8);
  stroke(32, 30, 38);
  strokeWeight(1);
  line(wx, base - 72, wx, base - 28);
  noStroke();
  fill(24, 22, 28);
  ellipse(wx, base - 26, 10, 6);

  fill(46, 42, 52);
  rect(wx + 62, base - 38, 22, 38, 2);
  fill(56, 52, 62);
  ellipse(wx + 73, base - 42, 26, 12);

  fill(52, 48, 58);
  rect(1288, base - 22, 52, 22, 3);
  fill(44, 40, 50);
  rect(1788, base - 20, 48, 20, 3);

  stroke(72, 70, 82, 100);
  strokeWeight(1);
  for (let i = 0; i < 6; i++) {
    let lx = 1300 + i * 95;
    line(lx, base - 125, lx + 44, base - 120);
  }
  stroke(58, 56, 68, 80);
  for (let i = 0; i < 6; i++) {
    let lx = 1305 + i * 95;
    line(lx, base - 118, lx + 38, base - 115);
  }
  noStroke();
}

function drawVillageFencesAndPosts() {
  let base = villageStreetY();
  function fenceRun(x0, x1, y) {
    for (let x = x0; x < x1; x += 14) {
      fill(58, 52, 62);
      rect(x, y - 22, 5, 24, 1);
    }
    fill(48, 44, 54);
    rect(x0, y - 24, x1 - x0, 4);
    rect(x0, y - 6, x1 - x0, 3);
  }
  fenceRun(22, 78, base);
  fenceRun(920, 1020, base);
  fenceRun(2120, 2240, base);
  fenceRun(3340, 3460, base);

  for (let lx = 160; lx < worldWidth; lx += 380) {
    fill(44, 42, 52);
    rect(lx, base - 108, 6, 108);
    fill(140, 168, 198, 45);
    ellipse(lx + 3, base - 102, 14, 14);
  }
}

function drawVillagePathForeground() {
  let base = villageStreetY();
  let pathTop = base + 6;
  noStroke();
  for (let x = 0; x < worldWidth; x += 18) {
    let h = 8 + (x % 5) * 3;
    fill(22, 32, 30, 100);
    triangle(x, pathTop + 40, x + 5, pathTop + 40 - h, x + 10, pathTop + 40);
    triangle(x + 8, pathTop + 40, x + 13, pathTop + 38 - h, x + 18, pathTop + 40);
  }
  for (let x = 0; x < worldWidth; x += 65) {
    fill(48, 42, 58, 50);
    ellipse(x + (x % 17), pathTop + 32, 4, 4);
    fill(56, 62, 72, 40);
    ellipse(x + 22, pathTop + 28, 3, 3);
  }
}

function drawVillageSmoke() {
  noStroke();
  for (let p of smokePuffs) {
    let a = map(p.life, 0, p.maxLife, 0, 42);
    fill(72, 76, 88, a);
    ellipse(p.x, p.y, p.w, p.w * 0.65);
  }
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

// ── HUD ───────────────────────────────────────────────────────────────────────

function drawHUD() {
  let x = 22;
  let y = 16;
  if (selectedClass === "Mage") {
    drawBar(x, y, 160, 12, magic, maxMagic, color(0, 0, 80), "MP");
  } else {
    drawBar(x, y, 160, 12, stamina, maxStamina, color(180, 140, 0), "ST");
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
