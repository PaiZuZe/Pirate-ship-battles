////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                           Client - CollisionShape                          //
////////////////////////////////////////////////////////////////////////////////

const SHAPE_DEPTH = 100000;
const COLOR = 0xff0000;
const ALPHA = 0.5;
const LINE_WIDTH = 10;

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

// Fillstyle is an optional argument.
// Fillstyle consists of a dictionary containing {fill:, color: hex color code, alpha: number}
// If fillstyle.stroke = false it doesn't stroke.
class CircleShape {
  constructor (scene, x, y, radius, fillStyle) {
    let fill = true;
    let circle = new Phaser.Geom.Circle(x, y, radius);
    this.shape = scene.add.graphics();
    this.shape.setDepth(SHAPE_DEPTH);
    if (fillStyle == undefined) {
      this.shape.fillStyle(COLOR, ALPHA);
      this.shape.fillCircleShape(circle);
      //this.shape.lineStyle(4, 0xffff00, 1);
      //this.shape.strokeCircle(circle);
    } 
    else {
      if (fillStyle.stroke == true) {
        this.shape.lineStyle(LINE_WIDTH, fillStyle.color, fillStyle.alpha);
        this.shape.strokeCircle(circle);
        this.fill = false;
      }
      //this.shape.fillStyle(fillStyle.color, fillStyle.alpha);
      //this.shape.fillCircleShape(circle);
    }
  }

  destroy() {
    this.shape.clear();
    this.shape.destroy();
  }
}