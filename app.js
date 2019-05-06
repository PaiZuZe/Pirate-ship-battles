////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const unique = require('node-uuid');
const SAT = require('sat');
const Player = require('./server/player.js');
const Box = require('./server/box.js');
const SafeZone = require('./server/safe_zone.js');
const Island = require('./server/island.js');

const Enemy = require('./server/enemy.js');

const Stone = require('./server/stone.js');
const ScoreBoard = require('./server/score_board.js');
const aux = require('./server/_aux.js');
const GameObj = require('./server/game.js');
const { Pool, Client } = require('pg')

let app = express();
let serv = require('http').Server(app);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen({
  host: '0.0.0.0',
  port: 2000,
  exclusive: true
});

console.log("Server started.");

function creat_pool() {
  const pool = new Pool({
    user: 'postgres',
    host: 'postgres',
    database: 'ssb',
    password: 'postgress',
    port: 5432,
  })
  return pool;
}

const UPDATE_TIME = 0.06; // sec
const BULLET_LIFETIME = 5000; // ms

const game = new GameObj();

circle = new SafeZone(1000, 1000, 1000, game.canvasWidth, game.canvasHeight);

setInterval(updateGame, 1000 * UPDATE_TIME);

////////////////////////////////////////////////////////////////////////////////
function updateGame () {
  // Update players
  for (let k in game.playerList) {
    if (!(k in game.playerList))
      continue;
    let p = game.playerList[k];
    p.updatePos(UPDATE_TIME);

    if (p.inputs.shootLeft || p.inputs.shootRight) {
      let newBullets = p.tryToShoot();
      for (const b of newBullets) {
        game.bulletList[b.id] = b;
        io.in('game').emit("bullet_create", b);
      }
    }
    //checking if outside safe-zone
    if (!circle.in_circle(p)) {
      p.takeDamage(game.delta, game.mod);
      if (p.life <= 0) {
      playerKilled(p);
      }
    }
  }

    // Update bots
    for (const b in game.botList) {
      if (!(b in game.botList))
        continue;
      let bot = game.botList[b];
      let newBullets = bot.takeAction(game.playerList);
      for (const b of newBullets) {
        game.bulletList[b.id] = b;
        io.in('game').emit("bullet_create", b);
      }
    }

  // Update bullets
  for (const kb in game.bulletList) {
    if (!(kb in game.bulletList))
      continue;
    let bullet = game.bulletList[kb];
    bullet.updatePos(UPDATE_TIME);
    for (const kt in game.stoneList) {
      collideBulletAndStone(bullet, game.stoneList[kt]);
    }

    if (Date.now() > bullet.timeCreated + BULLET_LIFETIME) {
      delete game.bulletList[bullet.id];
      io.in('game').emit('bullet_remove', bullet);
    }
  }

  // Do player collisions
  for (const k1 in game.playerList) {
    let p1 = game.playerList[k1];
    for (const k2 in game.playerList) {
      p2 = game.playerList[k2];
      if (p2.id < p1.id)
        collidePlayers(p1, p2);
    }
    for (const kb in game.boxList) {
      collidePlayerAndBox(p1, game.boxList[kb]);
    }

    for (const kb in game.bulletList) {
      collidePlayerAndBullet(p1, game.bulletList[kb]);
    }
    /*Find a better way to do this*/
    let in_island = false;
    for (const kb in game.islandList) {
      collidePlayerAndIsland(p1, game.islandList[kb]);
      if (collidePlayerAndIslandRestore(p1, game.islandList[kb])) {
        in_island = true;
      }
    }
    if (in_island == false) {
      if (p1.anchored_timer > 0) {
        p1.anchored_timer -= 1;
      }
    }
    for (const kb in game.stoneList) {
      collidePlayerAndStone(p1, game.stoneList[kb]);
    }
  }

  // Do bot collisions
  for (const b in game.botList) {
    let bot = game.botList[b];
    for (const kb in game.bulletList) {
      collideBotAndBullet(bot, game.bulletList[kb]);
    }
  }

  //change max number of bots
  game.botMax = Math.max(1, Math.ceil(Object.keys(game.playerList).length / 2));
  addBot();

  io.in('game').emit("update_game", { playerList:  Object.assign({}, game.playerList, game.botList),
                                      bulletList:  game.bulletList,
                                      score_board: game.score_board});
}

////////////////////////////////////////////////////////////////////////////////
// Create the pickable boxes there are missing at the game
function addBox () {
  let n = game.boxesMax - game.numOfBoxes;
  for (let i = 0; i < n; i++) {
    let boxentity = new Box(game.canvasWidth, game.canvasHeight, 'box');
    game.boxList[boxentity.id] = boxentity;
    io.in('game').emit("item_create", boxentity);
    game.numOfBoxes++;
  }
}

