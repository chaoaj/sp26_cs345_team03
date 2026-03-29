function setup() {
  createCanvas(600, 600);

  // Main Menu Buttons
  createMainMenuButton("Start", 20, 320);
  createMainMenuButton("Settings", 20, 400);
  createMainMenuButton("Quit", 20, 480);

}

function draw() {
  background('DarkSlateGray');
  drawTitle();
}

function drawTitle() {
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  textFont('Impact')
  text("That Time I Was An Office Worker", (width / 2) - 100, height / 4);
  text("and was Put in a Coma by a Demon Sleep God", width / 2, height / 3);
}

function createMainMenuButton(label, x, y) {
  let button = createButton(label);
  button.size(150, 75);
  button.position(x, y);
  button.style('background-color', 'transparent');
  button.style('cursor', 'pointer');
  // TODO
  // Start -> Choose Class
  // Settings -> Audio -> Volume
  // Quit -> End Game
  button.mousePressed();
}