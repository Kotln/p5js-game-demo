/*

The Game Project Part 7 - Final project


*/
//declaring variables

var gameChar;
var floorPos_y;

var cameraPosX;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var trees;
var collectables;
var canyons;
var clouds;
var mountains;
var platforms;
var enemies;
var flagpole;

var game_score;
var lives;

var sound;

var night;
var stars;
var info;

//Load sound function
// All sounds are from https://freesound.org
function preload() {
  soundFormats("wav");
  sound = {
    jumpSound: loadSound("assets/jump.wav"),
    pickUpCollectible: loadSound("assets/winGame.wav"),
    canyonFalling: loadSound("assets/canyonFalling.wav"),
    enemyCrunch: loadSound("assets/crunch.wav"),
    endGame: loadSound("assets/endGame.wav"),
    flagpoleReached: loadSound("assets/flagoleReached.wav"),
    newLife: loadSound("assets/pop.wav"),
  };

  //load sounds
  sound.pickUpCollectible.setVolume(0.1);
  sound.jumpSound.setVolume(0.1);
  sound.canyonFalling.setVolume(0.3);
  sound.endGame.setVolume(0.1);
  sound.flagpoleReached.setVolume(0.3);
  sound.newLife.setVolume(0.3);
  sound.enemyCrunch.setVolume(0.3);
}

function setup() {
  createCanvas(1024, 576);

  // initializing variables
  gamePreload();
  startGame();
}

function draw() {
  ///////////DRAWING CODE//////////

  //draw sky
  background(100, 155, 255);
  if (night) {
    nightMode();
  }

  // draw ground
  noStroke();
  fill(0, 155, 0);
  rect(0, floorPos_y, width, height - floorPos_y);

  // camera scrolling conditions
  cameraPosX = gameChar.x - width / 2;

  /////draw scenery/////

  // camera scrolling
  push();
  translate(-cameraPosX, 0);

  // draw button
  button();

  // draw mountains
  drawMountains();

  // draw clouds
  drawClouds();

  // draw tree
  drawTrees();

  // draw platforms
  for (var i = 0; i < platforms.length; i++) {
    platforms[i].draw();
  }
  // renderFlagpole
  renderFlagpole();

  // //draw canyon
  for (var i = 0; i < canyons.length; i++) {
    drawCanyon(canyons[i]);
    checkCanyon(canyons[i]);
  }

  /////draw game character////
  drawGameChar();

  //draw score, lives and info
  drawScoreAndLives();
  infoButton();

  // end game conditions
  if (lives < 1 || flagpole.isReached) {
    endGame();
    return;
  }

  ///////////INTERACTION CODE//////////

  // walking right and left conditions
  gameCharWalk();

  // gravity conditions and enemy contact
  dyingConditions();

  // drawing and finding collectable
  for (var i = 0; i < collectables.length; i++) {
    if (!collectables[i].isFound) {
      checkCollectable(collectables[i]);
      drawCollectable(collectables[i]);
    }
  }

  // flagpole interaction
  if (flagpole.isReached == false) {
    checkFlagpole();
  }

  // draw enemies
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].draw();

    var isContact = enemies[i].checkContact(gameChar.x, gameChar.y);
    if (isContact) {
      if (lives > 0) {
        death();
        break;
      }
    }
  }

  // dying
  checkPlayerDie();

  pop();
}

function keyPressed() {
  // walking left keys conditions
  if (
    (keyCode == 65 || keyCode == 37) &&
    !isPlummeting &&
    !flagpole.isReached &&
    lives > 0
  ) {
    isLeft = true;
  }

  // walking right keys conditions
  if (
    (keyCode == 68 || keyCode == 39) &&
    !isPlummeting &&
    !flagpole.isReached &&
    lives > 0
  ) {
    isRight = true;
  }

  // jumping keys conditions
  if (
    (keyCode == 87 || keyCode == 38) &&
    !isFalling &&
    !isPlummeting &&
    !flagpole.isReached &&
    lives > 0
  ) {
    gameChar.y -= 90;
    sound.jumpSound.play();
    isFalling = true;
  }

  //night mode
  if (keyCode == 13 && !night) {
    night = true;
  } else if (keyCode == 13 && night) {
    night = false;
  }
}

function keyReleased() {
  // stop walking left keys conditions
  if (keyCode == 65 || keyCode == 37) {
    isLeft = false;
  }

  //stop walking right keys conditions
  if (keyCode == 68 || keyCode == 39) {
    isRight = false;
  }

  // info call
  if (keyCode == 73 && !info) {
    info = true;
  } else {
    info = false;
  }
}
function mousePressed() {
  // night mode
  var d = dist(cameraPosX + 650, 70, cameraPosX + mouseX, mouseY);
  if (d < 60 && !night) {
    night = true;
  } else if (d < 60 && night) {
    night = false;
  }
}

/////// Draw and interact functions//////

// initial variables for setup
function gamePreload() {
  night = false;
  lives = 3;
  game_score = 0;
  floorPos_y = (height * 3) / 4;
  collectables = [
    {
      x: -40,
      y: floorPos_y,
      size: 1.25,
      isFound: false,
    },
    {
      x: 320,
      y: floorPos_y - 60,
      size: 1.25,
      isFound: false,
    },
    {
      x: 520,
      y: floorPos_y - 100,
      size: 1.25,
      isFound: false,
    },
    {
      x: 610,
      y: floorPos_y,
      size: 1.25,
      isFound: false,
    },
    {
      x: 950,
      y: floorPos_y,
      size: 1.25,
      isFound: false,
    },
    {
      x: 1650,
      y: floorPos_y - 100,
      size: 1.25,
      isFound: false,
    },
  ];
}

