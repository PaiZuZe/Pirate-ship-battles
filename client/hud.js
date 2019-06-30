////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                                Client - HUD                                //
////////////////////////////////////////////////////////////////////////////////

var hud = null;
var scoreBoard;

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
    this.sAmmo = this.scene.add.text(56, 120, `Secondary ammo: `, {color: "white", fontSize: 32, strokeThickness: 2});
    this.timer = this.scene.add.text(56, 160, 'Timer', {color: "white", fontSize: 32, strokeThickness: 2})
    this.scoreBoard = this.scene.add.text(32, 250, 'ScoreBoard', {backgroundColor: null, fill: '#FFFFFF', fontSize: '24px',});
    
    this.health.setScrollFactor(0).setDepth(5000);
    this.fuel.setScrollFactor(0).setDepth(5000);
    this.sAmmo.setScrollFactor(0).setDepth(5000);
    this.timer.setScrollFactor(0).setDepth(5000);
    this.scoreBoard.setScrollFactor(0).setDepth(5000);
  }

  //////////////////////////////////////////////////////////////////////////////
  update () {
    this.health.setText(`🛠 ${player.life}`);
    this.fuel.setText(`⛽ ${player.fuel}`);
    this.sAmmo.setText(`Secondary ammo: ${player.secondaryAmmo}`);

    if (scoreBoard) {
      var text = "SCOREBOARD\n";
      for (const i in scoreBoard) {
        text += "\n" + i + ": " + scoreBoard[i];
      }
      this.scoreBoard.setText(text);
    }

    if (0 < player.anchored_timer && player.anchored_timer < 180) {
      this.timer.visible = true;
      this.timer.setText("Refill: " + Math.round(100*player.anchored_timer/180) + "%");
    } else {
      this.timer.visible = false;
    }
  }

  getGameObjects () {
    let objs = [];
    objs.push(this.health, this.fuel, this.sAmmo, this.timer, this.scoreBoard);
    return objs;
  }

  destroy () {
    this.health.destroy();
    this.fuel.destroy();
    this.sAmmo.destroy();
  }
}