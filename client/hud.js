////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                                Client - HUD                                //
////////////////////////////////////////////////////////////////////////////////

var hud = null;
const DBHT = 500; // ms  // Double bullet hold time
const TBHT = 1000; // ms  // Triple bullet hold time
const BULLET_COOLDOWN = 1000; // ms
var scoreBoard;

////////////////////////////////////////////////////////////////////////////////
// HUD                                                                        //
////////////////////////////////////////////////////////////////////////////////
class HUD {
  constructor (scene) {
    if (config.width < config.height) {
      this.JS_ALL_SCALE = config.width / 540;
    }
    else {
      this.JS_ALL_SCALE = config.height / 540;
    }
    this.scene = scene;
    this.JS_MARGIN = 120 * this.JS_ALL_SCALE;
    this.JS_RAD = 75;
    this.JS_X = this.JS_MARGIN;
    this.JS_Y = config.height - this.JS_X;
    this.JS_SHOT_RAD = 50;
    this.JS_SHOT_Y = config.height - this.JS_MARGIN;
    this.JS_SHOT_RIGHT_X = config.width * 0.85;
    this.JS_SHOT_LEFT_X = this.JS_SHOT_RIGHT_X - (125 * this.JS_ALL_SCALE);
    this.BULLET_FILL_X = 30 * this.JS_ALL_SCALE;
    this.BULLET_FILL_Y = 70 * this.JS_ALL_SCALE;
    this.health = this.scene.add.text(56, 36, `🛠`, {color: "white", fontSize: 32, strokeThickness: 2});
    this.fuel = this.scene.add.text(56, 79, `⛽`, {color: "white", fontSize: 32, strokeThickness: 2});

    this.health.setScrollFactor(0).setDepth(5000);
    this.fuel.setScrollFactor(0).setDepth(5000);
    this.bulletImage = this.scene.add.image(70, 150, "big_bullet");
    this.bulletImage.setScrollFactor(0).setDepth(5000);
    this.bullets = this.scene.add.text(100, 135, `Infinity`, {color: "white", fontSize: 25, strokeThickness: 2});
    this.bullets.setScrollFactor(0).setDepth(5000);

    // Score Board
    this.scoreBoard = this.scene.add.text(32, 250, 'ScoreBoard', {
      backgroundColor: null,
      fill: '#FFFFFF',
      fontSize: '24px',
    }).setScrollFactor(0).setDepth(5000);

    // Timer
    this.timer = this.scene.add.text(0, 0, 'Timer', {
      backgroundColor: '#009696',
      fill: '#FFFFFF',
      fontSize: '32px'
    }).setDepth(5000);

  }

  //////////////////////////////////////////////////////////////////////////////
  update () {
    // Update bullets
    //this.bullets.setText(`${player.bullets}`);

    // Update life bar
    this.health.setText(`🛠 ${player.life}`);
    this.fuel.setText(`⛽ ${player.fuel}`);

    // Update score board
    if (scoreBoard) {
      var text = "SCOREBOARD\n";
      for (const i in scoreBoard.score_list) {
        text += "\n" + scoreBoard.username_list[i] + ": " + scoreBoard.score_list[i];
      }
      this.scoreBoard.setText(text);
    }

    // Update timer
    if (0 < player.anchored_timer && player.anchored_timer < 180) {
      this.timer.visible = true;
      this.timer.x = player.body.x;
      this.timer.y = player.body.y;
      this.timer.setText(Math.round(100*player.anchored_timer/180) + "%");
    } else {
      this.timer.visible = false;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  getJSFeatures () {
    if (!this.mobileMode)
      return [false, false, false, false, false];
    let shootLeft = false;
    let shootRight = false;
    let nearest = argMax(this.pointers, (p) => -normSq(p.x - this.JS_SHOT_RIGHT_X, p.y - this.JS_SHOT_Y));
    if (nearest.isDown) {
      let dist = norm(nearest.x - this.JS_SHOT_RIGHT_X, nearest.y - this.JS_SHOT_Y);
      shootRight = (dist < this.JS_SHOT_RAD);
    }
    nearest = argMax(this.pointers, (p) => -normSq(p.x - this.JS_SHOT_LEFT_X, p.y - this.JS_SHOT_Y));
    if (nearest.isDown) {
      let dist = norm(nearest.x - this.JS_SHOT_LEFT_X, nearest.y - this.JS_SHOT_Y);
      shootLeft = (dist < this.JS_SHOT_RAD);
    }
    let x = this.topController.x - this.JS_X;
    let y = this.topController.y - this.JS_Y;
    if (x == 0 && y == 0)
      return [false, false, false, shootLeft, shootRight];
    let angle = fmod(Math.atan2(y, x), 2*Math.PI);
    let pAngle = fmod(player.body.body.angle, 2*Math.PI);
    let left = false;
    let right = false;
    if ((angle > pAngle && angle - pAngle < Math.PI && angle - pAngle > 0.05) ||
        (angle < pAngle && pAngle - angle > Math.PI && pAngle - angle < 2*Math.PI - 0.05))
      left = true;
    if ((angle > pAngle && angle - pAngle > Math.PI && angle - pAngle > 0.05) ||
        (angle < pAngle && pAngle - angle < Math.PI && pAngle - angle < 2*Math.PI - 0.05))
      right = true;
    return [true, right, left, shootLeft, shootRight];
  }

  //////////////////////////////////////////////////////////////////////////////
  getGameObjects () {
    let objs = [];
    objs.push(this.health, this.fuel, this.bulletImage, this.bullets, this.scoreBoard);
    return objs;
  }

  //////////////////////////////////////////////////////////////////////////////
  destroy () {
    this.health.destroy();
    this.fuel.destroy();
    this.bulletImage.destroy();
    this.bullets.destroy();
    if (this.mobileMode) {
      this.baseController.destroy();
      this.topController.destroy();
      this.rightShotController.destroy();
      this.leftShotController.destroy();
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
