////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                                Server - Room                               //
////////////////////////////////////////////////////////////////////////////////

import { ScoreBoard } from './scoreBoard';
import { Player } from './player';
import { mapFloatToInt } from './aux';
import * as socketIO from 'socket.io';
import { Collisions, Polygon } from './collisions/Collisions'
import { collisionHandler, isColliding }  from './collisionHandler';

/*
TODO: Future imports
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
  public readonly name: string; 
  // Game Elements
  private players: Map<string, Player> = new Map<string, Player>();
  /*
  TODO: Future Elements
  private bots: Map<string, Bot> = new Map<string, Bot>();  
  private damageArtefacts: Map<string, DamageArtefact> = new Map<string, DamageArtefact>();
  private stations: Map<string, Station> = new Map<string, Station>();
  private debrisField: Map<string, DebrisField> = new Map<string, DebrisField>();
  private asteroids: Map<string, Asteroid> = new Map<string, Asteroid>();
  private fuelCells: Map<string, FuelCell> = new Map<string, FuelCell>();
  */
  private scoreBoard: ScoreBoard; // The list of scores form active players
  private io: socketIO.Server;
  
  // Game Properties
  private fuelCellsMax: number = 15; 
  private botsMax: number = 1;
  private debrisFieldMax: number = 3;
  private stationsMax: number = 10; 
  private asteroidsMax: number = 4;  
  private canvasHeight: number = 2000;  
  private canvasWidth: number = 2000; 
  private delta: number = 1; // Advances by one each game update cycle (related to player invulnerability)
  private mod: number = 120;  // Arbitrary integer variable, used to define invulnerability time
  private collisionSystem: Collisions; 

  constructor(io: socketIO.Server, num: number) {
      this.io = io;
      this.name = 'room' + num;
      this.scoreBoard = new ScoreBoard();
      this.collisionSystem = new Collisions();
      this.collisionSystem.update(); // MAYBE WE DON'T NEED THIS HERE??
      setInterval(this.updateGame.bind(this), 1000 * UPDATE_TIME);
  }

  private getPlayersInfo(): any {
    let playerData: any = {}
    this.players.forEach((value: Player, key: string) => {
      let currentPlayerInfo = {
        id: value.id,
        x: value.x,
        y: value.y,
        speed: value.speed,
        angle: value.angle,
        username: value.username,
        life: value.hull,
        fuel: value.fuel,
        anchored_timer: value.stationInfluenceTimer
      };
      playerData[key] = currentPlayerInfo;
    });

    return playerData;
  }

  private updatePlayers(): void {
    if (this.players) { 
      this.players.forEach((value: Player, key: string) => {
        if (!this.players.has(key))
          return;
        value.updatePos(UPDATE_TIME);
        const potentials = value.collisionShape.potentials();
        
        // Check for collisions
        for (const body of potentials) {
          if (value.collisionShape.collides(body)) {
            collisionHandler(this, value, this.players.get(body.id), 'Player', body.type);
          }
        }
      });
    }
  }
  
  public updateGame(): void { 
    this.updatePlayers();
    let scoreBoard: any = this.scoreBoard.asObj();
    this.collisionSystem.update();
    this.io.in(this.name).emit("update_game", 
                               {playerList: this.getPlayersInfo(), 
                                score_board: scoreBoard});
  }

  public addNewPlayer(socket: any, data: any): void {
    if (this.players.get(socket.id)) {
      console.log(`Player with id ${socket.id} already exists`);
      return;
    }
    
    let newPlayer = new Player(mapFloatToInt(Math.random(), 0, 1, 250, this.canvasWidth - 250),
                   mapFloatToInt(Math.random(), 0, 1, 250, this.canvasHeight - 250),
                   0, socket.id, data.username);
    this.players.set(socket.id, newPlayer);
    this.scoreBoard.addPlayer(data.username);

    /*
     * TODO: Probably it is better the player verify this on its constructor. 
     * Check if player is not colliding with another object. 
     * If it is, place it somewhere else it isn't colliding with anything else.
     */
    /*               
    while (isColliding(newPlayer.collisionShape)) {
      newPlayer.setPos(mapFloatToInt(Math.random(), 0, 1, 250, this.canvasWidth - 250),
               mapFloatToInt(Math.random(), 0, 1, 250, this.canvasHeight - 250));
      this.collisionSystem.update();
    }
    */
    socket.emit('create_player', newPlayer);
    this.collisionSystem.insert(newPlayer.collisionShape);
    this.players.forEach((value: Player, key: string) => {
      if (value != newPlayer) {
        socket.emit("new_enemyPlayer", value.getPlayerData());
      }
    });
    console.log("Created new player with id " + socket.id);

    // Send message to every connected client except the sender
    socket.broadcast.emit('new_enemyPlayer', newPlayer.getPlayerData);
  }

  public removePlayer(player: Player) {  
    console.log(`${player.username} died!`);
    if (this.players.has(player.id)) {
      console.log(`${player.username} was removed`);
      this.collisionSystem.remove(player.collisionShape);
      this.scoreBoard.removePlayer(player.username);
      this.players.delete(player.id);
      this.io.in(this.name).emit('remove_player', {id :player.id, x: player.x, y : player.y});
      this.io.sockets.sockets[player.id].leave(this.name);
      this.io.sockets.sockets[player.id].join('login');
    }
    return;
  }

  public updatePlayerInput(socket: any, data: any): void {
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
