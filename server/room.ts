////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                                Server - Room                               //
////////////////////////////////////////////////////////////////////////////////

import { ScoreBoard } from './scoreBoard';
import { Player } from './player';
import { mapFloatToInt, fromEntries } from './aux';
import * as socketIO from 'socket.io';
import 'polyfill-object.fromentries';

/*
import { Bot } from './bot';
import { Station } from './station';
import { DamageArtefact } from './damageArtefact';
import { DebrisField } from './debrisField';
import { Asteroid } from './asteroid';
import { FuelCell } from './fuelCell';
*/

const UPDATE_TIME = 0.06; // sec
const BULLET_LIFETIME = 5000; // ms

export class Room {
  public name: string; 
  // Game Elements
  private players: Map<string, Player> = new Map<string, Player>();
  /*
  private bots: Map<string, Bot> = new Map<string, Bot>();  
  private damageArtefacts: Map<string, DamageArtefact> = new Map<string, DamageArtefact>();
  private stations: Map<string, Station> = new Map<string, Station>();
  private debrisField: Map<string, DebrisField> = new Map<string, DebrisField>();
  private asteroids: Map<string, Asteroid> = new Map<string, Asteroid>();
  private fuelCells: Map<string, FuelCell> = new Map<string, FuelCell>();
  */
  private scoreBoard: ScoreBoard; // The list of scores form active players
  private io: socketIO.Server;
  
  // Game Propertires
  private fuelCellsMax: number = 15; 
  private botsMax: number = 1;
  private debrisFieldMax: number = 3;
  private stationsMax: number = 10; 
  private asteroidsMax: number = 4;  
  private canvasHeight: number = 2000;  
  private canvasWidth: number = 2000; 
  private delta: number = 1; // Advances by one each game update cycle (related to player invulnerability)
  private mod: number = 120;  // Arbitrary integer variable, used to define invulnerability time
  
  constructor(io: socketIO.server, num: number) {
      this.io = io;
      this.name = 'room' + num;
      this.scoreBoard = new ScoreBoard();
      setInterval(this.updateGame.bind(this), 1000 * UPDATE_TIME);
  }
  
  public updateGame(): void {
    /*
    // Update players
    for (let k in game.playerList) {
      if (!(k in game.playerList))
        continue;
      let p = game.playerList[k];
      p.updatePos(UPDATE_TIME);

      if (p.inputs.primary_fire) {
        let newBullets = p.tryToShoot();
        for (const b of newBullets) {
          game.bulletList[b.id] = b;
          io.in('game').emit("bullet_create", b);
        }
      }
    }
    */
   
    // Update Players'
    if (this.players) 
      this.players.forEach((value: Player, key: string) => {
        if (!this.players.has(key))
          return;
        value.updatePos(UPDATE_TIME);
      });
  

    /*
    io.in('game').emit("update_game", { playerList:  Object.assign({}, game.playerList, game.botList),
                                      bulletList:  game.bulletList, score_board: game.score_board});
    */

    let obj = fromEntries(this.players);
    //console.log(obj);
       
    this.io.in(this.name).emit("update_game", 
                               {playerList: obj, 
                                score_board: this.scoreBoard})
  }

  public newPlayer(socket: any, data: any): void {
    if (this.players.get(socket.id)) {
      console.log(`Player with id ${socket.id} already exists`);
      return;
    }
    
    let newPlayer = new Player(mapFloatToInt(Math.random(), 0, 1, 250, this.canvasWidth - 250),
                   mapFloatToInt(Math.random(), 0, 1, 250, this.canvasHeight - 250),
                   0, socket.id, data.username);
  
    /*               
    while (colliding(newPlayer)) {
      newPlayer.setPos(aux.mapFloatToInt(Math.random(), 0, 1, 250, game.canvasWidth - 250),
               aux.mapFloatToInt(Math.random(), 0, 1, 250, game.canvasHeight - 250));
    }
    */
    console.log("Created new player with id " + socket.id);
  
    socket.emit('create_player', newPlayer); // client Player() constructor expects player coordinates
    //this.emit('create_player', data);
  
    let current_info = {
      id: newPlayer.id,
      x: newPlayer.x,
      y: newPlayer.y,
      angle: newPlayer.angle,
      username: newPlayer.username,
    };

    this.players.forEach((value: Player, key: string) => {
        let player_info = {
            id: value.id,
            username: value.username,
            x: value.x,
            y: value.y,
            angle: value.angle,
          };
          socket.emit("new_enemyPlayer", player_info);
    });
  
    this.players.set(socket.id, newPlayer);
    this.scoreBoard.addPlayer(data.username)
  
    /*
    for (let k in game.boxList)
        socket.emit('item_create', game.boxList[k]);
  
    for (let k in game.bulletList)
        socket.emit('bullet_create', game.bulletList[k]);
  
    for (let k in game.islandList)
        socket.emit('island_create', game.islandList[k]);
  
    for (let k in game.botList)
        socket.emit('new_enemyPlayer', game.botList[k]);
  
    for (let k in game.stoneList)
        socket.emit('stone_create', game.stoneList[k]);
    for (let k in game.debrisFieldList)
        socket.emit("debris_create", game.debrisFieldList[k]);
  
    */
    //send message to every connected client except the sender
    socket.broadcast.emit('new_enemyPlayer', current_info);
  }

  public inputFired(socket: any, data: any): void {
    let player: Player = this.players.get(socket.id);
    if (!this.players.has(socket.id) || this.players.get(socket.id).isDead)
      return;

    player.inputs.up = data.up;
    player.inputs.left = data.left;
    player.inputs.right = data.right;
    player.inputs.primaryFire = data.primary_fire;
    player.inputs.boost = data.boost;
  }
}
