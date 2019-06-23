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
        this.shape = scene.add.polygon(x, y, polygonPoints, COLOR, ALPHA); 
        this.shape.setOrigin(0, 0);
        this.shape.setDepth(SHAPE_DEPTH);
    }
    // angles in degrees
    update (x, y, angle) {
        this.shape.setAngle(angle);
        this.shape.setPosition(x, y);
    }

    destroy() {
        this.shape.destroy();
    }
}

class CircleShape {
    constructor (scene, x, y, radius) {
        let circle = new Phaser.Geom.Circle(x, y, radius);
        this.shape = scene.add.graphics();
        this.shape.fillStyle(COLOR, ALPHA);   
        this.shape.fillCircleShape(circle);
        this.shape.setDepth(SHAPE_DEPTH);
    }

    destroy() {
        this.shape.clear();
        this.shape.destroy();
    }
}