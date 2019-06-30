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
  constructor (scene, x, y, scale, polygonPoints, spawnToleranceRadius) {
    // If debug mode active
    this.colPoly = new PolygonShape(scene, x, y, scale, polygonPoints);
    this.spawnToleranceShape = new CircleShape(scene, x, y, spawnToleranceRadius, {stroke: true, color: SPAWN_INFLUENCE_COLOR, alpha: 1});
  }

  update (data) {
    // Update player collision shape. (DEBUG ONLY)
    this.colPoly.update(data.x, data.y, radiansToDegrees(data.angle));
    this.spawnToleranceShape.update(data.x, data.y);
    // Update player sprite
    this.body.setPosition(data.x, data.y);
    this.body.setVelocity(Math.sin(data.angle) * data.speed, -(Math.cos(data.angle) * data.speed));
    this.body.setAngle(radiansToDegrees(data.angle));
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
    this.colPoly.destroy();
    this.spawnToleranceShape.destroy();
  }
}

////////////////////////////////////////////////////////////////////////////////
// Player                                                                     //
////////////////////////////////////////////////////////////////////////////////
class Player extends Ship {
  constructor (scene, x, y, username, shipname, spawnToleranceRadius, secondaryAmmo) {
    super(scene, x, y, SHIPDATA[shipname].scale, SHIPDATA[shipname].poly, spawnToleranceRadius);
    this.text = scene.add.text(x, y - LABEL_DIFF, username, {fill: "white"});
    this.anchored_timer = 0;
    this.secondaryAmmo = secondaryAmmo;
    this.body = scene.physics.add.sprite(x, y, shipname, 0).setScale(SHIPDATA[shipname].scale);
    //this.collisionShape = scene.physics.add.graphics();
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
    this.secondaryAmmo = data.secondaryAmmo;
    return;
  }
};

function createPlayer (data) {
  if (!player) {
    player = new Player(this, data.x, data.y, data.username, data.shipname, data.spawnToleranceRadius, data.secondaryAmmo);
    hud = new HUD(this);
  }
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
  constructor (scene, id, x, y, username, shipname, spawnToleranceRadius) {
    super(scene, x, y, SHIPDATA[shipname].scale, SHIPDATA[shipname].poly, spawnToleranceRadius);
    this.id = id;
    this.text = scene.add.text(x, y - LABEL_DIFF, username, {fill: "darkGray"});
    this.body = scene.physics.add.sprite(x, y, shipname, 0).setScale(SHIPDATA[shipname].scale);
    this.text.setOrigin(0.5);
    this.body.setOrigin(0.5);
    this.body.setCircle(1, 16, 32);
  }
};

function createEnemy (data) {
  if (!(data.id in enemies))
    enemies[data.id] = new Enemy(this, data.id, data.x, data.y, data.username, data.shipname, data.spawnToleranceRadius);
  else
    console.log("Failed to create enemy");
}
