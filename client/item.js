////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                              Client - Players                              //
////////////////////////////////////////////////////////////////////////////////

var boxList = {}; // The box list
var bulletList = {}; // Bullets list
var islandList = {}; // Islands list
var stoneList = {}; // Stones list


////////////////////////////////////////////////////////////////////////////////
// Bullet                                                                     //
////////////////////////////////////////////////////////////////////////////////
// Client bullet class
class Bullet {
  constructor (scene, id, creator, x, y, angle, speed) {
    this.sizeX = 9;
    this.sizeY = 54;
    this.creator = creator;
    this.id = id;
    this.speed = speed;
    this.item = scene.physics.add.image(x, y, "bullet");
    this.item.setDisplaySize(this.sizeX, this.sizeY);
    this.item.setAngle(angle * 180 / Math.PI);
    this.item.par_obj = this; // Just to associate this id with the image
  }

  //////////////////////////////////////////////////////////////////////////////
  update (data) {
    this.item.x = data.x;
    this.item.y = data.y;
    this.item.setVelocity(Math.sin(data.angle)*this.speed, -(Math.cos(data.angle)*this.speed));
    this.item.setDepth(data.y);

  }

  //////////////////////////////////////////////////////////////////////////////
  destroy () {
    this.item.destroy();
  }
};


////////////////////////////////////////////////////////////////////////////////
// Box                                                                        //
////////////////////////////////////////////////////////////////////////////////
// Client box class
class Box {
  constructor (scene, id, x, y) {
    this.sizeX = 20;
    this.sizeY = 20;
    this.id = id;
    this.item = scene.add.image(x, y, "barrel");
    this.item.setDisplaySize(this.sizeX, this.sizeY);
    this.item.setSize(this.sizeX, this.sizeY);
    this.item.par_obj = this; // Just to associate this id with the image
  }

  //////////////////////////////////////////////////////////////////////////////
  destroy () {
    this.item.destroy();
  }
};

////////////////////////////////////////////////////////////////////////////////
// Island                                                                        //
////////////////////////////////////////////////////////////////////////////////
// Client Island class
class Island {
  constructor (scene, id, x, y, r) {
    this.sizeX = 172;
    this.sizeY = 172;
    this.id = id;
    this.island = scene.add.image(x, y, "station");
    this.island.setDisplaySize(this.sizeX, this.sizeY);
    this.island.setSize(this.sizeX, this.sizeY);
    this.island.par_obj = this; // Just to associate this id with the image
  }

  //////////////////////////////////////////////////////////////////////////////
  destroy () {
    this.island.destroy();
  }
};

////////////////////////////////////////////////////////////////////////////////
// Stone                                                                        //
////////////////////////////////////////////////////////////////////////////////
// Client Stone class
class Stone {
  constructor (scene, id, x, y, r) {
    this.sizeX = 101;
    this.sizeY = 84;
    this.id = id;
    this.stone = scene.add.image(x, y, "asteroid");
    this.stone.setDisplaySize(this.sizeX, this.sizeY);
    this.stone.setSize(this.sizeX, this.sizeY);
    this.stone.par_obj = this; // Just to associate this id with the image
  }

  //////////////////////////////////////////////////////////////////////////////
  destroy () {
    this.stone.destroy();
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

  //////////////////////////////////////////////////////////////////////////////
  destroy () {
    this.explosion.destroy();
  }
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Function called when new box is added at the server.
function onCreateItem (data) {
  if (!(data.id in boxList)) {
    let newBox = new Box(this, data.id, data.x, data.y, data.r);
    boxList[data.id] = newBox;
  }
}

////////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////
// Function called when new island is added at the server.
function onCreateIsland (data) {
  if (!(data.id in islandList)) {
    console.log(`Criando ilha ${data.id}`);
    let newIsland = new Island(this, data.id, data.x, data.y, data.radius);
    islandList[data.id] = newIsland;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Function called when new stone is added at the server.
function onCreateStone (data) {
  if (!(data.id in stoneList)) {
    console.log(`Criando pedra ${data.id}`);
    let newStone = new Stone(this, data.id, data.x, data.y, data.radius);
    stoneList[data.id] = newStone;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Function called when stone needs to be removed at the client.
function onStoneHit (data) {
  let stoneExplosion = new Explosion(this, data.x, data.y, 0.8, 30, 380);
}

////////////////////////////////////////////////////////////////////////////////
// Function called when stone needs to be removed at the client.
function onRemoveStone (data) {
  let stoneExplosion = new Explosion(this, data.x, data.y, 1.2, 50, 450);
  var removeStone = stoneList[data.id];

  removeStone.destroy();
  delete stoneList[data.id];
}

////////////////////////////////////////////////////////////////////////////////
// Function called when new bullet is added at the server.
function onCreateBullet (data) {
  if (!(data.id in bulletList)) {
    let newBullet = new Bullet(this, data.id, data.creator, data.x, data.y, data.angle, data.speed);
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

////////////////////////////////////////////////////////////////////////////////
