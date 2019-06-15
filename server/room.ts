////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                                Server - Room                               //
////////////////////////////////////////////////////////////////////////////////

import { GameObject } from './gameObject';
import { Player } from './player';
import { SpaceStation } from './spaceStation';
import { Asteroid } from './asteroid';
import { FuelCell } from './fuelCell';
import { Bot } from './bot';
import { DebrisField } from './debrisField';
import { DamageArtefact, PrimaryFire } from './damageArtefact';
import { ScoreBoard } from './scoreBoard';
import { Collisions, Polygon } from './collisions/Collisions'
import { collisionHandler, isColliding }  from './collisionHandler';
import * as socketIO from 'socket.io';
import { mapFloatToInt } from './aux';

const UPDATE_TIME = 0.06; // sec
const BULLET_LIFETIME = 5000; // ms

export class Room {
  public readonly name: string; 
  // Game Elements
  private gameObjects: Map<string, GameObject> = new Map<string, GameObject>();

  private players: Map<string, Player> = new Map<string, Player>();
  private bots: Map<string, Bot> = new Map<string, Bot>();  
  private scoreBoard: ScoreBoard; // The list of scores form active players
  public io: socketIO.Server;
  
  // Game Properties
  private fuelCellsMax: number = 15; 
  private fuelCellsCount: number = 0;
  private botsMax: number = 1;
  private botsCount: number = 0;  
  private debrisFieldsMax: number = 3;
  private debrisFieldsCount: number = 0;  
  private stationsMax: number = 5; 
  private stationsCount: number = 0;  
  private asteroidsMax: number = 10;  
  private asteroidsCount: number = 0;  
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

  private getObj(objId: string, objType: string): any {
    if (objType == 'Player') {
      return this.players.get(objId);
    }
    else if (objType == "Bot") {
      return this.bots.get(objId);
    }
    else {
      return this.gameObjects.get(objId);
    }
  }

  private getPlayersInfo(): any {
    let playerData: any = {}
    this.players.forEach((value: Player, key: string) => {
      playerData[key] = value.getData();
    });

    return playerData;
  }

  private getBotsInfo(): any {
    let botData: any = {}
    this.bots.forEach((value: Bot, key: string) => {
      botData[key] = value.getData();
    });

    return botData;
  }

  private getDamageArtefactsInfo(): any {
    let artefactData: any = {};
    this.gameObjects.forEach((value: DamageArtefact, key: string) => {
      if (value.collisionShape.type == "DamageArtefact") {
        artefactData[key] = value.getData();
      }
    });
    return artefactData;
  }

