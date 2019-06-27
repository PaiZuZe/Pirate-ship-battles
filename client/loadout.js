////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                             Client - Loadout                               //
////////////////////////////////////////////////////////////////////////////////

let ships = SHIPINFO;
let loadout_count = 0;
let loadout_username = "";
let loadout_room_id = Math.floor(Math.random()*2) + 1;

////////////////////////////////////////////////////////////////////////////////
loadout_select.onclick = function () {
  exitLoadout();
}

loadout_room.onchange = function () {
  loadout_room_id = loadout_room.options[loadout_room.selectedIndex].value;
}

loadout_previous.onclick = function () {
  if (--loadout_count < 0) loadout_count = ships.length - 1;
  changeShip();
}

loadout_next.onclick = function () {
  if (++loadout_count >= ships.length) loadout_count = 0;
  changeShip();
}

////////////////////////////////////////////////////////////////////////////////
function changeShip () {
  shipPreview.style.content = ships[loadout_count].img;
  shipName.innerHTML = ships[loadout_count].name;
  shipDesc.innerHTML = ships[loadout_count].desc;
}

////////////////////////////////////////////////////////////////////////////////
function exitLoadout () {
  loadoutDiv.style.display = 'none';
  gameDiv.style.display = null;
  game.scene.start('Main', {username: loadout_username, shipname: ships[loadout_count].name});
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
