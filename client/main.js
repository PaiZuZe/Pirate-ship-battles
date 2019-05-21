////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                               Client - Main                                //
////////////////////////////////////////////////////////////////////////////////

let gameProperties = {
  gameWidth: 2000,
  gameHeight: 2000,
  inGame: false,
}

let countExplosion = 0;
let signalExplosion = 1;

////////////////////////////////////////////////////////////////////////////////
function onSocketConnected (data) {
  console.log("connected to server");
  if (!gameProperties.inGame) {
    socket.emit('new_player', {username: data.username});
    gameProperties.inGame = true;
  }
}

////////////////////////////////////////////////////////////////////////////////
function resetObjects () {
  enemies = {};
  hud = null;
  player = null;
  boxList = {};
  bulletList = {};
  islandList = {};
  stoneList = {};
  botList = {};
  DebrisFieldList = {};
}

////////////////////////////////////////////////////////////////////////////////
/**
 * Process data received from the server
 * @param {{playerList: {}, bulletList: {}}} data
 */
function onUpdate (data) {
	for (const k in data.playerList) {
		if (k in enemies)
			enemies[k].update(data.playerList[k]);
		else if (player){
      player.update(data.playerList[k]);
      console.log("Atualizou");
    }
	}
	for (const bk in data.bulletList) {
    if (bk in data.bulletList)
      bulletList[bk].update(data.bulletList[bk]);
  }
  scoreBoard = data.score_board;
}

////////////////////////////////////////////////////////////////////////////////
// Main                                                                       //
////////////////////////////////////////////////////////////////////////////////
class Main extends Phaser.Scene {
  constructor () {
    super({key: "Main"});
    // Everything here will execute just once per client session
    socket.on('enter_game', onSocketConnected);
    socket.on("create_player", createPlayer.bind(this));
    socket.on("new_enemyPlayer", createEnemy.bind(this));
    socket.on('remove_player', onRemovePlayer.bind(this));
    socket.on('player_hit', onPlayerHit.bind(this));
    socket.on('remove_stone', onRemoveStone.bind(this));
    socket.on('item_remove', onItemRemove);
    socket.on('item_create', onCreateItem.bind(this));
    socket.on('stone_create', onCreateStone.bind(this));
    socket.on('stone_hit', onStoneHit.bind(this));
    socket.on('island_create', onCreateIsland.bind(this));
    socket.on('debris_create', onCreatedebrisField.bind(this));
    socket.on('bullet_remove', onBulletRemove);
    socket.on('bullet_create', onCreateBullet.bind(this));
    socket.on('enable_inputs', this.enableInputs.bind(this));
    socket.on('disable_inputs', this.disableInputs.bind(this));
    socket.on('update_game', onUpdate);

    this.player_life = 3; // Player life to make the screen blink when it takes damage.
    this.blink_timer = 2;
  }

  //////////////////////////////////////////////////////////////////////////////
  preload () {
    //this.load.spritesheet("ship", "client/assets/ship.png", {frameWidth: 112, frameHeight: 96});
    this.load.spritesheet("bullet_fill", "client/assets/bullet_fill_anim.png", {frameWidth: 24, frameHeight: 24});
    this.load.image("ship", "client/assets/spaceship.png");
    this.load.image("ship-alt", "client/assets/spaceship-alt.png");
    this.load.image("bullet", "client/assets/laser.png");
    this.load.image("big_bullet", "client/assets/laser.png");
    this.load.image("heart", "client/assets/heart.png");
    this.load.image("bullet_shadow", "client/assets/bullet_shadow.png");
    this.load.image("barrel", "client/assets/barrel.png");
    this.load.image("station", "client/assets/station.png");
    this.load.image("asteroid", "client/assets/asteroid.png");
    this.load.image("enemy", "client/assets/enemy.png");
    this.load.image("stars", "client/assets/black.png")
    this.load.image('base_controller', 'client/assets/base_controller.png');
    this.load.image('top_controller', 'client/assets/top_controller.png');
    this.load.image('shot_controller', 'client/assets/shot_controller.png');
    this.load.image('explosion', 'client/assets/explosion.png');
  }

  //////////////////////////////////////////////////////////////////////////////
  create (username) {
    let camera = this.cameras.main;

    console.log("client started");

    socket.emit('logged_in', {username: username});
    this.player_life = 3;
    this.blink_timer = 2;

    // Set camera limits
    camera.setBounds(0, 0, gameProperties.gameWidth, gameProperties.gameHeight);

    // Rectangle that bounds the camera
    this.screenRect = {
      x: camera.width/2,
      y: camera.height/2,
      w: gameProperties.gameWidth - camera.width,
      h: gameProperties.gameHeight - camera.height
    };

    // Get listeners for keys
    this.key_W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.key_A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.key_S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.key_D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.key_SHIFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.key_SPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


    // Mini Map
    if (!this.mobileMode) {
      this.minimap = this.cameras.add(camera.width-200, 0, 200, 200).setZoom(0.2).setName('mini');
      this.minimap.setBackgroundColor(0x000000);
      this.minimap.scrollX = 0;
      this.minimap.scrollY = 0;
      var border = new Phaser.Geom.Rectangle(camera.width-202, 0, 202, 202); // Larger rectangle = Thicker border
      var border_graphics = this.add.graphics({ fillStyle: { color: 0xffffff } }).setDepth(5150);
      border_graphics.fillRectShape(border);
      border_graphics.setScrollFactor(0);
    }
    this.explosion = this.add.sprite(100, 100, 'explosion').setDepth(5100).setAlpha(0);
  }

  //////////////////////////////////////////////////////////////////////////////
  update (dt) {
    if (gameProperties.inGame) {

      if (hud) {
        // Update inputs
        if (!this.mobileMode) {
          this.minimap.ignore(hud.getGameObjects());
        }
        let data = {
          up: (this.key_W.isDown),
          left: (this.key_A.isDown),
          right: (this.key_D.isDown),
          primary_fire: (this.key_SPACE.isDown),
          boost: (this.key_SHIFT.isDown)
        }
        socket.emit('input_fired', data);
      }

      // Update some objects
      for (const k in enemies) {
        enemies[k].updatePredictive(dt);
      }
      if (player) {
        player.updatePredictive(dt);
        hud.update();
      }
    }
    if (player) {
      // Scroll camera to player's position (Phaser is a little buggy when doing this)
      this.cameras.main.setScroll(player.body.x, player.body.y);

      // Mini Map
      if (!this.mobileMode) {
        this.minimap.scrollX = player.body.x;
        this.minimap.scrollY = player.body.y;
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  enableInputs () {
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
  }

  disableInputs () {
    if (player) {
      player.inputs.up = false;
    }
    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.K);
  }
}

////////////////////////////////////////////////////////////////////////////////