//
function startGame() {
  gameChar = createVector(width / 2, floorPos_y);
  cameraPosX = 0;

  info = false;

  isLeft = false;
  isRight = false;
  isFalling = false;
  isPlummeting = false;

  trees = { x: [-145, -10, 300, 550, 800, 1260, 1870], y: floorPos_y };

  flagpole = { x: 1500, isReached: false };

  canyons = [
    {
      x: 80,
      y: floorPos_y,
      width: 100,
    },

    {
      x: 640,
      y: floorPos_y,
      width: 100,
    },
  ];

  clouds = [];
  for (var i = 0; i < 25; i++) {
    clouds.push({
      x: random(-300, 1800),
      y: random(80, 250),
      width: 110,
      height: 60,
      diameter: 30,
      size: random(0.5, 1.2),
    });
  }

  mountains = [
    {
      x: -200,
      y: floorPos_y,
      width: 355,
      height: 320,
      size: 1,
    },
    {
      x: 80,
      y: floorPos_y,
      width: 355,
      height: 320,
      size: 1.2,
    },
    {
      x: 500,
      y: floorPos_y,
      width: 355,
      height: 320,
      size: 0.75,
    },
    {
      x: 400,
      y: floorPos_y,
      width: 355,
      height: 320,
      size: 1,
    },
    {
      x: 900,
      y: floorPos_y,
      width: 355,
      height: 320,
      size: 1,
    },
    {
      x: 1200,
      y: floorPos_y,
      width: 355,
      height: 320,
      size: 0.5,
    },

    {
      x: 1630,
      y: floorPos_y,
      width: 355,
      height: 320,
      size: 1,
    },
    {
      x: 1500,
      y: floorPos_y,
      width: 355,
      height: 320,
      size: 0.7,
    },
  ];

  var platformsPos = [
    { x: 300, y: floorPos_y - 60 },
    { x: 470, y: floorPos_y - 100 },
    { x: 640, y: floorPos_y - 60 },

    { x: 1600, y: floorPos_y - 100 },
    { x: 1750, y: floorPos_y - 60 },
  ];
  platforms = [];
  for (var i = 0; i < platformsPos.length; i++) {
    platforms.push(createPlatform(platformsPos[i].x, platformsPos[i].y, 100));
  }

  var enemies_x = [300, 1000, 1700];
  enemies = [];
  for (var i = 0; i < enemies_x.length; i++) {
    enemies.push(new Enemy(enemies_x[i], floorPos_y, random(50, 100)));
  }

  stars = [];
  for (var i = 0; i < 500; i++) {
    stars.push(new Star(random(0, width), random(0, floorPos_y)));
  }

  newEmit = new Emitter(-500, height - height / 3, 0, 0, 1.5);
  newEmit.startEmitter(800, 1000);
}

//night mode
function nightMode() {
  fill(15, 14, 13);
  rect(0, 0, width, height);

  for (var i = 0; i < stars.length; i++) {
    stars[i].draw(random(0, 255));
  }
  newEmit.updateParticles();
}

//restart game
function death() {
  startGame();
  lives -= 1;
}

function checkPlayerDie() {
  if (gameChar.y == floorPos_y + 20) {
    sound.canyonFalling.play();
  }
  if (gameChar.y > height && lives > 0) {
    death();
    if (lives >= 1) {
      sound.newLife.play();
    }
  }
  if (lives == 0) {
    sound.endGame.play();
  }
}

// endGame message
function endGame() {
  strokeWeight(0.5);
  textFont("monospace");
  textSize(32);
  fill(250, 243, 142);
  if (lives < 1) {
    text("Game over.", cameraPosX + width * 0.4, height / 2);
  }
  if (flagpole.isReached) {
    text("Level complete.", cameraPosX + width * 0.4, height / 2);
    gameChar.y = floorPos_y;
    isFalling = false;
  }
}

// sun/moon button
function button() {
  if (night) {
    noStroke();
    fill(189, 185, 185);
    ellipse(cameraPosX + 650, 70, 120);
    fill(181, 176, 176, 200);
    ellipse(cameraPosX + 648, 70, 110);
    fill(181, 173, 170, 150);
    ellipse(cameraPosX + 647, 70, 100);
    fill(181, 173, 170, 100);
    ellipse(cameraPosX + 646, 70, 90);
  } else {
    noStroke();
    fill(230, 209, 108, 80);
    ellipse(cameraPosX + 650, 70, 120);
    fill(235, 208, 91, 200);
    ellipse(cameraPosX + 648, 70, 110);
  }
}

// info button
function infoButton() {
  var x = cameraPosX + 12.5;
  var y = 57;
  var range = 15;

  //borders
  strokeWeight(0.5);
  stroke(0);
  fill(141, 227, 204, 120);
  rect(x, y, range, range, 2);

  // i
  fill(0);
  textSize(15);
  textFont("monospace");
  text("i", x + 3, 70);
  if (
    (mouseX + cameraPosX >= x &&
      mouseX + cameraPosX <= x + range &&
      mouseY >= y &&
      mouseY <= y + range) ||
    info
  ) {
    noFill();
    fill(250, 243, 142);
    strokeWeight(0.5);
    textSize(15);
    textLeading(15);
    if (night) {
      text(
        "Click on the Moon\nOR press 'Enter'",
        x + range + 2,
        y + range + 13
      );
    } else {
      text("Click on the Sun\nOR press 'Enter'", x + range + 2, y + range + 13);
    }
  }
  noStroke();
}

// creating and interaction with platforms (Constructor)
function createPlatform(x, y, length) {
  var p = {
    x: x,
    y: y,
    length: length,
    draw: function () {
      fill(0, 155, 0);
      rect(this.x, this.y, this.length, 20, 10);
    },
    checkContact: function (gc_x, gc_y) {
      if (gc_x > this.x && gc_x <= this.x + this.length) {
        var d = this.y - gc_y;
        if (d >= 0 && d < 2) {
          return true;
        }
      }
      return false;
    },
  };
  return p;
}

function drawScoreAndLives() {
  var scoreShadow = [];
  for (var i = 0; i < collectables.length; i++) {
    scoreShadow.push(new Score(cameraPosX + 10 + i * 20, 25));
    scoreShadow[i].drawShadow();
  }

  var score = [];
  for (var i = 0; i < game_score; i++) {
    score.push(new Score(cameraPosX + 10 + i * 20, 25));
    score[i].draw();
  }

  var hearts = [];
  for (var i = 0; i < lives; i++) {
    hearts.push(new Hearts(cameraPosX + 20 + i * 25, 40));
    hearts[i].draw();
  }
}

// game character interaction
function gameCharWalk() {
  if (isLeft == true) {
    gameChar.x -= 5;
  } else if (isRight == true) {
    gameChar.x += 5;
  }
}

function dyingConditions() {
  if (gameChar.y < floorPos_y) {
    var isContact = false;
    for (var i = 0; i < platforms.length; i++) {
      if (platforms[i].checkContact(gameChar.x, gameChar.y)) {
        isContact = true;
        isFalling = false;
        break;
      }
    }
    if (isContact == false) {
      gameChar.y += 2;
      isFalling = true;
    }
  } else {
    isFalling = false;
  }
  if (isPlummeting) {
    gameChar.y += 4;
    isLeft = false;
    isRight = false;
  }
}

