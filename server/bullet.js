////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                              Server - Bullet                               //
////////////////////////////////////////////////////////////////////////////////

const {Circle, Polygon} = require('./collisions/Collisions.mjs');
const unique = require('node-uuid');

////////////////////////////////////////////////////////////////////////////////
// Box                                                                        //
////////////////////////////////////////////////////////////////////////////////
module.exports = class Bullet {
  constructor (/** Number */ startX, /** Number */ startY,
               /** Number */ angle, /** Player ID */ creator, /** Number */ speed) {
    this.x = startX;
    this.y = startY;
    this.angle = angle;
    this.speed = speed;
    this.creator = creator;
    this.timeCreated = Date.now();
    this.poly = new Polygon(this.x, this.y, [
      [0, -26],
      [0, 26]
    ]);
    this.id = unique.v4();
  }

  //////////////////////////////////////////////////////////////////////////////
  addPos (x, y) {
    this.x += x;
    this.y += y;
    this.poly.x = this.x;
    this.poly.y = this.y;
  }

  //////////////////////////////////////////////////////////////////////////////
  updatePos (dt) {
    this.addPos(Math.sin(this.angle) * this.speed * dt, -Math.cos(this.angle) * this.speed * dt);
    this.poly.angle = this.angle;
  }
}

////////////////////////////////////////////////////////////////////////////////
