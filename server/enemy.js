const {Circle, Polygon} = require('./collisions/Collisions.mjs');
const Bullet = require('./bullet.js');
const aux = require('./_aux.js');

const MAX_ACCEL = 100;
const DRAG_CONST = 0.1;
const ANGULAR_VEL = 1;
const DRAG_POWER = 1.5;
const BULLET_COOLDOWN = 1500; // ms



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
      this.poly = new Polygon(this.x, this.y, [
        [-9, -38],
        [1, -38],
        [11, -13],
        [35, 1],
        [48, -7],
        [43, 21],
        [13, 26],
        [6, 36],
        [-8, 36],
        [-16, 26],
        [-45, 21],
        [-50, -7],
        [-37, 1],
        [-13, -13]
      ]);
      this.agro = new Circle(this.x, this.y, 600);
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
      var playersToConsider = [];
      var bullets = [];
      for (const k in playerList) {
        let p = playerList[k];
        if (p.poly.collides(this.agro)) {
          playersToConsider.push(p);
        }
      }
      if (playersToConsider.length > 0) {
        let player_index = Math.floor(Math.random() * playersToConsider.length);
        this.aproach_target(playersToConsider[player_index]);
        bullets = this.attack_target(playersToConsider[player_index]);
      }
      else {
        this.random_move();
      }
      return bullets;
    }

    allign_with(target) {
      var del_x = this.x - target.x;
      var del_y = this.y - target.y;
      var theta = Math.atan2(del_y, del_x);
      return theta - Math.PI/2;
    }

    random_move() {
      this.addAngle(Math.PI / 72);
      this.addPos(Math.sin(this.angle)*4, -Math.cos(this.angle)*4);
      return;
    }

    aproach_target(target) {
      var alligned_angle = this.allign_with(target);
      this.addAngle((alligned_angle - this.angle) / 10);
      this.addPos(Math.sin(this.angle)*4, -Math.cos(this.angle)*4);
      return;
    }

    attack_target(target) {
      if (aux.distSq(target, this) < 400*400) {
        let bullets = this.tryToShoot();
        return bullets;
      }
      return [];
    }

    //////////////////////////////////////////////////////////////////////////////
    /**
     * Attempts to shoot a bullet in the provided direction  taking  into  account
     * the last time it shot in the same direction.
     * @returns {Bullet} The bullet just created, or null if it can not shoot
     */
    tryToShoot () {
      let canShoot = false;
      if (this.canShoot()) {
          canShoot = true;
          this.lastShootTime = Date.now();
      }
      if (canShoot) {
        console.log(`Blob SHOOT!`);
        let [offx1, offy1] = aux.rotate(this.angle, 20, -10);
        let [offx2, offy2] = aux.rotate(this.angle, -20, -10);

        let bullets = [ new Bullet(this.x + offx1, this.y + offy1, this.angle, this.id, 1000),
                        new Bullet(this.x + offx2, this.y + offy2, this.angle, this.id, 1000)];
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
      this.poly.angle = this.angle;
    }

    //////////////////////////////////////////////////////////////////////////////
    addPos (x, y) {
      this.x += x;
      this.y += y;
      this.poly.x = this.x;
      this.poly.y = this.y;
    }

    //////////////////////////////////////////////////////////////////////////////
    setPos (x, y) {
      this.x = x;
      this.y = y;
      this.poly.x = this.x;
      this.poly.y = this.y;
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
