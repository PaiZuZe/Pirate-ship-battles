////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                           Client - CollisionShape                          //
////////////////////////////////////////////////////////////////////////////////

const SHAPE_DEPTH = 100000;
const COLOR = 0xff0000;
const ALPHA = 0.5;
const LINE_WIDTH = 2;

class PolygonShape {
  constructor (scene, x, y, polygonPoints) {
    if (DEBUG) {
      this.shape = scene.add.polygon(x, y, polygonPoints, COLOR, ALPHA); 
      this.shape.setOrigin(0, 0);
      this.shape.setDepth(SHAPE_DEPTH);
    }
  }
  // angles in degrees
  update (x, y, angle) {
    if (DEBUG) {
      this.shape.setAngle(angle);
      this.shape.setPosition(x, y);
    }
  }

  destroy() {
    if (DEBUG) {
      this.shape.destroy();
    }
  }
}

// Fillstyle is an optional argument.
// Fillstyle consists of a dictionary containing {fill:, color: hex color code, alpha: number}
// If fillstyle.stroke = false it doesn't stroke.
class CircleShape {
  constructor (scene, x, y, radius, fillStyle) {
    if (DEBUG) {
      this.fillStyle = fillStyle;
      this.radius = radius;
      this.shape = scene.add.graphics();
      this.drawCircle(x, y, radius, fillStyle);
    }
  }

  drawCircle(x, y, radius, fillStyle) {
    this.shape.setDepth(SHAPE_DEPTH);
    if (fillStyle == undefined) {
      this.shape.fillStyle(COLOR, ALPHA);
    } 
    else {
      if (fillStyle.stroke == true) {
        this.fillStyle = fillStyle;
        this.shape.lineStyle(LINE_WIDTH, fillStyle.color, fillStyle.alpha);
        this.shape.strokeCircle(x, y, radius);
        return;
      }
      this.shape.fillStyle(fillStyle.color, fillStyle.alpha);
    }
    this.shape.fillCircleShape(new Phaser.Geom.Circle(x, y, radius));
  }

  update(x, y) {
    if (DEBUG) {
      this.shape.clear();
      this.drawCircle(x, y, this.radius, this.fillStyle);
    }
  }

  destroy() {
    if (DEBUG) {
      this.shape.clear();
      this.shape.destroy();
    }
  }
}