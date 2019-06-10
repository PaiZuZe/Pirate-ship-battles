////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                             Client - Loadout                               //
////////////////////////////////////////////////////////////////////////////////

var loadout_shipname = ["Blastbeat", "Blindside"];
var loadout_count = 0;
var loadout_username = "";

loadout_select.onclick = function () {
  socket.emit('select_ship', {ship: loadout_shipname[loadout_count]});
  socket.emit('exit_loadout');
  //Comunicar com servidor de que forma?
}

//Esses botões devem atualizar a página? Como?
loadout_previous.onclick = function () {
  if (--loadout_count < 0) loadout_count = loadout_shipname.length - 1;
}

loadout_next.onclick = function () {
    if (++loadcount >= loadout_shipname.length) loadout_count = 0;
}

function onEnterLoadout (username) {
  //Preparar cena
  loadout_username = username;
}

function onExitLoadout () {
  loadoutDiv.style.display = 'none';
  gameDiv.style.display = null;
  game.scene.start('Main', loadout_username);
}

////////////////////////////////////////////////////////////////////////////////
// Loadout                                                                    //
////////////////////////////////////////////////////////////////////////////////
class Loadout extends Phaser.Scene {
  constructor () {
    super({key: "Loadout"});
    socket.on('enter_loadout', onEnterLoadout);
    socket.on('exit_loadout', onExitLoadout);
  }

  preload () {
    this.load.image("ship", "client/assets/spaceship.png");
    this.load.image("ship-alt", "client/assets/spaceship-alt.png");
  }

  //////////////////////////////////////////////////////////////////////////////
  create (username) {
    loadoutDiv.style.display = null;
    gameDiv.style.display = 'none';
    socket.emit('enter_loadout', username);
  }
}

////////////////////////////////////////////////////////////////////////////////