  private updateObjects(): void {
    if(this.gameObjects) {
      this.gameObjects.forEach((value: GameObject, key: string) => {
        value.updatePos(UPDATE_TIME);
        const potentials = value.collisionShape.potentials();
        for (const body of potentials) {
          if (value.collisionShape.collides(body)) {
            collisionHandler(this, value, this.getObj(body.id, body.type), value.collisionShape.type, body.type);
          }
        }
      });
    }
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

  private updateBots(): void {
    if (this.bots) {
      this.bots.forEach((value: Bot, key: string) => {
        value.takeAction(this.players);
      });
    }
    return;
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
              this.gameObjects.set(temp[i].id, temp[i]);
              this.collisionSystem.insert(temp[i].collisionShape);
              this.io.in(this.name).emit("bullet_create", temp[i].getData());
            }
          }
        }      
      });
    }
  }

  public updateGame(): void { 
    this.fillWStations();
    this.fillWAsteroids();
    this.fillWFuelCells();
    this.fillWBots();
    this.fillWDebrisFields();
    this.updatePlayers();
    this.updateBots();
    this.updateObjects();
    this.createDamageArtefacts();
    let scoreBoard: any = this.scoreBoard.asObj();
    this.collisionSystem.update();
    this.gameObjects.forEach((value: GameObject, key: string) => {
      if (value.hp <= 0 && value.collisionShape.type == "Asteroid") {
        this.removeAsteroid(value); 
      }
    });
    this.bots.forEach((value: Bot, key: string) => {
      if (value.hp <= 0) {
        this.removeBot(value); 
      }
    });
    this.players.forEach((value: Player, key: string) => {
      if (value.hp <= 0) {
        this.removePlayer(value); 
      }
    });
    this.io.in(this.name).emit("update_game", 
                               {playerList: {...this.getPlayersInfo(), ...this.getBotsInfo()},
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
    this.gameObjects.forEach((value: GameObject, key: string) => {
      if (value.collisionShape.type == "Asteroid") {
        socket.emit("stone_create", value.getData());
      } 
      else if (value.collisionShape.type == "FuelCell") {
        socket.emit("item_create", value.getData());  
      }
      else if (value.collisionShape.type == "SpaceSationCol") {
        socket.emit("island_create", value.getData());  
      }
      else if (value.collisionShape.type == "DebrisField") {
        socket.emit("debris_create", value.getData());
      }
      else if (value.collisionShape.type == "DamageArtefact") {
        socket.emit("bullet_create", value.getData());  
      }
    });
    this.bots.forEach((value: Bot, key: string) => {
      socket.emit("new_enemyPlayer", value.getData());  
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
    let newSpaceSatition = new SpaceStation(x, y, 100, "life", 1, 180);
    this.gameObjects.set(newSpaceSatition.id, newSpaceSatition);
    this.collisionSystem.insert(newSpaceSatition.restorationShape);
    this.collisionSystem.insert(newSpaceSatition.collisionShape);
    this.io.in(this.name).emit("island_create", newSpaceSatition.getData());
    this.stationsCount++;
    return;
  }

  private addAsteroid(): void {
    let x = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasWidth - 250);
    let y = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasHeight - 250);
    let newAsteroid = new Asteroid(x, y, this.canvasWidth, this.canvasHeight);
    this.gameObjects.set(newAsteroid.id, newAsteroid);
    this.collisionSystem.insert(newAsteroid.collisionShape);
    this.io.in(this.name).emit("stone_create", newAsteroid.getData());
    this.asteroidsCount++;
    return;
  }

  public removeAsteroid(obj: GameObject): void {
    this.collisionSystem.remove(obj.collisionShape);
    this.gameObjects.delete(obj.id);
    this.io.in(this.name).emit("remove_stone", obj.getData());
    this.asteroidsCount--;
    return;
  }

  private addFuelCell(): void {
    let x = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasWidth - 250);
    let y = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasHeight - 250);
    let newFuelCell = new FuelCell(x, y, this.canvasWidth, this.canvasHeight);
    this.gameObjects.set(newFuelCell.id, newFuelCell);
    this.collisionSystem.insert(newFuelCell.collisionShape);
    this.io.in(this.name).emit("item_create", newFuelCell.getData());
    this.fuelCellsCount++;
    return;
  }

  public removeFuelCell(obj: GameObject): void {
    this.collisionSystem.remove(obj.collisionShape);
    this.gameObjects.delete(obj.id);
    this.io.in(this.name).emit("item_remove", obj.getData());
    this.fuelCellsCount--;
    return;
  }

  private addBot(): void {
    let x = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasWidth - 250);
    let y = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasHeight - 250);
    let newBot = new Bot(x, y);
    this.bots.set(newBot.id, newBot);
    this.collisionSystem.insert(newBot.collisionShape);
    this.io.in(this.name).emit("new_enemyPlayer", newBot.getData());
    this.botsCount++;
    return;
  }

  public removeBot(obj: Bot): void {
    this.collisionSystem.remove(obj.collisionShape);
    this.bots.delete(obj.id);
    this.io.in(this.name).emit("remove_player", obj.getData());
    this.botsCount--;
    return;
  }

  private addDerbisField(): void {
    let x = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasWidth - 250);
    let y = mapFloatToInt(Math.random(), 0, 1, 250, this.canvasHeight - 250);
    let r = 100 + Math.ceil(Math.random()*250);

    let newDerbisField = new DebrisField(x, y, r, r - 50);
    this.gameObjects.set(newDerbisField.id, newDerbisField);
    this.collisionSystem.insert(newDerbisField.collisionShape);
    this.io.in(this.name).emit("debris_create", newDerbisField.getData());
    this.debrisFieldsCount++;
    return;
  }

  private fillWStations(): void {
    for (let i:number = this.stationsCount; i < this.stationsMax; i++) {
      this.addSpaceStation();
    }
    return;
  }

  private fillWAsteroids(): void {
    for (let i:number = this.asteroidsCount; i < this.asteroidsMax; i++) {
      this.addAsteroid();
    }
    return;
  }

  private fillWFuelCells(): void {
    for (let i:number = this.fuelCellsCount; i < this.fuelCellsMax; i++) {
      this.addFuelCell();
    }
    return;
  }

  private fillWBots(): void {
    for (let i:number = this.botsCount; i < this.botsMax; i++) {
      this.addBot();
    }
    return;
  }

  private fillWDebrisFields(): void {
    for (let i:number = this.debrisFieldsCount; i < this.debrisFieldsMax; i++) {
      this.addDerbisField();
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