// enemy constructor
function Enemy(x, y, range) {
  this.x = x;
  this.y = y;
  this.range = range;
  this.currentX = x;
  this.inc = 1;
  this.right = true;
  this.draw = function () {
    this.update();
    if (this.inc == -1) {
      enemyWalkLeft(this.currentX, this.y);
    } else {
      enemyWalkRight(this.currentX, this.y);
    }
  };
  this.update = function () {
    this.currentX += this.inc;
    if (this.currentX >= this.x + this.range) {
      this.inc = -1;
    } else if (this.currentX < this.x) {
      this.inc = 1;
    }
  };
  this.checkContact = function (gc_x, gc_y) {
    var d = dist(gc_x, gc_y, this.currentX, this.y);

    if (d < 40) {
      sound.enemyCrunch.play();
      return true;
    }
    return false;
  };
}

// flagpole
function checkFlagpole() {
  var d = abs(gameChar.x - flagpole.x);
  if (d < 20 && game_score == collectables.length) {
    flagpole.isReached = true;
    sound.flagpoleReached.play();
  }
}

function renderFlagpole() {
  push();
  stroke(42, 26, 99);
  fill(156, 143, 98);
  rect(flagpole.x - 60, floorPos_y - 80, 120, 80);
  fill(153, 89, 32);
  triangle(
    flagpole.x - 62,
    floorPos_y - 79,
    flagpole.x + 63,
    floorPos_y - 79,
    flagpole.x,
    floorPos_y - 120
  );

  //door
  fill(153, 89, 32);
  rect(flagpole.x - 15, floorPos_y - 40, 30, 40);
  fill(224, 224, 25);
  rect(flagpole.x - 10, floorPos_y - 20, 5, 5);

  //windows
  var windows_x = [-50, 30];
  for (var i = 0; i < windows_x.length; i++) {
    if (flagpole.isReached) {
      fill(224, 224, 25);
    } else {
      fill(153, 89, 32);
    }
    rect(flagpole.x + windows_x[i], floorPos_y - 70, 20, 20);
    line(
      flagpole.x + windows_x[i] + 10,
      floorPos_y - 70,
      flagpole.x + windows_x[i] + 10,
      floorPos_y - 50
    );
    line(
      flagpole.x + windows_x[i],
      floorPos_y - 60,
      flagpole.x + windows_x[i] + 20,
      floorPos_y - 60
    );
  }
  pop();
}

//collectable
function checkCollectable(t_collectable) {
  if (dist(gameChar.x, gameChar.y, t_collectable.x, t_collectable.y) <= 40) {
    t_collectable.isFound = true;

    sound.pickUpCollectible.play();
    game_score += 1;
  }
}

function drawCollectable(t_collectable) {
  if (t_collectable.isFound == false) {
    fill(184, 94, 4);
    strokeWeight(1);
    stroke(0);
    push();

    translate(t_collectable.x, t_collectable.y);
    scale(t_collectable.size);

    ellipse(0, -11, 20, 21);
    beginShape();
    vertex(-8, -24);
    vertex(-6, -19.5);
    vertex(6, -19.5);
    vertex(8, -24);
    vertex(-8, -24);
    endShape();
    line(-9.6, -11, 10, -11);
    line(-8.6, -15, 9, -15);
    noFill();
    stroke(225);
    beginShape();
    vertex(-8.6, -14);
    vertex(-5.74, -12);
    vertex(-2.88, -14);
    vertex(-0.02, -12);
    vertex(2.84, -14);
    vertex(5.8, -12);
    vertex(8.6, -14);
    endShape();
    pop();
  }
}

// scenery
function drawClouds() {
  for (var i = 0; i < clouds.length; i++) {
    fill(225, 225, 225, 150);
    ellipse(clouds[i].x, clouds[i].y, clouds[i].diameter * clouds[i].size);
    ellipse(
      clouds[i].x - (clouds[i].width / 2.75) * clouds[i].size,
      clouds[i].y,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x + (clouds[i].width / 2.75) * clouds[i].size,
      clouds[i].y,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x,
      clouds[i].y - (clouds[i].height / 3) * clouds[i].size,
      (clouds[i].diameter + 10) * clouds[i].size
    );
    ellipse(
      clouds[i].x,
      clouds[i].y - (clouds[i].height / 3 - 1) * clouds[i].size,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x,
      clouds[i].y + (clouds[i].height / 12) * clouds[i].size,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x - (clouds[i].width / 5.5) * clouds[i].size,
      clouds[i].y - (clouds[i].height / 4) * clouds[i].size,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x + (clouds[i].width / 5.5) * clouds[i].size,
      clouds[i].y - (clouds[i].height / 4) * clouds[i].size,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x - (clouds[i].width / 5.5) * clouds[i].size,
      clouds[i].y + (clouds[i].height / 12) * clouds[i].size,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x + (clouds[i].width / 5.5) * clouds[i].size,
      clouds[i].y + (clouds[i].height / 12) * clouds[i].size,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x - (clouds[i].width / 6) * clouds[i].size,
      clouds[i].y,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x + (clouds[i].width / 6) * clouds[i].size,
      clouds[i].y,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x - (clouds[i].width / 5) * clouds[i].size,
      clouds[i].y - (clouds[i].height / 11) * clouds[i].size,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x + (clouds[i].width / 5) * clouds[i].size,
      clouds[i].y - (clouds[i].height / 11) * clouds[i].size,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x - (clouds[i].width / 3.6) * clouds[i].size,
      clouds[i].y,
      clouds[i].diameter * clouds[i].size
    );
    ellipse(
      clouds[i].x + (clouds[i].width / 3.6) * clouds[i].size,
      clouds[i].y,
      clouds[i].diameter * clouds[i].size
    );
  }
}

function drawMountains() {
  for (var i = 0; i < mountains.length; i++) {
    fill(102, 116, 138);
    triangle(
      mountains[i].x - mountains[i].width * 0.5 * mountains[i].size,
      mountains[i].y,
      mountains[i].x + mountains[i].width * 0.5 * mountains[i].size,
      mountains[i].y,
      mountains[i].x,
      mountains[i].y - mountains[i].height * mountains[i].size
    );

    fill(92, 97, 115, 200);
    triangle(
      mountains[i].x - mountains[i].width * 0.5 * mountains[i].size,
      mountains[i].y,
      mountains[i].x - mountains[i].width * 0.3 * mountains[i].size,
      mountains[i].y,
      mountains[i].x,
      mountains[i].y - mountains[i].height * mountains[i].size
    );
  }
}

