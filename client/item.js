////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                              Client - Items                              //
////////////////////////////////////////////////////////////////////////////////

var boxList = {}; // The box list
var bulletList = {}; // Bullets list
var islandList = {}; // Islands list
var asteroidList = {}; // Asteroids list
var DebrisFieldList = {};

class EBall {
  constructor(scene, id, creator, x, y, angle, speed, radius, spawnToleranceRadius) {
    this.id = id;
    this.creator = creator;
    this.item = scene.physics.add.image(x, y, "EBall");
    this.sizeX = 64;
    this.sizeY = 64;
    this.speed = speed;
    this.radius = radius;
    this.item.setDisplaySize(this.sizeX, this.sizeY);
    this.item.setAngle(angle * 180 / Math.PI);
    this.item.par_obj = this; // Just to associate this id with the image
    this.colpoly = new CircleShape(scene, x, y, radius);
    this.spawnToleranceShape = new CircleShape(scene, x, y, spawnToleranceRadius, {stroke: true, color: SPAWN_INFLUENCE_COLOR, alpha: 1});
  }

  update (data) {
    this.colpoly.update(data.x, data.y);
    this.spawnToleranceShape.update(data.x, data.y);
    this.item.setPosition(data.x, data.y);
    this.item.setVelocity(Math.sin(data.angle)*this.speed, -(Math.cos(data.angle)*this.speed));
    this.item.setDepth(data.y);
  }

  destroy () {
    this.item.destroy();
    this.colpoly.destroy();
    this.spawnToleranceShape.destroy();
  }
}

////////////////////////////////////////////////////////////////////////////////
// Bullet                                                                     //
////////////////////////////////////////////////////////////////////////////////
// Client bullet class
class Bullet {
  constructor (scene, id, creator, x, y, angle, speed, polygonPoints, spawnToleranceRadius) {
    this.sizeX = 9;
    this.sizeY = 54;
    this.creator = creator;
    this.id = id;
    this.speed = speed;
    this.item = scene.physics.add.image(x, y, "bullet");
    this.item.setDisplaySize(this.sizeX, this.sizeY);
    this.item.setAngle(angle * 180 / Math.PI);
    this.item.par_obj = this; // Just to associate this id with the image
    this.colpoly = new PolygonShape(scene, x, y, polygonPoints);
    this.spawnToleranceShape = new CircleShape(scene, x, y, spawnToleranceRadius, {stroke: true, color: SPAWN_INFLUENCE_COLOR, alpha: 1});
  }

  update (data) {
    this.colpoly.update(data.x, data.y);
    this.spawnToleranceShape.update(data.x, data.y);
    this.item.setPosition(data.x, data.y);
    this.item.setVelocity(Math.sin(data.angle)*this.speed, -(Math.cos(data.angle)*this.speed));
    this.item.setDepth(data.y);
  }

  destroy () {
    this.item.destroy();
    this.colpoly.destroy();
    this.spawnToleranceShape.destroy();
  }
};


////////////////////////////////////////////////////////////////////////////////
// Box                                                                        //
////////////////////////////////////////////////////////////////////////////////
// Client box class
class Box {
  constructor (scene, id, x, y, radius, spawnToleranceRadius) {
    this.sizeX = 32;
    this.sizeY = 40;
    this.id = id;
    this.item = scene.add.image(x, y, "barrel");
    this.item.setDisplaySize(this.sizeX, this.sizeY);
    this.item.setSize(this.sizeX, this.sizeY);
    this.item.setScale(0.75);
    this.item.par_obj = this; // Just to associate this id with the image
    this.colShape = new CircleShape(scene, x, y, radius);
    this.spawnToleranceShape = new CircleShape(scene, x, y, spawnToleranceRadius, {stroke: true, color: SPAWN_INFLUENCE_COLOR, alpha: 1});
  }

  destroy () {
    this.item.destroy();
    this.spawnToleranceShape.destroy();
    this.colShape.destroy();
  }
};

////////////////////////////////////////////////////////////////////////////////
// Island                                                                        //
////////////////////////////////////////////////////////////////////////////////
// Client Island class
class Island {
  constructor (scene, id, x, y, radius, spawnToleranceRadius) {
    this.sizeX = 159;
    this.sizeY = 159;
    this.id = id;
    this.island = scene.add.image(x, y, "station");
    this.island.setDisplaySize(this.sizeX, this.sizeY);
    this.island.setSize(this.sizeX, this.sizeY);
    this.island.setScale(0.95);
    this.island.par_obj = this; // Just to associate this id with the image
    this.colShape = new CircleShape(scene, x, y, radius);
    this.influenceShape = new CircleShape(scene, x, y, 2*radius, {stroke: true, color: 0x0000b2, alpha: 1})
    this.spawnToleranceShape = new CircleShape(scene, x, y, spawnToleranceRadius, {stroke: true, color: SPAWN_INFLUENCE_COLOR, alpha: 1});
  }

  destroy () {
    this.island.destroy();
    this.colShape.destroy();
    this.influenceShape.destroy();
    this.spawnToleranceRadius.destroy();
  }
};

