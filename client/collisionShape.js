////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                           Client - CollisionShape                          //
////////////////////////////////////////////////////////////////////////////////

const SHAPE_DEPTH = 100000;
const COLOR = 0xff0000;
const ALPHA = 0.5;

class PolygonShape {
    constructor (scene, x, y, polygonPoints) {
        this.poly = scene.add.polygon(x, y, polygonPoints, COLOR, ALPHA); 
        this.poly.setOrigin(0, 0);
        this.poly.setDepth(SHAPE_DEPTH);
    }
    // angles in degrees
    update (x, y, angle) {
        this.poly.setAngle(angle);
        this.poly.setPosition(x, y);
    }

    destroy() {
        this.poly.destroy();
    }
}