function drawTrees() {
  for (var i = 0; i < trees.x.length; i++) {
    // trunk
    fill(105, 53, 27);
    rect(trees.x[i] - 26, trees.y - 100, 52, 100);

    // branches
    fill(16, 99, 56);

    triangle(
      trees.x[i] - 65,
      trees.y - 34,
      trees.x[i] + 65,
      trees.y - 34,
      trees.x[i],
      trees.y - 136
    );

    triangle(
      trees.x[i] - 65,
      trees.y - 50,
      trees.x[i] + 65,
      trees.y - 50,
      trees.x[i],
      trees.y - 152
    );

    triangle(
      trees.x[i] - 65,
      trees.y - 68,
      trees.x[i] + 65,
      trees.y - 68,
      trees.x[i],
      trees.y - 170
    );
  }
}

function Hearts(x, y) {
  this.x = x;
  this.y = y;
  this.draw = function () {
    noStroke();
    fill(222, 54, 35);

    push();
    translate(this.x, this.y);
    triangle(-10, -3.5, 10, -3.5, 0, 10);
    ellipse(-5, -5, 10);
    ellipse(5, -5, 10);
    pop();
  };
}

function Score(x, y) {
  this.x = x;
  this.y = y;
  this.size = 0.7;
  this.drawShadow = function () {
    noStroke();
    fill(94, 92, 78, 200);

    push();
    translate(x, y);

    scale(this.size);

    ellipse(10, -11, 20, 21);
    beginShape();
    vertex(2, -24);
    vertex(4, -19.5);
    vertex(16, -19.5);
    vertex(18, -24);
    vertex(2, -24);
    endShape();

    pop();
  };
  this.draw = function () {
    fill(184, 94, 4);

    strokeWeight(1);
    stroke(0);
    push();
    translate(x, y);

    scale(this.size);

    ellipse(10, -11, 20, 21);
    beginShape();
    vertex(2, -24);
    vertex(4, -19.5);
    vertex(16, -19.5);
    vertex(18, -24);
    vertex(2, -24);
    endShape();
    line(0.4, -11, 19.6, -11);
    line(1.4, -15, 18.6, -15);
    noFill();
    stroke(225);
    beginShape();
    vertex(1.4, -14);
    vertex(4.26, -12);
    vertex(7.12, -14);
    vertex(9.98, -12);
    vertex(12.84, -14);
    vertex(15.8, -12);
    vertex(18.6, -14);
    endShape();
    pop();
  };
}

function drawCanyon(t_canyon) {
  fill(2, 180, 230);
  rect(t_canyon.x, t_canyon.y, t_canyon.width, height, 10);
}

function checkCanyon(t_canyon) {
  if (
    gameChar.x >= t_canyon.x &&
    gameChar.x <= t_canyon.x + t_canyon.width &&
    gameChar.y >= floorPos_y
  ) {
    isPlummeting = true;
  }
}

//////// Game character appearance //////

function drawGameChar() {
  if (isLeft && isFalling) {
    //jumping-left code
    charJumpLeft(gameChar.x, gameChar.y);
  } else if (isRight && isFalling) {
    //jumping-right code
    charJumpRight(gameChar.x, gameChar.y);
  } else if (isLeft) {
    //walking left code
    charWalkLeft(gameChar.x, gameChar.y);
  } else if (isRight) {
    //walking right code
    charWalkRight(gameChar.x, gameChar.y);
  } else if (isFalling || isPlummeting) {
    //jumping facing forwards code
    charJumpForward(gameChar.x, gameChar.y);
  } else {
    //standing forward facing code
    charStandForward(gameChar.x, gameChar.y);
  }
}

///// standing forward facing
function charStandForward(x, y) {
  //   boots
  strokeWeight(0.2);
  stroke(0);
  fill(171, 53, 32);
  rect(x - 10, y - 8, 7, 10);
  rect(x + 3, y - 8, 7, 10);

  // body
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(215, 233, 255);
  rect(x - 15, y - 31, 30, 27, 2);
  fill(225, 0, 0);
  rect(x - 7, y - 31, 14, 16);
  noFill();
  strokeWeight(0.7);
  stroke(250, 249, 247);
  beginShape(LINES);
  vertex(x - 2.5, y - 31);
  vertex(x + 2.5, y - 23);
  vertex(x + 2.5, y - 31);
  vertex(x - 2.5, y - 23);
  vertex(x - 2.5, y - 23);
  vertex(x + 2.5, y - 15);
  vertex(x + 2.5, y - 23);
  vertex(x - 2.5, y - 15);
  endShape();

  //   hands
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x - 13, y - 16, 7, 8);
  ellipse(x + 13, y - 16, 7, 8);
  fill(215, 233, 255);
  rect(x - 17, y - 31, 8, 16, 50);
  rect(x + 9, y - 31, 8, 16, 50);

  //   head
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x, y - 45, 40, 40);
  noStroke();

  //   eyes
  fill(255, 255, 247);
  ellipse(x - 7, y - 45, 10, 10);
  ellipse(x + 7, y - 45, 10, 10);

  fill(28, 176, 230);
  ellipse(x - 7, y - 45, 4, 4);
  ellipse(x + 7, y - 45, 4, 4);

  //   brows
  noFill();
  strokeWeight(0.8);
  stroke(0);
  beginShape(LINES);
  vertex(x - 2, y - 50);
  vertex(x - 10, y - 53);

  vertex(x + 2, y - 50);
  vertex(x + 10, y - 53);
  endShape();

  //   chub
  fill(0);
  beginShape();
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 5, y - 64);
  curveVertex(x + 5, y - 62);
  curveVertex(x, y - 59);
  curveVertex(x + 1.5, y - 55);
  curveVertex(x - 1, y - 52);
  curveVertex(x + 3, y - 54);
  curveVertex(x + 4, y - 59);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  endShape();
  noFill();

  //   mustache
  stroke(0);
  strokeWeight(2);
  beginShape();
  curveVertex(x - 6, y - 30);
  curveVertex(x - 6, y - 30);
  curveVertex(x, y - 39);
  curveVertex(x + 6, y - 30);
  curveVertex(x + 6, y - 30);
  endShape();
  noStroke();

  // mouth
  fill(0);
  ellipse(x, y - 34, 4, 2);
}

