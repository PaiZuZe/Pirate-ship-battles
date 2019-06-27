////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                                Client - HUD                                //
////////////////////////////////////////////////////////////////////////////////

var hud = null;
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
    /*
    this.bulletImage = this.scene.add.image(70, 150, "big_bullet");
    this.bulletImage.setScrollFactor(0).setDepth(5000);
    this.bullets = this.scene.add.text(100, 135, `Infinity`, {color: "white", fontSize: 25, strokeThickness: 2});
    this.bullets.setScrollFactor(0).setDepth(5000);
    */

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
      for (const i in scoreBoard) {
        text += "\n" + i + ": " + scoreBoard[i];
      }
      this.scoreBoard.setText(text);
    }

    // Update timer, not working at this moment :(
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
  getGameObjects () {
    let objs = [];
    //objs.push(this.health, this.fuel, this.bulletImage, this.bullets, this.scoreBoard);
    objs.push(this.health, this.fuel, this.scoreBoard);
    return objs;
  }

  //////////////////////////////////////////////////////////////////////////////
  destroy () {
    this.health.destroy();
    this.fuel.destroy();
    //this.bulletImage.destroy();
    //this.bullets.destroy();
    if (this.mobileMode) {
      this.baseController.destroy();
      this.topController.destroy();
      this.rightShotController.destroy();
      this.leftShotController.destroy();
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
