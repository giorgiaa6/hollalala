let font;
let tSize = 250; // size of text
let tposX = 250; // X position of text
let tposY = 500; // Y position of text
let pointCount = 0.3; // 0-1 number of particles

let speed = 40; // speed of particles
let comebackSpeed = 150; // lower number less strength
let dia = 100; // diameter of interaction
let randomPos = true; // random position for the start of particles
let pointsDirection = "left"; // direction of particles
let interactionDirection = 1; // between -1 and 1 for push/pull

let textPoints = [];
let isFalling = false; // tracks falling state

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(1000, 1000);
  textFont(font);

  let points = font.textToPoints("gio", tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  for (let i = 0; i < points.length; i++) {
    let pt = points[i];

    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }
}

function draw() {
  background(255, 20); // White background with slight transparency for trailing effect

  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update();
    v.show();
    v.behaviors();
  }
}

// Handle mouse clicks to toggle between falling and returning
function mousePressed() {
  isFalling = !isFalling; // toggle between falling and returning

  for (let i = 0; i < textPoints.length; i++) {
    let particle = textPoints[i];
    if (isFalling) {
      particle.explode(); // initiate explosion effect for falling
    } else {
      particle.returnToHome(); // return particles to their original position
    }
  }
}

function Interact(x, y, m, d, t, s, di, p) {
  this.home = createVector(x, y);
  this.pos = t ? createVector(random(width), random(height)) : this.home.copy();
  this.target = this.home.copy();

  this.vel = createVector(); // start with zero velocity
  this.acc = createVector();
  this.r = 8; // initial size of particles
  this.maxSpeed = m;
  this.maxforce = 1;
  this.dia = d;
  this.come = s;
  this.dir = p;
  this.gravity = createVector(0, 0.2); // gravity force for falling effect
  this.isFalling = false; // tracks if particle is in falling state
  this.color = color(255); // default color (white)
  this.shape = 'circle'; // default shape

  this.randomizeShapeAndColor();
}

// Randomly assigns a shape (circle, square, or triangle) and color
Interact.prototype.randomizeShapeAndColor = function() {
  let shapes = ['circle', 'square', 'triangle'];
  this.shape = random(shapes); // randomly choose a shape
  this.color = color(random(255), random(255), random(255), 200); // semi-transparent for trail effect
};

// Initiates explosion to start falling with random velocity
Interact.prototype.explode = function () {
  if (!this.isFalling) {
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(5, 10)); // increase speed for explosion effect
    this.isFalling = true;
  }
};

// Set target back to original position and reset velocity
Interact.prototype.returnToHome = function () {
  this.target = this.home.copy();
  this.isFalling = false;
  this.vel.mult(0); // reset velocity
};

Interact.prototype.behaviors = function () {
  if (isFalling) {
    this.applyForce(this.gravity); // apply gravity when particles are falling
  } else {
    let returnForce = this.arrive(this.home); // return smoothly to home position
    this.applyForce(returnForce);
  }
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

// Steering behavior to arrive at target smoothly
Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  return steer;
};

Interact.prototype.update = function () {
  this.vel.add(this.acc);
  this.pos.add(this.vel);
  this.acc.mult(0);

  // Stop particle at bottom of canvas if falling
  if (isFalling && this.pos.y > height) {
    this.vel.y = 0;
    this.pos.y = height;
  }
};

Interact.prototype.show = function () {
  noStroke();
  fill(this.color);

  if (this.shape === 'circle') {
    ellipse(this.pos.x, this.pos.y, this.r, this.r);
  } else if (this.shape === 'square') {
    rect(this.pos.x - this.r / 2, this.pos.y - this.r / 2, this.r, this.r);
  } else if (this.shape === 'triangle') {
    triangle(
      this.pos.x, this.pos.y - this.r / 2,
      this.pos.x - this.r / 2, this.pos.y + this.r / 2,
      this.pos.x + this.r / 2, this.pos.y + this.r / 2
    );
  }
};