///// jumping forward facing
function charJumpForward(x, y) {
  //   boots
  strokeWeight(0.2);
  stroke(0);
  fill(171, 53, 32);
  rect(x - 10, y - 8, 7, 5);
  rect(x + 3, y - 8, 7, 5);

  // body
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(215, 233, 255);
  rect(x - 15, y - 31, 30, 23, 2);
  fill(225, 0, 0);
  rect(x - 7, y - 31, 14, 16);
  noFill();
  strokeWeight(0.7);
  stroke(250, 249, 247);
  beginShape(LINES);
  vertex(x - 2.5, y - 31);
  vertex(x + 2.5, y - 23);
  vertex(x + 2.5, y - 31);
  vertex(x - 2.5, y - 23);
  vertex(x - 2.5, y - 23);
  vertex(x + 2.5, y - 15);
  vertex(x + 2.5, y - 23);
  vertex(x - 2.5, y - 15);
  endShape();

  //   head
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x, y - 45, 40, 40);
  noStroke();

  //   eyes
  fill(255, 255, 247);
  ellipse(x - 7, y - 45, 10, 10);
  ellipse(x + 7, y - 45, 10, 10);

  fill(28, 176, 230);
  ellipse(x - 7, y - 43, 4, 4);
  ellipse(x + 7, y - 43, 4, 4);

  //   brows
  noFill();
  strokeWeight(0.8);
  stroke(0);
  beginShape(LINES);
  vertex(x - 2, y - 53);
  vertex(x - 10, y - 51);
  vertex(x + 2, y - 53);
  vertex(x + 10, y - 51);
  endShape();

  //   chub
  fill(0);
  beginShape();
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 5, y - 64);
  curveVertex(x + 5, y - 62);
  curveVertex(x, y - 59);
  curveVertex(x + 1.5, y - 55);
  curveVertex(x - 1, y - 52);
  curveVertex(x + 3, y - 54);
  curveVertex(x + 4, y - 59);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  endShape();
  noFill();

  //   mustache
  stroke(0);
  strokeWeight(2);
  beginShape();
  curveVertex(x - 6, y - 30);
  curveVertex(x - 6, y - 30);
  curveVertex(x, y - 39);
  curveVertex(x + 6, y - 30);
  curveVertex(x + 6, y - 30);
  endShape();
  noStroke();

  // mouth
  fill(0);
  ellipse(x, y - 34, 4, 4);

  //   hands
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x - 13, y - 17, 7, 8);
  ellipse(x + 13, y - 17, 7, 8);
  fill(215, 233, 255);
  rect(x - 17, y - 32, 8, 16, 50);
  rect(x + 9, y - 32, 8, 16, 50);
  noStroke();
}

///// walking left
function charWalkLeft(x, y) {
  //   boots
  strokeWeight(0.2);
  stroke(0);
  fill(171, 53, 32);
  rect(x - 10, y - 8, 7, 10);
  rect(x + 3, y - 8, 7, 10);

  // left hand
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x - 13, y - 16, 7, 8);
  fill(215, 233, 255);
  rect(x - 17, y - 31, 8, 16, 50);

  // body
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(215, 233, 255);
  rect(x - 13, y - 31, 30, 27, 2);
  fill(225, 0, 0);
  rect(x - 7, y - 31, 14, 16);
  noFill();
  strokeWeight(0.7);
  stroke(250, 249, 247);
  beginShape(LINES);
  vertex(x - 2.5, y - 31);
  vertex(x + 2.5, y - 23);
  vertex(x + 2.5, y - 31);
  vertex(x - 2.5, y - 23);
  vertex(x - 2.5, y - 23);
  vertex(x + 2.5, y - 15);
  vertex(x + 2.5, y - 23);
  vertex(x - 2.5, y - 15);
  endShape();

  //   hands;
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x + 13, y - 16, 7, 8);
  fill(215, 233, 255);
  rect(x + 9, y - 31, 8, 16, 50);

  //   head
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x, y - 45, 40, 40);
  noStroke();

  //   eyes
  fill(255, 255, 247);
  ellipse(x - 12, y - 45, 10, 10);
  ellipse(x + 2, y - 45, 10, 10);

  fill(28, 176, 230);
  ellipse(x - 14, y - 45, 4, 4);
  ellipse(x, y - 45, 4, 4);

  //   brows
  noFill();
  strokeWeight(0.8);
  stroke(0);
  beginShape(LINES);
  vertex(x - 8, y - 52);
  vertex(x - 17, y - 52);
  vertex(x - 3, y - 52);
  vertex(x + 6, y - 52);
  endShape();

  //   chub
  fill(0);
  beginShape();
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 5, y - 64);
  curveVertex(x + 5, y - 62);
  curveVertex(x, y - 59);
  curveVertex(x + 1.5, y - 55);
  curveVertex(x - 1, y - 52);
  curveVertex(x + 3, y - 54);
  curveVertex(x + 4, y - 59);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  endShape();
  noFill();

  //   mustache
  stroke(0);
  strokeWeight(2);
  beginShape();
  curveVertex(x - 11, y - 35);
  curveVertex(x - 11, y - 35);
  curveVertex(x - 5, y - 39);
  curveVertex(x + 1, y - 35);
  curveVertex(x + 1, y - 35);
  endShape();
  noStroke();

  // mouth
  fill(0);
  ellipse(x - 5, y - 35, 4, 2);
}

///// walking right
function charWalkRight(x, y) {
  //   boots
  strokeWeight(0.2);
  stroke(0);
  fill(171, 53, 32);
  rect(x - 10, y - 8, 7, 10);
  rect(x + 3, y - 8, 7, 10);

  // right hand
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x + 13, y - 16, 7, 8);
  fill(215, 233, 255);
  rect(x + 9, y - 31, 8, 16, 50);

  // body
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(215, 233, 255);
  rect(x - 17, y - 31, 30, 27, 2);
  fill(225, 0, 0);
  rect(x - 7, y - 31, 14, 16);
  noFill();
  strokeWeight(0.7);
  stroke(250, 249, 247);
  beginShape(LINES);
  vertex(x - 2.5, y - 31);
  vertex(x + 2.5, y - 23);
  vertex(x + 2.5, y - 31);
  vertex(x - 2.5, y - 23);
  vertex(x - 2.5, y - 23);
  vertex(x + 2.5, y - 15);
  vertex(x + 2.5, y - 23);
  vertex(x - 2.5, y - 15);
  endShape();

  //   hands;
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x - 13, y - 16, 7, 8);

  fill(215, 233, 255);
  rect(x - 17, y - 31, 8, 16, 50);

  //   head
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x, y - 45, 40, 40);
  noStroke();

  //   eyes
  fill(255, 255, 247);
  ellipse(x - 2, y - 45, 10, 10);
  ellipse(x + 12, y - 45, 10, 10);
  fill(28, 176, 230);
  ellipse(x, y - 45, 4, 4);
  ellipse(x + 14, y - 45, 4, 4);

  //   brows
  noFill();
  strokeWeight(0.8);
  stroke(0);
  beginShape(LINES);
  vertex(x - 6, y - 52);
  vertex(x + 3, y - 52);
  vertex(x + 8, y - 52);
  vertex(x + 17, y - 52);
  endShape();

  //   chub
  fill(0);
  beginShape();
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 5, y - 64);
  curveVertex(x + 5, y - 62);
  curveVertex(x, y - 59);
  curveVertex(x + 1.5, y - 55);
  curveVertex(x - 1, y - 52);
  curveVertex(x + 3, y - 54);
  curveVertex(x + 4, y - 59);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  endShape();
  noFill();

  //   mustache
  stroke(0);
  strokeWeight(2);
  beginShape();
  curveVertex(x - 1, y - 35);
  curveVertex(x - 1, y - 35);
  curveVertex(x + 5, y - 39);
  curveVertex(x + 11, y - 35);
  curveVertex(x + 11, y - 35);
  endShape();
  noStroke();

  // mouth
  fill(0);
  ellipse(x + 5, y - 35, 4, 2);
}

