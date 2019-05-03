const SAT = require('sat');
const Bullet = require('./bullet.js');
const aux = require('./_aux.js');

const MAX_ACCEL = 100;
const DRAG_CONST = 0.1;
const ANGULAR_VEL = 1;
const DRAG_POWER = 1.5;
const BULLET_COOLDOWN = 500; // ms



module.exports = class Enemy {
    constructor (x, y, angle, id) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.username = "blob";
      this.angle = angle;
      this.speed = 0;
      this.accel = 0;
      this.dead = false;
      this.bullets = Infinity;
      this.life = 3;
      this.invul_time = 0;
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
      this.agro = new SAT.Circle(new SAT.Vector(this.x, this.y), 100);
      this.inputs = {
                 up: false,
        left: false,
        right: false,
        shootLeft: false,
        shootRight: false
      };
      this.lastShootTime = 0;
    }

    takeAction(playerList) {
      let playersToConsider = [];
      for (const k in playerList) {
        let p = playerList[k];
         /*
        if (SAT.testPolygonPolygon(p.poly, this.agro)) {
          playersToConsider.push(p);
        }
        */
      }
      if (playersToConsider.lenth > 0) {
        let player_index = Math.floor(Math.random() * playersToConsider.lenth);
        this.allign_with(playersToConsider[player_index]);
      }
    }

    allign_with(object) {
      del_x = this.x - object.x;
      del_y = this.y - object.y;
      theta = Math.atan2(del_y, del_x); 
      this.angle = theta + Math.PI/2;
    }
  
    //////////////////////////////////////////////////////////////////////////////
    /**
     * Attempts to shoot a bullet in the provided direction  taking  into  account
     * the last time it shot in the same direction.
     * @param {Boolean} rightSide whether the ship is shooting from the right side
     * @returns {Bullet} The bullet just created, or null if it can not shoot
     */
    tryToShoot (rightSide) {
      let canShoot = false;
      if (this.canShoot()) {
          canShoot = true;
          this.lastShootTime = Date.now();
      }
      if (canShoot) {
        console.log(`SHOOT! bullets left: ${this.bullets}`);
        let side = (rightSide ? 1 : -1);
        let [offx, offy] = aux.rotate(this.angle, 20 * side, -10);
        let bullets = [new Bullet(this.x + offx, this.y + offy,
                                  this.angle,
                                  this.id, 1000)];
        return bullets;
      } else {
        return [];
      }
    }
  
    //////////////////////////////////////////////////////////////////////////////
    canShoot () {
      if (this.lastShootTime + BULLET_COOLDOWN < Date.now())
        return true;
      return false;
    }
  
    //////////////////////////////////////////////////////////////////////////////
    addAngle (angle) {
      this.angle += angle;
      this.poly.setAngle(this.angle);
    }
  
    //////////////////////////////////////////////////////////////////////////////
    addPos (x, y) {
      this.x += x;
      this.y += y;
      this.poly.pos.x = this.x;
      this.poly.pos.y = this.y;
    }
  
    //////////////////////////////////////////////////////////////////////////////
    setPos (x, y) {
      this.x = x;
      this.y = y;
      this.poly.pos.x = this.x;
      this.poly.pos.y = this.y;
    }
  
    //////////////////////////////////////////////////////////////////////////////
    updatePos (dt) {
      this.accel = -Math.max(DRAG_CONST*Math.pow(this.speed, DRAG_POWER), 0);
      this.accel += (this.inputs.up)? MAX_ACCEL : 0;
      this.speed += this.accel*dt;
      if (this.speed < 2 && this.accel < 2)
        this.speed = 0;
      this.addPos(Math.sin(this.angle)*this.speed*dt, -Math.cos(this.angle)*this.speed*dt);
      this.addAngle((this.inputs.right)? ANGULAR_VEL*dt : 0);
      this.addAngle((this.inputs.left)? -1*ANGULAR_VEL*dt : 0);
    }
  
    //////////////////////////////////////////////////////////////////////////////
    takeDamage (delta, mod) {
      this.invul_time += delta;
      if (this.invul_time % (mod * delta) == 0) {
        this.life--;
        this.invul_time = delta;
      }
    }
  };