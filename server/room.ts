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
import { DamageArtefact, PrimaryFire } from './damageArtefact';
import { SpaceStation } from './spaceStation';
import { Asteroid } from './asteroid';
import { FuelCell } from './fuelCell';


/*
TODO: Future imports
import { Bot } from './bot';
import { DamageArtefact } from './damageArtefact';
import { DebrisField } from './debrisField';
*/

const UPDATE_TIME = 0.06; // sec
const BULLET_LIFETIME = 5000; // ms

export class Room {
  public readonly name: string; 
  // Game Elements
  private players: Map<string, Player> = new Map<string, Player>();
  private damageArtefacts: Map<string, DamageArtefact> = new Map<string, DamageArtefact>();
  private stations: Map<string, SpaceStation> = new Map<string, SpaceStation>();
  private asteroids: Map<string, Asteroid> = new Map<string, Asteroid>();
  private fuelCells: Map<string, FuelCell> = new Map<string, FuelCell>();
  /*
  TODO: Future Elements
  private bots: Map<string, Bot> = new Map<string, Bot>();  
  private debrisField: Map<string, DebrisField> = new Map<string, DebrisField>();
  */
  private scoreBoard: ScoreBoard; // The list of scores form active players
  public io: socketIO.Server;
  
  // Game Properties
  private fuelCellsMax: number = 15; 
  private botsMax: number = 1;
  private debrisFieldMax: number = 3;
  private stationsMax: number = 10; 
  private asteroidsMax: number = 10;  
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
      this.fillWStations();
      this.fillWAsteroids();
      this.fillWFuelCells();
  }

  private getObj(objId: string, objType: string): any {
    if (objType == 'Player') {
      return this.players.get(objId);
    }
    else if (objType == 'DamageArtefact') {
      return this.damageArtefacts.get(objId);
    }
    else if (objType == 'SpaceSationRest' || objType == 'SpaceSationCol') {
      return this.stations.get(objId);
    }
    else if (objType == 'Asteroid') {
      return this.asteroids.get(objId);
    }
    else if (objType == "FuelCell") {
      return this.fuelCells.get(objId);
    }
  }

  private getPlayersInfo(): any {
    let playerData: any = {}
    this.players.forEach((value: Player, key: string) => {
      playerData[key] = value.getData();
    });

    return playerData;
  }


  private getDamageArtefactsInfo(): any {
    let artefactData: any = {};
    this.damageArtefacts.forEach((value: DamageArtefact, key: string) => {
      artefactData[key] = value.getData();
    });
    return artefactData;
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
            collisionHandler(this, value, this.getObj(body.id, body.type), 'Player', body.type);
          }
        }
      });
    }
  }

  private updateDamageArtefacts(): void {
    if (this.damageArtefacts) { 
      this.damageArtefacts.forEach((value: DamageArtefact, key: string) => {
        if (!this.damageArtefacts.has(key))
          return;
        value.updatePos(UPDATE_TIME);
        const potentials = value.collisionShape.potentials();
        
        // Check for collisions
        for (const body of potentials) {
          if (value.collisionShape.collides(body)) {
            collisionHandler(this, value, this.getObj(body.id, body.type), 'DamageArtefact', body.type);
          }
        }
      });
    }
  }

  private createDamageArtefacts(): void {
    let temp: DamageArtefact[];
    if (this.players) { 
      this.players.forEach((value: Player, key: string) => {
        if (!this.players.has(key)) {
          return;
        }
        if (value.inputs.primaryFire) {
          temp = value.primaryFire();
          if (temp != null) {
            for (let i: number = 0; i < temp.length; ++i) {
              this.damageArtefacts.set(temp[i].id, temp[i]);
              this.collisionSystem.insert(temp[i].collisionShape);
              this.io.in(this.name).emit("bullet_create", temp[i].getData());
            }
          }
        }      
      });
    }
  }

  public updateGame(): void { 
    this.updatePlayers();
    this.updateDamageArtefacts();
    this.createDamageArtefacts();
    let scoreBoard: any = this.scoreBoard.asObj();
    this.collisionSystem.update();
    this.io.in(this.name).emit("update_game", 
                               {playerList: this.getPlayersInfo(),
                                bulletList: this.getDamageArtefactsInfo(), 
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
        socket.emit("new_enemyPlayer", value.getData());
      }
    });
    this.damageArtefacts.forEach((value: DamageArtefact, key: string) => {
        socket.emit("bullet_create", value.getData());
    });
    this.stations.forEach((value: SpaceStation, key: string) => {
      socket.emit("island_create", value.getData());  
    });
    this.asteroids.forEach((value: Asteroid, key: string) => {
      socket.emit("stone_create", value.getData());  
    });
    this.fuelCells.forEach((value: FuelCell, key: string) => {
      socket.emit("item_create", value.getData());  
    });
    console.log("Created new player with id " + socket.id);
    // Send message to every connected client except the sender
    socket.broadcast.emit('new_enemyPlayer', newPlayer.getData());
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

  private addSpaceStation(): void {
    let x = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasWidth - 250);
    let y = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasHeight - 250);
    let newSpaceSatition = new SpaceStation(x, y, 100, this.canvasWidth, this.canvasHeight, "life", 1, 180);
    this.stations.set(newSpaceSatition.id, newSpaceSatition);
    this.collisionSystem.insert(newSpaceSatition.restorationShape);
    this.collisionSystem.insert(newSpaceSatition.collisionShape);
    this.io.in(this.name).emit("island_create", newSpaceSatition.getData());
    return;
  }

  private addAsteroid(): void {
    let x = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasWidth - 250);
    let y = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasHeight - 250);
    let newAsteroid = new Asteroid(x, y, this.canvasWidth, this.canvasHeight);
    this.asteroids.set(newAsteroid.id, newAsteroid);
    this.collisionSystem.insert(newAsteroid.collisionShape);
    this.io.in(this.name).emit("stone_create", newAsteroid.getData());
    return;
  }

  public removeAsteroid(obj: Asteroid): void {
    this.collisionSystem.remove(obj.collisionShape);
    this.asteroids.delete(obj.id);
    this.io.in(this.name).emit("remove_stone", obj.getData());
    return;
  }

  private addFuelCell(): void {
    let x = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasWidth - 250);
    let y = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasHeight - 250);
    let newFuelCell = new FuelCell(x, y, this.canvasWidth, this.canvasHeight);
    this.fuelCells.set(newFuelCell.id, newFuelCell);
    this.collisionSystem.insert(newFuelCell.collisionShape);
    this.io.in(this.name).emit("item_create", newFuelCell.getData());
    return;
  }

  public removeFuelCell(obj: FuelCell): void {
    this.collisionSystem.remove(obj.collisionShape);
    this.fuelCells.delete(obj.id);
    this.io.in(this.name).emit("item_remove", obj.getData());
    return;
  }

  private fillWStations(): void {
    for (let i:number = 0; i < this.stationsMax; i++) {
      this.addSpaceStation();
    }
    return;
  }

  private fillWAsteroids(): void {
    for (let i:number = 0; i < this.asteroidsMax; i++) {
      this.addAsteroid();
    }
    return;
  }

  private fillWFuelCells(): void {
    for (let i:number = 0; i < this.fuelCellsMax; i++) {
      this.addFuelCell();
    }
    return;
  }

  public playerInRoom(username: string): boolean {
    let response = false;
    this.players.forEach((value: Player, key: string) => {
      if (value.username == username) {
        response = true;
      }
    });
    return response;
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
