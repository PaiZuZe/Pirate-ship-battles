////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                               Server - Stone                               //
////////////////////////////////////////////////////////////////////////////////


const {Circle, Polygon} = require('./collisions/Collisions.mjs');
const unique = require('node-uuid');

module.exports = class Stone {
  constructor (x, y, max_x, max_y) {
    try {
      if (x < 0 || x >= max_x) throw "x must be non-negative or smaller than max_x";
      if (y < 0 || y >= max_y) throw "y must be non-negative or smaller than max_y";

      this.x = x;
      this.y = y;
      this.hp = 7;
      this.id = unique.v4();
      this.collision_poly = new Polygon(this.x, this.y, [
        [-34, -41],
        [24, -41],
        [50, -2],
        [34, 31],
        [10, 27],
        [-22, 40],
        [-50, 9],
      ]);
    } catch(err) {
      console.log("Stone constructor: " + err);
    }
  }
}
