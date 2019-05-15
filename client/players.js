////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                              Client - Players                              //
////////////////////////////////////////////////////////////////////////////////

var enemies = {};
var player = null;
const LABEL_DIFF = 70;

////////////////////////////////////////////////////////////////////////////////
// Ship                                                                       //
////////////////////////////////////////////////////////////////////////////////
class Ship {
  constructor () {}

  //////////////////////////////////////////////////////////////////////////////
  update (data) {
    console.log(data.x);
    console.log(data.y);
    console.log("=======");
    this.body.x = data.x;
    this.body.y = data.y;
    this.body.setVelocity(Math.sin(data.angle) * data.speed, -(Math.cos(data.angle) * data.speed));
    this.body.angle = data.angle * 180 / Math.PI;
    this.body.setDepth(data.y);
    this.text.setDepth(data.y);
  }

  //////////////////////////////////////////////////////////////////////////////
  updatePredictive (delta) {
    this.text.x = this.body.x;
    this.text.y = this.body.y - LABEL_DIFF;
    this.text.setDepth(this.body.y);
  }

  //////////////////////////////////////////////////////////////////////////////
  destroy() {
    this.body.destroy();
    this.text.destroy();
  }
}

////////////////////////////////////////////////////////////////////////////////
// Player                                                                     //
////////////////////////////////////////////////////////////////////////////////
class Player extends Ship {
  constructor (scene, x, y, username) {
    super();
    this.text = scene.add.text(x, y - LABEL_DIFF, username, {fill: "white"});
    this.anchored_timer = 0;
    let sprite = "ship";
    this.body = scene.physics.add.sprite(x, y, sprite, 0);
    this.text.setOrigin(0.5);
    this.body.setOrigin(0.5);
    this.body.setCircle(1, 16, 32);
    this.bullets = 0;
    scene.cameras.main.startFollow(this.body);
    this.leftHoldStart = 0;
    this.rightHoldStart = 0;
    this.lastShootTimeLeft = 0;
    this.lastShootTimeRight = 0;
  }

  //////////////////////////////////////////////////////////////////////////////
  update (data) {
    super.update(data);
    this.bullets = data.bullets;
    this.life = data.life;
    this.leftHoldStart = data.leftHoldStart;
    this.rightHoldStart = data.rightHoldStart;
    this.lastShootTimeLeft = data.lastShootTimeLeft;
    this.lastShootTimeRight = data.lastShootTimeRight;
    this.anchored_timer = data.anchored_timer;
  }
};

////////////////////////////////////////////////////////////////////////////////
function createPlayer (data) {
  if (!player) {
    player = new Player(this, data.x, data.y, data.username); // calling constructor with data.x and data.y undefined
    hud = new HUD(this);

    /* Confirming collision shape -- dumb way
    let colpoly = this.add.graphics();
    let color = 0xff0000;
    let thickness = 4;
    let alpha = 0.5;
    let smoothness = 64;
    colpoly.lineStyle(thickness, color, alpha);

    points = new Array();
    for (let i = 0; i < data.poly.points.length; i++) {
      points[2*i] = data.x + data.poly.points[i].x;
      points[2*i + 1] = data.y + data.poly.points[i].y;
    }
    console.log(points);
    let poly = new Phaser.Geom.Polygon(points);
    colpoly.strokePoints(poly.points, true);

    colpoly.fillStyle(color, alpha);
    colpoly.fillPoints(poly.points, true);
    */
  }
}

////////////////////////////////////////////////////////////////////////////////
// Enemy                                                                      //
////////////////////////////////////////////////////////////////////////////////
class Enemy extends Ship {
  constructor (scene, id, x, y, username) {
    super();
    this.id = id;
    this.text = scene.add.text(x, y - LABEL_DIFF, username, {fill: "darkGray"});
    let sprite = "ship";
    this.body = scene.physics.add.sprite(x, y, sprite, 0);
    this.text.setOrigin(0.5);
    this.body.setOrigin(0.5);
    this.body.setCircle(1, 16, 32);
  }
};

////////////////////////////////////////////////////////////////////////////////
function createEnemy (data) {
  if (!(data.id in enemies))
    enemies[data.id] = new Enemy(this, data.id, data.x, data.y, data.username);
  else
    console.log("Failed to create enemy");
}

////////////////////////////////////////////////////////////////////////////////