///// jumping left
function charJumpLeft(x, y) {
  //   boots
  strokeWeight(0.2);
  stroke(0);
  fill(171, 53, 32);
  rect(x - 10, y - 8, 7, 5);
  rect(x + 3, y - 8, 7, 7);

  // left hand
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x - 13, y - 16, 7, 8);
  fill(215, 233, 255);
  rect(x - 17, y - 31, 8, 16, 50);

  // body
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(215, 233, 255);
  rect(x - 13, y - 31, 30, 23, 2);
  fill(225, 0, 0);
  rect(x - 7, y - 31, 14, 16);
  noFill();
  strokeWeight(0.7);
  stroke(250, 249, 247);
  beginShape(LINES);
  vertex(x - 2.5, y - 31);
  vertex(x + 2.5, y - 23);
  vertex(x + 2.5, y - 31);
  vertex(x - 2.5, y - 23);
  vertex(x - 2.5, y - 23);
  vertex(x + 2.5, y - 15);
  vertex(x + 2.5, y - 23);
  vertex(x - 2.5, y - 15);
  endShape();

  //   hands;
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x + 13, y - 16, 7, 8);
  fill(215, 233, 255);
  rect(x + 9, y - 31, 8, 16, 50);

  //   head
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x, y - 45, 40, 40);
  noStroke();

  //   eyes
  fill(255, 255, 247);
  ellipse(x - 12, y - 45, 10, 10);
  ellipse(x + 2, y - 45, 10, 10);

  fill(28, 176, 230);
  ellipse(x - 14, y - 46, 4, 4);
  ellipse(x, y - 46, 4, 4);

  //   brows
  noFill();
  strokeWeight(0.8);
  stroke(0);
  beginShape(LINES);
  vertex(x - 8, y - 54.5);
  vertex(x - 17, y - 54.5);
  vertex(x - 3, y - 54.5);
  vertex(x + 6, y - 54.5);
  endShape();

  //   chub
  fill(0);
  beginShape();
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 5, y - 64);
  curveVertex(x + 5, y - 62);
  curveVertex(x, y - 59);
  curveVertex(x + 1.5, y - 55);
  curveVertex(x - 1, y - 52);
  curveVertex(x + 3, y - 54);
  curveVertex(x + 4, y - 59);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  endShape();
  noFill();

  //   mustache
  stroke(0);
  strokeWeight(2);
  beginShape();
  curveVertex(x - 11, y - 35);
  curveVertex(x - 11, y - 35);
  curveVertex(x - 5, y - 39);
  curveVertex(x + 1, y - 35);
  curveVertex(x + 1, y - 35);
  endShape();
  noStroke();

  // mouth
  fill(0);
  ellipse(x - 5, y - 35, 4, 4);
}

///// jumping right
function charJumpRight(x, y) {
  //   boots
  strokeWeight(0.2);
  stroke(0);
  fill(171, 53, 32);
  rect(x - 10, y - 8, 7, 7);
  rect(x + 3, y - 8, 7, 5);

  // right hand
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x + 13, y - 16, 7, 8);
  fill(215, 233, 255);
  rect(x + 9, y - 31, 8, 16, 50);

  // body
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(215, 233, 255);
  rect(x - 17, y - 31, 30, 23, 2);
  fill(225, 0, 0);
  rect(x - 7, y - 31, 14, 16);
  noFill();
  strokeWeight(0.7);
  stroke(250, 249, 247);
  beginShape(LINES);
  vertex(x - 2.5, y - 31);
  vertex(x + 2.5, y - 23);
  vertex(x + 2.5, y - 31);
  vertex(x - 2.5, y - 23);
  vertex(x - 2.5, y - 23);
  vertex(x + 2.5, y - 15);
  vertex(x + 2.5, y - 23);
  vertex(x - 2.5, y - 15);
  endShape();

  //   hands
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x - 13, y - 16, 7, 8);
  fill(215, 233, 255);
  rect(x - 17, y - 31, 8, 16, 50);

  //   head
  strokeWeight(0.4);
  stroke(167, 170, 171);
  fill(255, 179, 129);
  ellipse(x, y - 45, 40, 40);
  noStroke();

  //   eyes
  fill(255, 255, 247);
  ellipse(x - 2, y - 45, 10, 10);
  ellipse(x + 12, y - 45, 10, 10);

  fill(28, 176, 230);
  ellipse(x, y - 46, 4, 4);
  ellipse(x + 14, y - 46, 4, 4);

  //   brows
  noFill();
  strokeWeight(0.8);
  stroke(0);
  beginShape(LINES);
  vertex(x - 6, y - 54.5);
  vertex(x + 3, y - 54.5);
  vertex(x + 8, y - 54.5);
  vertex(x + 17, y - 54.5);
  endShape();

  //   chub
  fill(0);
  beginShape();
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 5, y - 64);
  curveVertex(x + 5, y - 62);
  curveVertex(x, y - 59);
  curveVertex(x + 1.5, y - 55);
  curveVertex(x - 1, y - 52);
  curveVertex(x + 3, y - 54);
  curveVertex(x + 4, y - 59);
  curveVertex(x + 10, y - 62);
  curveVertex(x + 10, y - 62);
  endShape();
  noFill();

  //   mustache
  stroke(0);
  strokeWeight(2);
  beginShape();
  curveVertex(x - 1, y - 35);
  curveVertex(x - 1, y - 35);
  curveVertex(x + 5, y - 39);
  curveVertex(x + 11, y - 35);
  curveVertex(x + 11, y - 35);
  endShape();
  noStroke();

  // mouth
  fill(0);
  ellipse(x + 5, y - 34, 4, 4);
}

