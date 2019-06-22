////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                             Client - Loadout                               //
////////////////////////////////////////////////////////////////////////////////

let loadout_shipname = ["Blastbeat", "Blindside"];
let loadout_shipdesc = [ //Better have this in another file (JSON?)
  "Strong attacks and massive fuel capacity",
  "Fast boost and high fire rate"
]
let loadout_shipimg = [
  "url('client/assets/spaceship.png')",
  "url('client/assets/spaceship-alt.png')"
]
let loadout_count = 0;
let loadout_username = "";

////////////////////////////////////////////////////////////////////////////////
loadout_select.onclick = function () {
  exitLoadout();
}

loadout_previous.onclick = function () {
  if (--loadout_count < 0) loadout_count = loadout_shipname.length - 1;
  changeShip();
}

loadout_next.onclick = function () {
  if (++loadout_count >= loadout_shipname.length) loadout_count = 0;
  changeShip();
}

////////////////////////////////////////////////////////////////////////////////
function changeShip () {
  shipPreview.style.content = loadout_shipimg[loadout_count];
  shipName.innerHTML = loadout_shipname[loadout_count];
  shipDesc.innerHTML = loadout_shipdesc[loadout_count];
}

////////////////////////////////////////////////////////////////////////////////
function exitLoadout () {
  loadoutDiv.style.display = 'none';
  gameDiv.style.display = null;
  game.scene.start('Main', {username: loadout_username, shipname: loadout_shipname[loadout_count]});
}

////////////////////////////////////////////////////////////////////////////////
// Loadout                                                                    //
////////////////////////////////////////////////////////////////////////////////
class Loadout extends Phaser.Scene {
  constructor () {
    super({key: "Loadout"});
  }

  //////////////////////////////////////////////////////////////////////////////
  create (username) {
    changeShip();
    loadoutDiv.style.display = null;
    gameDiv.style.display = 'none';
    loadout_username = username;
  }
}

////////////////////////////////////////////////////////////////////////////////
