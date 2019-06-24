////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                               Client - Game                                //
////////////////////////////////////////////////////////////////////////////////

var socket = io({ transports: ['websocket'], upgrade: false, reconnection: false });

var config = {
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: 0,
      debug: false
    }
  },
  backgroundColor: "#000000",
  scene: [Login, Loadout, Main]
};

var game = new Phaser.Game(config);

const DEBUG = true;

const HALF_FRAME = Math.PI/16;
const G_ACCEL = 9.8;

////////////////////////////////////////////////////////////////////////////////
