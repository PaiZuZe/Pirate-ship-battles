////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                              Server - Player                               //
////////////////////////////////////////////////////////////////////////////////

const SAT = require('sat');
const Bullet = require('./bullet.js');
const aux = require('./_aux.js');

const MAX_ACCEL = 50;
const DRAG_CONST = 0.1;
const ANGULAR_VEL = 0.5;
const DRAG_POWER = 1.5;
const BULLET_COOLDOWN = 1000; // ms
const DBHT = 500; // ms  // Double bullet hold time
const TBHT = 1000; // ms  // Triple bullet hold time

////////////////////////////////////////////////////////////////////////////////
// Player                                                                     //
////////////////////////////////////////////////////////////////////////////////
module.exports = class Player {
  constructor (x, y, angle, id, username) {
    this.id = id;
    this.username = username;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 0;
    this.accel = 0;
    this.dead = false;
    this.bullets = 10;
    this.life = 3;
    this.invul_time = 0;
    this.ammo_counter = 0;
    this.life_counter = 0;
    this.anchored_timer = 0;
    this.poly = new SAT.Polygon(new SAT.Vector(this.x, this.y), [
      new SAT.Vector(-9, -38),
      new SAT.Vector(1, -38),
      new SAT.Vector(11, -13),
      new SAT.Vector(35, 1),
      new SAT.Vector(48, -7),
      new SAT.Vector(43, 21),
      new SAT.Vector(13, 26),
      new SAT.Vector(6, 36),
      new SAT.Vector(-8, 36),
      new SAT.Vector(-16, 26),
      new SAT.Vector(-45, 21),
      new SAT.Vector(-50, -7),
      new SAT.Vector(-37, 1),
      new SAT.Vector(-13, -13)
    ]);
    this.prowLine = new SAT.Polygon(new SAT.Vector(this.x, this.y), [
      new SAT.Vector(48, -1),
      new SAT.Vector(48, 1)
    ]);
    this.middleLine = new SAT.Polygon(new SAT.Vector(this.x, this.y), [
      new SAT.Vector(24, -18),
      new SAT.Vector(24, 18)
    ]);
    this.inputs = {
   			up: false,
      left: false,
      right: false,
      shootLeft: false,
      shootRight: false
    };
    this.lastShootTimeLeft = 0;
    this.lastShootTimeRight = 0;
  }

  //////////////////////////////////////////////////////////////////////////////
  /**
   * Attempts to shoot a bullet in the provided direction  taking  into  account
   * the last time it shot in the same direction.
   * @param {Boolean} rightSide whether the ship is shooting from the right side
   * @returns {Bullet} The bullet just created, or null if it can not shoot
   */
  tryToShoot (rightSide) {
    if (this.bullets <= 0)
      return [];

    let canShoot = false;

    if (rightSide) {
      if (this.canShoot(true)) {
        canShoot = true;
        this.lastShootTimeRight = Date.now();
      }
    } else {
      if (this.canShoot(false)) {
        canShoot = true;
        this.lastShootTimeLeft = Date.now();
      }
    }

    if (canShoot) {
      this.bullets -= 1;
      console.log(`SHOOT! bullets left: ${this.bullets}`);
      let side = (rightSide ? 1 : -1);
      let [offx, offy] = aux.rotate(this.angle, 20 * side, -10);
      let bullets = [new Bullet(this.x + offx, this.y + offy,
                                this.angle,
                                this.id, 100)];
      return bullets;
    } else {
      return [];
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  canShoot (rightSide) {
    if (rightSide && this.lastShootTimeRight + BULLET_COOLDOWN < Date.now())
      return true;
    if (!rightSide && this.lastShootTimeLeft + BULLET_COOLDOWN < Date.now())
      return true;
    return false;
  }

  //////////////////////////////////////////////////////////////////////////////
  addAngle (angle) {
    this.angle += angle;
    this.poly.setAngle(this.angle-Math.PI/2);
    this.prowLine.setAngle(this.angle-Math.PI/2);
    this.middleLine.setAngle(this.angle-Math.PI/2);
  }

  //////////////////////////////////////////////////////////////////////////////
  addPos (x, y) {
    this.x += x;
    this.y += y;
    this.poly.pos.x = this.x;
    this.poly.pos.y = this.y;
    this.prowLine.pos.x = this.x;
    this.prowLine.pos.y = this.y;
    this.middleLine.pos.x = this.x;
    this.middleLine.pos.y = this.y;
  }

  //////////////////////////////////////////////////////////////////////////////
  setPos (x, y) {
    this.x = x;
    this.y = y;
    this.poly.pos.x = this.x;
    this.poly.pos.y = this.y;
    this.prowLine.pos.x = this.x;
    this.prowLine.pos.y = this.y;
    this.middleLine.pos.x = this.x;
    this.middleLine.pos.y = this.y;
  }

  //////////////////////////////////////////////////////////////////////////////
  updatePos (dt) {
    this.accel = -Math.max(DRAG_CONST*Math.pow(this.speed, DRAG_POWER), 0);
    this.accel += (this.inputs.up)? MAX_ACCEL : 0;
    this.speed += this.accel*dt;
    if (this.speed < 2 && this.accel < 2)
      this.speed = 0;
    this.addPos(Math.sin(this.angle)*this.speed*dt, -Math.cos(this.angle)*this.speed*dt);
    let ratio = this.speed/Math.pow(MAX_ACCEL/DRAG_CONST, 1/DRAG_POWER);
    this.addAngle((this.inputs.right)? ratio*ANGULAR_VEL*dt : 0);
    this.addAngle((this.inputs.left)? -ratio*ANGULAR_VEL*dt : 0);
  }

  //////////////////////////////////////////////////////////////////////////////
  takeDamage (delta, mod) {
    this.invul_time += delta;
    if (this.invul_time % (mod * delta) == 0) {
      this.life--;
      this.invul_time = delta;
    }
  }
  //adcionar os counter no player
  gainResource (delta, mod, type) {
    if (type == "life") {
      this.life += 1;
    }
    else {
      this.bullets += 3;
    }
  }

};

////////////////////////////////////////////////////////////////////////////////