//draw Enemy
function enemyWalkRight(x, y) {
  push();
  translate(x, y + 5);

  stroke(0);

  strokeWeight(0.5);

  // tail
  fill(232, 145, 46);
  stroke(0);

  beginShape();
  curveVertex(-20, -10);
  curveVertex(-20, -10);
  curveVertex(-35, -30);
  curveVertex(-31, -60);
  curveVertex(-29, -58.2);
  curveVertex(-20, -26);
  curveVertex(-20, -26);
  endShape();

  // back ear
  beginShape();
  curveVertex(-14, -67.5);
  curveVertex(-14, -67.5);
  curveVertex(-16.5, -75.5);
  curveVertex(-11, -71);
  endShape(CLOSE);

  beginShape();
  // head
  curveVertex(-16, -52);
  curveVertex(-16, -52);
  curveVertex(-15, -57.5);
  curveVertex(-16, -63);
  curveVertex(-17.5, -67);
  curveVertex(-19, -73.5);
  curveVertex(-14.8, -71);
  curveVertex(-9.5, -72.5);
  curveVertex(-4.5, -70);
  curveVertex(-2, -65.5);
  curveVertex(1.5, -64.3);
  curveVertex(6, -65.5);
  curveVertex(4, -62.5);
  curveVertex(-0.5, -59.5);
  curveVertex(-3, -58);
  curveVertex(-5, -54);
  curveVertex(-2, -51);
  curveVertex(-5, -47);
  curveVertex(-13, -47);
  curveVertex(-16, -52);
  curveVertex(-16, -52);
  endShape();

  // body
  fill(106, 204, 222);
  beginShape();
  curveVertex(-16, -52);
  curveVertex(-16, -52);
  curveVertex(-13, -47);
  curveVertex(-6, -47);
  curveVertex(-3, -51);
  curveVertex(-0.5, -49.7);
  curveVertex(4, -43.5);
  curveVertex(8, -41);
  curveVertex(15, -42);
  curveVertex(15, -42);
  curveVertex(17, -39);
  curveVertex(17, -39);
  curveVertex(13, -34.5);
  curveVertex(10.5, -31.5);
  curveVertex(8, -29.5);
  curveVertex(3.5, -30);
  curveVertex(-1.5, -34);
  // skirt
  curveVertex(-1.5, -34);
  curveVertex(3, -28);
  // lower part of the skirt
  curveVertex(10, -5);
  curveVertex(7, 0);
  curveVertex(5, -2);
  curveVertex(1, 0);
  curveVertex(-2, -2);
  curveVertex(-5, 0);
  curveVertex(-8, -2);
  curveVertex(-11, 0);
  curveVertex(-14, -2);
  curveVertex(-17, 0);
  curveVertex(-20, -2);
  // skirt going up
  curveVertex(-23, -3);
  curveVertex(-20, -30);
  curveVertex(-21, -40);
  curveVertex(-19, -47);
  curveVertex(-16, -52);
  curveVertex(-16, -52);

  endShape();

  // body contour
  beginShape();
  curveVertex(-2, -34);
  curveVertex(-2, -34);
  curveVertex(-2, -45);
  curveVertex(-4, -49);
  curveVertex(-4, -49);
  endShape();

  // hand
  noFill();
  beginShape();
  curveVertex(-20, -30);
  curveVertex(-20, -30);
  curveVertex(-16, -40);
  curveVertex(-16, -52);
  curveVertex(-16, -52);
  endShape();

  //wrist
  fill(232, 145, 46);
  beginShape();
  curveVertex(15, -42);
  curveVertex(15, -42);
  curveVertex(19, -44);
  curveVertex(19, -40);
  curveVertex(17, -39);
  curveVertex(17, -39);
  curveVertex(15, -42);
  curveVertex(15, -42);
  endShape();

  // apron
  fill("white");
  rect(-18, -34, 16, 20);

  // pattern
  fill("red");
  rect(-18, -24, 16, 4);

  for (var i = 0; i < 3; i++) {
    line(-17.5 + i * 5, -20, -12 + i * 5, -24);
    line(-17.5 + i * 5, -24, -12 + i * 5, -20);
  }

  // dress lines
  line(-11, -46, -11, -34);
  line(-9, -46, -9, -34);

  //jewelry
  noFill();
  beginShape();
  curveVertex(-16, -52);
  curveVertex(-16, -52);
  curveVertex(-10, -50);
  curveVertex(-3.8, -52);
  curveVertex(-3.8, -52);
  endShape();

  fill(250, 27, 27);
  ellipse(-14.5, -50.6, 2);
  ellipse(-12, -50.2, 2);
  ellipse(-9.5, -50, 2);
  ellipse(-7, -50.2, 2);
  ellipse(-4.5, -50.6, 2);

  // eye
  fill("white");
  beginShape();
  curveVertex(-11, -65.2);
  curveVertex(-11, -65.2);
  curveVertex(-8, -67);
  curveVertex(-5.5, -65);
  endShape(CLOSE);

  noStroke();
  fill("blue");
  ellipse(-7.5, -66, 2);
  noStroke();

  // mouth
  stroke(0);
  strokeWeight(0.5);
  noFill();
  beginShape();
  curveVertex(-0.5, -59.5);
  curveVertex(-0.5, -59.5);
  curveVertex(-3, -60);
  curveVertex(-5, -61.7);
  curveVertex(-5, -61.7);
  endShape();
  pop();
}
function enemyWalkLeft(x, y) {
  push();
  translate(x, y + 5);

  stroke(0);

  strokeWeight(0.5);

  // tail

  fill(232, 145, 46);

  beginShape();
  curveVertex(20, -10);
  curveVertex(20, -10);
  curveVertex(35, -30);
  curveVertex(31, -60);
  curveVertex(29, -58.2);
  curveVertex(20, -26);
  curveVertex(20, -26);
  endShape();

  // backear
  beginShape();
  curveVertex(14, -67.5);
  curveVertex(14, -67.5);
  curveVertex(16.5, -75.5);
  curveVertex(11, -71);
  endShape(CLOSE);

  beginShape();
  // head
  curveVertex(16, -52);
  curveVertex(16, -52);
  curveVertex(15, -57.5);
  curveVertex(16, -63);
  curveVertex(17.5, -67);
  curveVertex(19, -73.5);
  curveVertex(14.8, -71);
  curveVertex(9.5, -72.5);
  curveVertex(4.5, -70);
  curveVertex(2, -65.5);
  curveVertex(-1.5, -64.3);
  curveVertex(-6, -65.5);
  curveVertex(-4, -62.5);
  curveVertex(0.5, -59.5);
  curveVertex(3, -58);
  curveVertex(5, -54);
  curveVertex(2, -51);
  curveVertex(5, -47);
  curveVertex(13, -47);
  curveVertex(16, -52);
  curveVertex(16, -52);
  endShape();

  // body

  fill(106, 204, 222);
  beginShape();
  curveVertex(16, -52);
  curveVertex(16, -52);
  curveVertex(13, -47);
  curveVertex(6, -47);
  curveVertex(3, -51);
  curveVertex(0.5, -49.7);
  curveVertex(-4, -43.5);
  curveVertex(-8, -41);
  curveVertex(-15, -42);
  curveVertex(-15, -42);
  curveVertex(-17, -39);
  curveVertex(-17, -39);
  curveVertex(-13, -34.5);
  curveVertex(-10.5, -31.5);
  curveVertex(-8, -29.5);
  curveVertex(-3.5, -30);
  curveVertex(1.5, -34);
  // skirt
  curveVertex(1.5, -34);
  curveVertex(-3, -28);
  // lower part of the skirt
  curveVertex(-10, -5);
  curveVertex(-7, 0);
  curveVertex(-5, -2);
  curveVertex(-1, 0);
  curveVertex(2, -2);
  curveVertex(5, 0);
  curveVertex(8, -2);
  curveVertex(11, 0);
  curveVertex(14, -2);
  curveVertex(17, 0);
  curveVertex(20, -2);
  // skirt going up
  curveVertex(23, -3);
  curveVertex(20, -30);
  curveVertex(21, -40);
  curveVertex(19, -47);
  curveVertex(16, -52);
  curveVertex(16, -52);

  endShape();

  // body contour
  beginShape();
  curveVertex(2, -34);
  curveVertex(2, -34);
  curveVertex(2, -45);
  curveVertex(4, -49);
  curveVertex(4, -49);
  endShape();

  // hand
  noFill();
  beginShape();
  curveVertex(20, -30);
  curveVertex(20, -30);
  curveVertex(16, -40);
  curveVertex(16, -52);
  curveVertex(16, -52);
  endShape();

  //wrist
  fill(232, 145, 46);
  beginShape();
  curveVertex(-15, -42);
  curveVertex(-15, -42);
  curveVertex(-19, -44);
  curveVertex(-19, -40);
  curveVertex(-17, -39);
  curveVertex(-17, -39);
  curveVertex(-15, -42);
  curveVertex(-15, -42);
  endShape();

  // apron
  fill("white");
  rect(18, -34, -16, 20);

  // pattern
  fill("red");
  rect(18, -24, -16, 4);

  for (var i = 0; i < 3; i++) {
    line(12 - i * 5, -20, 17.5 - i * 5, -24);
    line(12 - i * 5, -24, 17.5 - i * 5, -20);
  }

  // dress lines
  line(11, -46, 11, -34);
  line(9, -46, 9, -34);

  //jewelry
  noFill();
  beginShape();
  curveVertex(16, -52);
  curveVertex(16, -52);
  curveVertex(10, -50);
  curveVertex(3.8, -52);
  curveVertex(3.8, -52);
  endShape();

  fill(250, 27, 27);
  ellipse(14.5, -50.6, 2);
  ellipse(12, -50.2, 2);
  ellipse(9.5, -50, 2);
  ellipse(7, -50.2, 2);
  ellipse(4.5, -50.6, 2);

  // eye
  fill("white");
  beginShape();
  curveVertex(11, -65.2);
  curveVertex(11, -65.2);
  curveVertex(8, -67);
  curveVertex(5.5, -65);
  endShape(CLOSE);
  noStroke();
  fill("blue");
  ellipse(7.5, -66, 2);
  noStroke();

  // mouth
  stroke(0);
  strokeWeight(0.5);
  noFill();
  beginShape();
  curveVertex(0.5, -59.5);
  curveVertex(0.5, -59.5);
  curveVertex(3, -60);
  curveVertex(5, -61.7);
  curveVertex(5, -61.7);
  endShape();
  pop();
}

