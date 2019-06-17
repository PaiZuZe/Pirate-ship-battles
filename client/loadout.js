////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                             Client - Loadout                               //
////////////////////////////////////////////////////////////////////////////////

let loadout_shipname = ["Blastbeat", "Blindside"];
let loadout_shipdesc = [ //Better have this in another file (JSON?)
  "Strong attacks and massive HP",
  "Fast boost and high fire rate"
]
let loadout_shipimg = [
  "url('../assets/spaceship.png')",
  "url('../assets/spaceship-alt.png')"
]
let loadout_count = 0;
let loadout_username = "";

////////////////////////////////////////////////////////////////////////////////
loadout_select.onclick = function () {
  socket.emit('selected_ship', {shipname: loadout_shipname[loadout_count]});
  socket.emit('exit_loadout');
}

loadout_previous.onclick = function () {
  if (--loadout_count < 0) loadout_count = loadout_shipname.length - 1;
  changeShip();
}

loadout_next.onclick = function () {
  if (++loadcount >= loadout_shipname.length) loadout_count = 0;
  changeShip();
}

////////////////////////////////////////////////////////////////////////////////
function changeShip () {
  shipName.innerHTML = loadout_shipname[loadout_count];
  shipDesc.innerHTML = loadout_shipdesc[loadout_count];
  shipPreview.style.content = loadout_shipimg[loadout_count];
}

////////////////////////////////////////////////////////////////////////////////
function onEnterLoadout (username) {
  loadout_username = username;
  changeShip();
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

  //////////////////////////////////////////////////////////////////////////////
  create (username) {
    loadoutDiv.style.display = null;
    gameDiv.style.display = 'none';
    socket.emit('enter_loadout', username);
  }
}

////////////////////////////////////////////////////////////////////////////////