////////////////////////////////////////////////////////////////////////////////
// Asteroid                                                                   //
////////////////////////////////////////////////////////////////////////////////
// Client asteroid class
class Asteroid {
  constructor (scene, id, x, y, polygonPoints, spawnToleranceRadius) {
    this.sizeX = 151;
    this.sizeY = 127;
    this.scale = 0.7;
    this.id = id;
    this.asteroid = scene.add.image(x, y, "asteroid");
    this.asteroid.setDisplaySize(this.sizeX, this.sizeY);
    this.asteroid.setSize(this.sizeX, this.sizeY);
    this.asteroid.setScale(this.scale);
    this.asteroid.par_obj = this; // Just to associate this id with the image
    this.colpoly = new PolygonShape(scene, x, y, this.scale, polygonPoints);
    this.spawnToleranceShape = new CircleShape(scene, x, y, spawnToleranceRadius, {stroke: true, color: SPAWN_INFLUENCE_COLOR, alpha: 1});
  }

  destroy () {
    this.colpoly.destroy();
    this.asteroid.destroy();
    this.spawnToleranceShape.destroy();
  }
};

class DebrisField {
  constructor (scene, center_x, center_y, radius, id) {
    this.id = id;
    this.debris_field = scene.add.graphics();
    let color = 0xff0000;
    let thickness = 4;
    let alpha = 1;
    let smoothness = 64;
    this.debris_field.lineStyle(thickness, color, alpha);
    let a = new Phaser.Geom.Point(center_x, center_y);
    this.debris_field.strokeEllipse(a.x, a.y, radius*2, radius*2, smoothness);
    this.debris_field.par_obj = this; // Just to associate this id with the image
  }

  destroy () {
    this.debris_field.destroy();
  }
};

////////////////////////////////////////////////////////////////////////////////
// Explosion                                                                  //
////////////////////////////////////////////////////////////////////////////////
// Client-only explosion class
class Explosion {
  constructor (scene, x, y, scale, attack, decay) {
    this.sizeX = 100*scale;
    this.sizeY = 100*scale;
    this.explosion = scene.add.image(x, y, "explosion").setAlpha(0);
    this.explosion.setDepth(5100);
    this.explosion.setDisplaySize(this.sizeX, this.sizeY);
    this.explosion.setSize(this.sizeX, this.sizeY);

    this.tween = scene.tweens.add({
      targets: this.explosion,
      paused: false,
      delay: 0,
      duration: attack,
      ease: "Sine.easeInOut",
      alpha: {
        getStart: () => 0,
        getEnd: () => 1
      },
      onComplete: () => {
        scene.tweens.add({
          targets: this.explosion,
          paused: false,
          delay: 0,
          duration: decay,
          ease: "Sine.easeInOut",
          alpha: {
            getStart: () => 1,
            getEnd: () => 0
          },
          onComplete: () => {
            this.destroy();
          }
        });
      }
    });
  }

  destroy () {
    this.explosion.destroy();
  }
};

// Function called when new box is added at the server.
function onCreateItem (data) {
  if (!(data.id in boxList)) {
    let newBox = new Box(this, data.id, data.x, data.y, data.radius, data.spawnToleranceRadius);
    boxList[data.id] = newBox;
  }
}

// Function called when box needs to be removed at the client.
function onItemRemove (data) {
  if (!(data.id in boxList)) {
    console.log("Could not find box to remove");
    return;
  }
  //destroy the phaser object
  boxList[data.id].destroy();
  delete boxList[data.id];
}

// Function called when new island is added at the server.
function onCreateIsland (data) {
  if (!(data.id in islandList)) {
    console.log(`Creating island ${data.id}`);
    let newIsland = new Island(this, data.id, data.x, data.y, data.radius, data.spawnToleranceRadius);
    islandList[data.id] = newIsland;
  }
}

function onCreatedebrisField (data) {
  console.log(`Creating Debris Field ${data.id}`);
  let newDebrisField = new DebrisField(this, data.center_x, data.center_y, data.radius, data.id);
  DebrisFieldList[data.id] = newDebrisField;
}

////////////////////////////////////////////////////////////////////////////////
// Function called when new asteroid is added at the server.
function onCreateAsteroid (data) {
  if (!(data.id in asteroidList)) {
    console.log(`Creating asteroid ${data.id}`);
    let newAsteroid = new Asteroid(this, data.id, data.x, data.y, data.polygonPoints, data.spawnToleranceRadius);
    asteroidList[data.id] = newAsteroid;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Function called when asteroid needs to be removed at the client.
function onRemoveAsteroid (data) {
  let asteroidExplosion = new Explosion(this, data.x, data.y, 1.2, 50, 450);
  var removeAsteroid = asteroidList[data.id];

  removeAsteroid.destroy();
  delete asteroidList[data.id];
}

function onCreateEBall (data) {
  if (!(data.id in bulletList)) {
    let newBall = new EBall(this, data.id, data.creator, data.x, data.y, data.angle, data.speed, data.radius, data.spawnToleranceRadius);
    bulletList[data.id] = newBall; //nem sei se isso é bom
  }
}

////////////////////////////////////////////////////////////////////////////////
// Function called when new bullet is added at the server.
function onCreateBullet (data) {
  if (!(data.id in bulletList)) {
    let newBullet = new Bullet(this, data.id, data.creator, data.x, data.y, data.angle, data.speed, data.polygonPoints, data.spawnToleranceRadius);
    bulletList[data.id] = newBullet;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Function called when bullet needs to be removed at the client.
function onBulletRemove (data) {
  if (!(data.id in bulletList)) {
    console.log("Could not find bullet to remove");
    return;
  }
  //destroy the phaser object
  bulletList[data.id].destroy();
  delete bulletList[data.id];
}

function onHit (data) {
  let playerExplosion = new Explosion(this, data.x, data.y, 0.8, 30, 380);
}

////////////////////////////////////////////////////////////////////////////////
