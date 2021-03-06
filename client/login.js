////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                               Client - Login                               //
////////////////////////////////////////////////////////////////////////////////

entername.onclick = function() {
  if (!gameProperties.inGame) {
    console.log(`Player ${socket.id} entered name`);
    socket.emit("enter_name", {
      username: signdivusername.value,
      config: config
    });
  }
  0;
};

////////////////////////////////////////////////////////////////////////////////
function throwError(data) {
  errorLog.textContent = data.message;
}

////////////////////////////////////////////////////////////////////////////////
function joinGame(data) {
  console.log(`Player ${socket.id} joined the game`);
  signDiv.style.display = "none";
  loadoutDiv.style.display = null;
  errorLog.textContent = "";
  game.scene.start("Loadout", data.username);
}

////////////////////////////////////////////////////////////////////////////////
// Login                                                                      //
////////////////////////////////////////////////////////////////////////////////
class Login extends Phaser.Scene {
  constructor() {
    super({ key: "Login" });
    // Everything here will execute just one time per client session
    socket.on("join_game", joinGame);
    socket.on("throw_error", throwError);
  }

  //////////////////////////////////////////////////////////////////////////////
  create() {
    signDiv.style.display = null;
    loadoutDiv.style.display = "none";
    gameDiv.style.display = "none";
    gameProperties.inGame = false;
    if (isTouchDevice()) {
      howto.style.display = "none";
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
