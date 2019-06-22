////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                              Client - Players                              //
////////////////////////////////////////////////////////////////////////////////

var enemies = {};
var player = null;
const LABEL_DIFF = 70;

////////////////////////////////////////////////////////////////////////////////
// Ship                                                                       //
////////////////////////////////////////////////////////////////////////////////
class Ship {
  constructor (scene, x, y, polygonPoints) {
    // If debug mode active
    // Todo: Make generic function in util.js
    let color = 0xff0000
    let alpha = 0.5;
    this.colpoly = scene.add.polygon(x, y, polygonPoints, color, alpha); 
    this.colpoly.setOrigin(0, 0);
    this.colpoly.setDepth(100000);    
  }

  update (data) {
    let angle = data.angle * 180 / Math.PI;
    // Update player collision shape. (DEBUG ONLY)
    this.colpoly.setPosition(data.x, data.y);
    this.colpoly.setAngle(angle);
    // Update player sprite
    this.body.setPosition(data.x, data.y);
    this.body.setVelocity(Math.sin(data.angle) * data.speed, -(Math.cos(data.angle) * data.speed));
    this.body.setAngle(angle);
    this.body.setDepth(data.y);
    this.text.setDepth(data.y);
  }

  updatePredictive (delta) {
    this.text.setPosition(this.body.x, this.body.y - LABEL_DIFF);
    this.text.setDepth(this.body.y);
  }

  destroy() {
    this.body.destroy();
    this.text.destroy();
    this.colpoly.destroy();
  }
}

////////////////////////////////////////////////////////////////////////////////
// Player                                                                     //
////////////////////////////////////////////////////////////////////////////////
class Player extends Ship {
  constructor (scene, x, y, username, shipname, polygonPoints) {
    super(scene, x, y, polygonPoints);
    this.text = scene.add.text(x, y - LABEL_DIFF, username, {fill: "white"});
    this.anchored_timer = 0;
    let sprite = "";
    if (shipname == "Blastbeat") {
        sprite = "ship";
    }
    else if (shipname == "Blindside") {
        sprite = "ship-alt";
    }
    this.body = scene.physics.add.sprite(x, y, sprite, 0);
    this.text.setOrigin(0.5);
    this.body.setOrigin(0.5);
    this.body.setCircle(1, 16, 32);
    scene.cameras.main.startFollow(this.body);
  }

  update (data) {
    super.update(data);
    this.life = data.life;
    this.fuel = data.fuel;
    this.anchored_timer = data.anchored_timer;
  }
};

function createPlayer (data) {
  if (!player) {
    player = new Player(this, data.x, data.y, data.username, data.shipname, data.polygonPoints);
    hud = new HUD(this);
  }
}

function onPlayerHit (data) {
  let playerExplosion = new Explosion(this, data.x, data.y, 0.8, 30, 380);
}

function onRemovePlayer (data) {
	if (data.id in enemies) {
    let playerExplosion = new Explosion(this, data.x, data.y, 1.2, 50, 450);
		var removePlayer = enemies[data.id];
		removePlayer.destroy();
		delete enemies[data.id];
		return;
	}
	if (data.id == socket.id) {
    resetObjects();
    this.disableInputs();
    game.scene.stop('Main');
		game.scene.start('Login');
		return;
	}
  console.log('Tried to remove: Player not found: ', data.id);
  return;
}

////////////////////////////////////////////////////////////////////////////////
// Enemy                                                                      //
////////////////////////////////////////////////////////////////////////////////
class Enemy extends Ship {
  constructor (scene, id, x, y, username, shipname, polygonPoints) {
    super(scene, x, y, polygonPoints);
    this.id = id;
    this.text = scene.add.text(x, y - LABEL_DIFF, username, {fill: "darkGray"});
    let sprite = "";
    if (shipname == "Blastbeat") {
        sprite = "ship";
    }
    else if (shipname == "Blindside") {
        sprite = "ship-alt";
    }
    this.body = scene.physics.add.sprite(x, y, sprite, 0);
    this.text.setOrigin(0.5);
    this.body.setOrigin(0.5);
    this.body.setCircle(1, 16, 32);
  }
};

function createEnemy (data) {
  if (!(data.id in enemies))
    enemies[data.id] = new Enemy(this, data.id, data.x, data.y, data.username, data.shipname, data.polygonPoints);
  else
    console.log("Failed to create enemy");
}