////////////////////////////////////////////////////////////////////////////////
function addIslands () {
  let n = game.islandMax - Object.keys(game.islandList).length;
  for (let i = 0; i < n; i++) {
    // Generating them like this is redundant, considering the consistency check
    // contained inside island.js, but this may allow more customization options later

    let bad = true;
    while (bad) {
      bad = false;
      var temp_x = aux.getRndInteger(0, game.canvasWidth - 1);
      var temp_y = aux.getRndInteger(0, game.canvasHeight - 1);

      for (let k in game.stoneList) {
        if (bad == false && aux.distSq({x: temp_x, y: temp_y}, game.stoneList[k]) < 100*100) {
          bad = true;
        }
      }

      for (let k in game.islandList) {
        if (bad == false && aux.distSq({x: temp_x, y: temp_y}, game.islandList[k]) < 200*200) {
          bad = true;
        }
      }
    }

    let islandentity = new Island(temp_x, temp_y, 50, "life", game.canvasWidth, game.canvasHeight);
    game.islandList[islandentity.id] = islandentity;
    io.in('game').emit("island_create", islandentity);
  }
}

////////////////////////////////////////////////////////////////////////////////
function addStones () {
  let n = game.stoneMax - Object.keys(game.stoneList).length;
  for (let i = 0; i < n; i++) {
    let bad = true;
    while (bad) {
      bad = false;
      var temp_x = aux.getRndInteger(0, game.canvasWidth - 1);
      var temp_y = aux.getRndInteger(0, game.canvasHeight - 1);

      for (let k in game.stoneList) {
        if (bad == false && aux.distSq({x: temp_x, y: temp_y}, game.stoneList[k]) < 100*50) {
          bad = true;
        }
      }

      for (let k in game.islandList) {
        if (bad == false && aux.distSq({x: temp_x, y: temp_y}, game.islandList[k]) < 100*100) {
          bad = true;
        }
      }
    }

    let stoneentity = new Stone(temp_x, temp_y, 50, game.canvasWidth, game.canvasHeight);
    game.stoneList[stoneentity.id] = stoneentity;
    io.in('game').emit("stone_create", stoneentity);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Called after the player entered its name
function onEntername (data) {
  console.log(`Received joinning request from ${this.id}, size: ${data.config.width}:${data.config.height}`);
  if (data.username.length > 0 && data.username.length < 15) {
    let pool = creat_pool();
    pool.query('INSERT INTO players(name, password) VALUES($1, $2)', [data.username, data.password])
      .then((res) => this.emit('join_game', {username: data.username, id: this.id, password: data.password}))
      .catch(err => {
        pool.query('SELECT password FROM players WHERE name = $1', [data.username])
          .then((res) => {
            if (res.rows[0].password == data.password)
              this.emit('join_game', {username: data.username, id: this.id, password: data.password});
            else this.emit('throw_error', {message: "Player already exists or wrong password"});
          });
      })
      .finally(() => pool.end());
  }
  else if (data.username.length <= 0)
    this.emit('throw_error', {message: "Name can't be null"});
  else if (data.username.length >= 15)
    this.emit('throw_error', {message: "Name is too long"});
}

////////////////////////////////////////////////////////////////////////////////
function colliding (newPlayer) {
  let minPlayerDist = 200*200;
  let minIslandDist = 500*500;
  let minStoneDist = 500*500;
  // Check for players
  for (const k in game.playerList) {
    if (aux.distSq(newPlayer, game.playerList[k]) < minPlayerDist)
      return true;
  }
  for (const i in game.islandList) {
    if (aux.distSq(newPlayer, game.islandList[i]) < minIslandDist)
      return true;
  }
  for (const i in game.stoneList) {
    if (aux.distSq(newPlayer, game.stoneList[i]) < minStoneDist)
      return true;
  }
  return false;
}

////////////////////////////////////////////////////////////////////////////////
// Called when a new player connects to the server
function onNewPlayer (data) {
  if (this.id in game.playerList) {
    console.log(`Player with id ${this.id} already exists`);
    return;
  }
  let newPlayer = new Player(aux.mapFloatToInt(Math.random(), 0, 1, 250, game.canvasWidth - 250),
                 aux.mapFloatToInt(Math.random(), 0, 1, 250, game.canvasHeight - 250),
                 0, this.id, data.username);

  while (colliding(newPlayer) && !circle.in_circle(newPlayer)) {
    newPlayer.setPos(aux.mapFloatToInt(Math.random(), 0, 1, 250, game.canvasWidth - 250),
             aux.mapFloatToInt(Math.random(), 0, 1, 250, game.canvasHeight - 250));
  }
  console.log("Created new player with id " + this.id);

  //this.emit('create_player', newPlayer); // client Player() constructor expects player coordinates
  this.emit('create_player', data);

  let current_info = {
    id: newPlayer.id,
    x: newPlayer.x,
    y: newPlayer.y,
    angle: newPlayer.angle,
    username: newPlayer.username,
  };

  for (let k in game.playerList) {
    existingPlayer = game.playerList[k];
    let player_info = {
      id: existingPlayer.id,
      username: existingPlayer.username,
      x: existingPlayer.x,
      y: existingPlayer.y,
      angle: existingPlayer.angle,
    };
    this.emit("new_enemyPlayer", player_info);
  }

  game.playerList[this.id] = newPlayer;
  game.score_board.add_player(this.id, data.username);

  for (let k in game.boxList)
    this.emit('item_create', game.boxList[k]);

  for (let k in game.bulletList)
    this.emit('bullet_create', game.bulletList[k]);

  for (let k in game.islandList)
    this.emit('island_create', game.islandList[k]);

  for (let k in game.botList)
    this.emit('new_enemyPlayer', game.botList[k]);

  for (let k in game.stoneList)
    this.emit('stone_create', game.stoneList[k]);

  //send message to every connected client except the sender
  this.broadcast.emit('new_enemyPlayer', current_info);
}

////////////////////////////////////////////////////////////////////////////////
// Called when someone fired an input
function onInputFired (data) {
  let movePlayer = game.playerList[this.id];

  if (!(this.id in game.playerList) || game.playerList[this.id].dead)
    return;

  movePlayer.inputs.up = data.up;
  movePlayer.inputs.left = data.left;
  movePlayer.inputs.right = data.right;
  movePlayer.inputs.shootLeft = data.shootLeft;
  movePlayer.inputs.shootRight = data.shootRight;
  movePlayer.inputs.boost = data.boost;
}

////////////////////////////////////////////////////////////////////////////////
// Called to verify if two players collide
function collidePlayers (p1, p2) {
  if (!(p2.id in game.playerList) || !(p1.id in game.playerList)
    || p1.dead || p2.dead)
    return;
  if (SAT.testPolygonPolygon(p1.poly, p2.poly)) {
        playerKilled(p1);
        playerKilled(p2);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Called to verify if an item is picked
function collidePlayerAndBox (p1, bx) {
  if (!(p1.id in game.playerList) || !(bx.id in game.boxList))
    return;

  if (SAT.testPolygonCircle(p1.poly, bx.poly)) {
    p1.fuel += bx.bullets;

    console.log(`Box with ${bx.bullets} bullets picked`);
    delete game.boxList[bx.id];
    game.numOfBoxes--;

    io.in('game').emit('item_remove', bx);

    addBox();
  }
}

function collideBulletAndStone (bullet, stone) {
  if (!(stone.id in game.stoneList) || !(bullet.id in game.bulletList))
    return;
  if (SAT.testPolygonPolygon(stone.collision_poly, bullet.poly)) {
    delete game.bulletList[bullet.id];
    io.in('game').emit('bullet_remove', bullet);
    console.log(`Bullet hit ${stone.id}`);
    stone.hp--;
    if (stone.hp <= 0) {
      if (isNaN(bullet.creator)) {
        game.score_board.update_score(bullet.creator);
      }
      stoneDestroyed(stone);
      addStones();
    }
    else {
      io.in('game').emit('stone_hit', stone);
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Called to verify if a bullet collide with a player
function collidePlayerAndBullet (p1, bullet) {
  if (!(p1.id in game.playerList) || !(bullet.id in game.bulletList) || bullet.creator == p1.id)
    return;

  if (SAT.testPolygonPolygon(p1.poly, bullet.poly)) {
    delete game.bulletList[bullet.id];
    io.in('game').emit('bullet_remove', bullet);
    console.log(`Bullet hit ${p1.username}`);
    p1.life--;
    if (p1.life <= 0) {
      if (isNaN(bullet.creator)) {
        game.score_board.update_score(bullet.creator);
      }
      playerKilled(p1);
    }
    else {
      io.in('game').emit('player_hit', p1);
    }
  }
}

function collideBotAndBullet (bot, bullet) {
  if (!(bot.id in game.botList) || !(bullet.id in game.bulletList) || bullet.creator == bot.id)
    return;

  if (SAT.testPolygonPolygon(bot.poly, bullet.poly)) {
    delete game.bulletList[bullet.id];
    io.in('game').emit('bullet_remove', bullet);
    console.log(`Bullet hit the bot ${bot.id}`);
    bot.life--;
    if (bot.life <= 0) {
      if (isNaN(bullet.creator)) {
        game.score_board.update_score(bullet.creator);
      }
      botKilled(bot);
    }
    else {
      io.in('game').emit('player_hit', bot);
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Called to verify player is in island restore area
function collidePlayerAndIslandRestore (p1, isl) {
  if (!(p1.id in game.playerList) || !(isl.id in game.islandList)) {
    return false;
  }

  if (SAT.testPolygonCircle(p1.poly, isl.restore_poly)) {
    if (p1.anchored_timer < 180) {
      p1.anchored_timer += 1;
    }

    else {
      p1.gainResource(game.delta, game.mod, isl.type);
      p1.anchored_timer = 0;
    }
    return true;
  }
  return false;
}

function collidePlayerAndIsland (p1, isl) {
  if (!(p1.id in game.playerList) || !(isl.id in game.islandList))
    return false;
  if (SAT.testPolygonCircle(p1.poly, isl.collision_poly)) {
    playerKilled(p1);
  }
}

// Called to verify player is in stone area
function collidePlayerAndStone (p1, stn) {
  if (!(p1.id in game.playerList) || !(stn.id in game.stoneList))
    return;
  if (SAT.testPolygonPolygon(p1.poly, stn.collision_poly)) {
    playerKilled(p1);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Called when a someone dies
function playerKilled (player) {
  console.log(`${player.username} died!`);
  if (player.id in game.playerList) {
    console.log(`${player.username} was removed`);
    game.score_board.remove_player(player.id);
    delete game.playerList[player.id];
    io.in('game').emit('remove_player', player);
    io.sockets.sockets[player.id].leave('game');
    io.sockets.sockets[player.id].join('login');
  }

  player.dead = true;
}

function botKilled (bot) {
  console.log(`${bot.username} died!`);
  if (bot.id in game.botList) {
    console.log(`${bot.id} was killed :(`);
    delete game.botList[bot.id];
    io.in('game').emit('remove_player', bot);
  }
  bot.dead = true;
  addBot();
}

function stoneDestroyed (stone) {
  if (stone.id in game.stoneList) {
    console.log(`${stone.id} was removed`);
    delete game.stoneList[stone.id];
    io.in('game').emit('remove_stone', stone);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Called when a client disconnects to  tell  the  clients,  except  sender,  to
// remove the disconnected player
function onClientDisconnect () {
  console.log('disconnect');
  if (this.id in game.playerList) {
    game.score_board.remove_player(this.id);
    delete game.playerList[this.id];
  }
  console.log("removing player " + this.id);

  this.broadcast.emit('remove_player', {id: this.id});
}

function addBot () {
  let n = game.botMax - Object.keys(game.botList).length;
  for (let i = 0; i < n; i++) {
    let id = Math.random();
    let newBot = new Enemy(aux.mapFloatToInt(Math.random(), 0, 1, 250, game.canvasWidth - 250),
    aux.mapFloatToInt(Math.random(), 0, 1, 250, game.canvasHeight - 250),
    0, id);

    while (colliding(newBot) && !circle.in_circle(newBot)) {
      newBot.setPos(aux.mapFloatToInt(Math.random(), 0, 1, 250, game.canvasWidth - 250),
      aux.mapFloatToInt(Math.random(), 0, 1, 250, game.canvasHeight - 250));
    }

    game.botList[newBot.id] = newBot;

    //send message to every connected client except the sender ?
    io.in('game').emit("new_enemyPlayer", newBot);
  }
}

let io = require('socket.io')(serv,{});

////////////////////////////////////////////////////////////////////////////////
io.sockets.on('connection', function(socket) {
  console.log("socket connected");
  socket.join('login');
  socket.on('enter_name', onEntername);
  socket.on('logged_in', function(data) {
    this.emit('enter_game', {username: data.username});
    socket.leave('login');
    socket.join('game');
  });
  socket.on('disconnect', onClientDisconnect);
  socket.on("new_player", onNewPlayer);
  socket.on("input_fired", onInputFired);
});

// Prepare the boxes. fuel cells now.
addBox();
// Prepare the islands
addIslands();
// Prepare the stones
addStones();

addBot();

////////////////////////////////////////////////////////////////////////////////