//stars (Constructor)
function Star(x, y) {
  this.x = x;
  this.y = y;
  this.draw = function (alpha) {
    noStroke();
    fill(232, 232, 232, alpha);
    ellipse(this.x, this.y, 1.5);
  };
}

// construct particles
// updated patricle system from the lesson
function Particle(x, y, xSpeed, ySpeed, size) {
  var vector = createVector(x, y);
  this.x = vector.x;
  this.y = vector.y;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
  this.size = size;
  this.r = random(180, 255);
  this.g = random(180, 200);
  this.b = random(3, 60);
  this.aplha = random(0, 255);
  this.age = 0;
  this.drawParticle = function () {
    noStroke();
    fill(this.r, this.g, this.b, this.aplha);

    push();

    translate(this.x, this.y);
    scale(this.size);

    beginShape();
    vertex(0, -2.5);
    vertex(1, -1);
    vertex(2.5, -0.5);
    vertex(1.5, 0.7);
    vertex(1.5, 2.5);
    vertex(0, 2);
    vertex(-1.5, 2.5);
    vertex(-1.5, 0.7);
    vertex(-2.5, -0.5);
    vertex(-1, -1);
    vertex(0 - 2.5);
    endShape();
    pop();
  };
  this.updateParticle = function () {
    this.x -= xSpeed;
    this.y += ySpeed;
    this.age++;
  };
}

function Emitter(x, y, xSpeed, ySpeed, size) {
  this.x = x;
  this.y = y;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
  this.size = size;
  this.particles = [];
  this.startParticles = 0;
  this.lifetime = 0;
  this.addParticle = function () {
    var p = new Particle(
      this.x,
      this.y,
      random(this.xSpeed - 1, this.xSpeed + 1),
      random(this.ySpeed - 1, this.ySpeed + 1),
      random(this.size - 0.7, this.size + 0.7)
    );
    if (this.x > random(width + 5500, 10000)) {
      this.x = x;
      this.y = y;
    }
    this.x += 1;
    this.y -= 0.25;

    return p;
  };
  this.startEmitter = function (startParticles, lifetime) {
    this.startParticles = startParticles;
    this.lifetime = lifetime;

    //start emitter with initial particles
    for (var i = 0; i < startParticles; i++) {
      this.particles.push(this.addParticle());
    }
  };
  this.updateParticles = function () {
    var deadParticles = 0;
    for (var i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].drawParticle();

      this.particles[i].updateParticle();
      if (this.particles[i].age > random(0, this.lifetime)) {
        this.particles.splice(i, 1);
        deadParticles++;
      }
    }
    if (deadParticles > 0) {
      for (var i = 0; i < deadParticles; i++) {
        this.particles.push(this.addParticle());
      }
    }
  };
}
