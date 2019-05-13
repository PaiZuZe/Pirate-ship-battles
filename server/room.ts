////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                                Server - Room                               //
////////////////////////////////////////////////////////////////////////////////

import { ScoreBoard } from './scoreBoard';
import { Player } from './player';
import { mapFloatToInt } from './aux';
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
  public name: String; 
  // Game Elements
  private players: Map<String, Player> = new Map<String, Player>();
  /*
  private bots: Map<String, Bot> = new Map<String, Bot>();  
  private damageArtefacts: Map<String, DamageArtefact> = new Map<String, DamageArtefact>();
  private stations: Map<String, Station> = new Map<String, Station>();
  private debrisField: Map<String, DebrisField> = new Map<String, DebrisField>();
  private asteroids: Map<String, Asteroid> = new Map<String, Asteroid>();
  private fuelCells: Map<String, FuelCell> = new Map<String, FuelCell>();
  */
  private scoreBoard: ScoreBoard; // The list of scores form active players
  
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
  constructor(num: number) {
      this.name = 'room' + num;
      this.scoreBoard = new ScoreBoard();
      setInterval(this.updateGame, 1000 * UPDATE_TIME);
  }
  
  public updateGame(): void {
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
}
