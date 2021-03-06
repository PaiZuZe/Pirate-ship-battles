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
import { AmmoPack } from './ammoPack';
import { Bot } from './bot';
import { DebrisField } from './debrisField';
import { DamageArtefact, PrimaryFire, EnergyBall } from './damageArtefact';
import { ScoreBoard } from './scoreBoard';
import { Collisions, Polygon } from './collisions/Collisions'
import { collisionHandler, isColliding }  from './collisionHandler';
import * as socketIO from 'socket.io';
import { mapFloatToInt, getRndInteger } from './aux';
import { Agent } from './agent';

const UPDATE_TIME = 0.06; // sec

export class Room {
  public readonly name: string;
  // Game Elements
  public gameObjects: Map<string, GameObject> = new Map<string, GameObject>();
  private scoreBoard: ScoreBoard; // The list of scores form active players
  public io: socketIO.Server;

  // Game Properties
  private fuelCellsMax: number = 15;
  private fuelCellsCount: number = 0;
  private ammoPacksMax: number = 8;
  private ammoPacksCount: number = 0;
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
  private spawnCollisionSystem: Collisions;

  constructor(io: socketIO.Server, num: number) {
      this.io = io;
      this.name = 'room' + num;
      this.scoreBoard = new ScoreBoard();
      this.collisionSystem = new Collisions();
      this.collisionSystem.update(); // MAYBE WE DON'T NEED THIS HERE??
      this.spawnCollisionSystem = new Collisions();
      this.spawnCollisionSystem.update();
      setInterval(this.updateGame.bind(this), 1000 * UPDATE_TIME);
  }

  private getPlayersInfo(): any {
    let playerData: any = {}
    this.gameObjects.forEach((value: GameObject, key: string) => {
      if (value.collisionShape.type == "Player") {
        playerData[key] = value.getData();
      }
    });

    return playerData;
  }

  private getBotsInfo(): any {
    let botData: any = {}
    this.gameObjects.forEach((value: GameObject, key: string) => {
      if (value.collisionShape.type == "Bot") {
        botData[key] = value.getData();
      }
    });

    return botData;
  }

  private getDamageArtefactsInfo(): any {
    let artefactData: any = {};
    this.gameObjects.forEach((value: GameObject, key: string) => {
      if (value.collisionShape.type == "DamageArtefact") {
        artefactData[key] = value.getData();
      }
    });
    return artefactData;
  }

  private updateObjects(): void {
    if(this.gameObjects) {
      this.gameObjects.forEach((value: GameObject, key: string) => {
        value.updatePos(UPDATE_TIME, this.collisionSystem);
        const potentials = value.collisionShape.potentials();
        for (const body of potentials) {
          if (value.collisionShape.collides(body)) {
            collisionHandler(this, value, this.gameObjects.get(body.id), value.collisionShape.type, body.type);
          }
        }
      });
    }
  }

  private updateBots(): void {
    let damageArtefacts: DamageArtefact[];
    if (this.gameObjects) {
      this.gameObjects.forEach((value: Bot, key: string) => {
        if (value.collisionShape.type == "Bot") {
          damageArtefacts = value.takeAction(this.gameObjects, this.collisionSystem);
          if (damageArtefacts != null) {
            for (let i: number = 0; i < damageArtefacts.length; ++i) {
              this.createDamageArtefact(damageArtefacts[i]);
            }
          }
        }
      });
    }
    return;
  }

  /*Beware here there be gambis*/
  private createDamageArtefacts(): void {
    let temp: DamageArtefact[] = null;
    if (this.gameObjects) {
      this.gameObjects.forEach((value: GameObject, key: string) => {
        if (!this.gameObjects.has(key)) {
          return;
        }
        if (value.collisionShape.type != "Player") {
          return;
        }
        let player = value as Player;
        if (player.inputs.primaryFire) {
          temp = player.primaryFire();
        }
        else if (player.inputs.secondaryFire) {
          temp = player.secondaryFire();
        }
        if (temp == null) {
          return;
        }
        for (let i: number = 0; i < temp.length; ++i) {
          this.createDamageArtefact(temp[i]);
        }
      });
    }
    return;
  }

  public createDamageArtefact(damageArtefact: DamageArtefact): void {
    if (this.gameObjects.has(damageArtefact.id)) {
      return;
    }
    this.gameObjects.set(damageArtefact.id, damageArtefact);
    this.insertInDefinedPosition(damageArtefact);
    this.io.in(this.name).emit(damageArtefact.signal, damageArtefact.getData());
    return;
  }

  public removeDamageArtefact(artefact: GameObject): void {
    this.removeFromCollisionSystem(artefact);
    this.io.in(this.name).emit("bullet_remove", artefact.getData());
    this.gameObjects.delete(artefact.id);
    return;
  }

  private insertInRandomPosition(gameObject: GameObject): void {
    this.spawnCollisionSystem.insert(gameObject.spawnToleranceShape);
    while (isColliding(gameObject.spawnToleranceShape)) {
      gameObject.setPos(getRndInteger(0, this.canvasWidth), getRndInteger(0, this.canvasHeight));
      this.spawnCollisionSystem.update();
    }
    this.collisionSystem.insert(gameObject.collisionShape);
    return;
  }

  private insertInDefinedPosition(gameObject: GameObject): void {
    this.spawnCollisionSystem.insert(gameObject.spawnToleranceShape);
    this.collisionSystem.insert(gameObject.collisionShape);
    return;
  }

  private removeFromCollisionSystem(gameObject: GameObject): void {
    this.spawnCollisionSystem.remove(gameObject.spawnToleranceShape);
    this.collisionSystem.remove(gameObject.collisionShape);
    return;
  }

  public updateGame(): void {
    this.fillWStations();
    this.fillWAsteroids();
    this.fillWFuelCells();
    this.fillWAmmoPacks();
    this.fillWBots();
    this.fillWDebrisFields();
    this.updateBots();
    this.updateObjects();
    this.createDamageArtefacts();
    this.removeDeadObjects();
    this.collisionSystem.update();
    let scoreBoard: any = this.scoreBoard.asObj();
    this.io.in(this.name).emit("update_game",
                               {playerList: {...this.getPlayersInfo(), ...this.getBotsInfo()},
                                bulletList: this.getDamageArtefactsInfo(),
                                score_board: scoreBoard});
  }

  public removeDeadObjects() {
    this.gameObjects.forEach((value: GameObject, key: string) => {
      if (value.hp <= 0) {
        if (value.killedBy != null) {
          let temp: GameObject = this.gameObjects.get(value.killedBy);
          let player: Player;
          if (temp != null && temp != undefined && temp.constructor.name == "Player") {
            player = temp as Player;
            this.scoreBoard.updateScore(player.username);
          }
        }
        //Note, this can break if the object has a name field or we use minifie.
        if (value.constructor.name == "Asteroid") {
          this.removeAsteroid(value);
        }
        else if (value.constructor.name == "Bot") {
          this.removeBot(value as Bot);
        }
        else if (value.constructor.name == "Player") {
          this.removePlayer(value);
        }
        else if (value.constructor.name == "FuelCell") {
          this.removeFuelCell(value);
        }
        else if (value.constructor.name == "AmmoPack") {
          this.removeAmmoPack(value);
        }
      }
      //Only works for Primary Fire
      if (value.constructor.name == "PrimaryFire") {
        let damageArtefact = value as PrimaryFire;
        if (damageArtefact.hp <= 0 || damageArtefact.vanish()) {
          this.removeDamageArtefact(damageArtefact);
        }
      }
      else if (value.constructor.name == "EnergyBall") {
        let damageArtefact = value as EnergyBall;
        if (damageArtefact.hp <= 0 || damageArtefact.vanish()) {
          this.removeDamageArtefact(damageArtefact);
        }
      }
    });
  }

  public addNewPlayer(socket: any, data: any): void {
    if (this.gameObjects.get(socket.id)) {
      console.log(this.name + " : " + `Player with id ${socket.id} already exists`);
      return;
    }

    let newPlayer = new Player(getRndInteger(0, this.canvasWidth), getRndInteger(0, this.canvasHeight),
                   0, socket.id, data.username, data.shipname);
    this.gameObjects.set(socket.id, newPlayer);
    this.scoreBoard.addPlayer(data.username);
    socket.emit('create_player', newPlayer.getData());
    this.insertInRandomPosition(newPlayer);
    this.gameObjects.forEach((value: GameObject, key: string) => {
      if (value.collisionShape.type == "Player" && value != newPlayer) {
        socket.emit("new_enemyPlayer", value.getData());
      }
      else if (value.collisionShape.type == "Asteroid") {
        socket.emit("asteroid_create", value.getData());
      }
      else if (value.collisionShape.type == "FuelCell") {
        socket.emit("cell_create", value.getData());
      }
      else if (value.collisionShape.type == "AmmoPack") {
        socket.emit("ammo_create", value.getData());
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
      else if (value.collisionShape.type == "Bot") {
        socket.emit("new_enemyPlayer", value.getData());
      }
    });

    console.log(this.name + " : " + "Created new player with id " + socket.id + " with username = " + data.username);
    // Send message to every connected client except the sender
    socket.broadcast.to(this.name).emit('new_enemyPlayer', newPlayer.getData());
  }

  public removePlayer(player: any) {
    console.log(this.name + " : " + `${player.username} died!`);
    if (this.gameObjects.has(player.id)) {
      console.log(this.name + " : " + `${player.username} was removed`);
      this.removeFromCollisionSystem(player);
      this.scoreBoard.removePlayer(player.username);
      this.io.in(this.name).emit('remove_player', {id :player.id, x: player.x, y : player.y});
      if (typeof(this.io.sockets.sockets[player.id]) !== 'undefined') {
        this.io.sockets.sockets[player.id].leave(this.name);
        this.io.sockets.sockets[player.id].join('login');
      }
      this.gameObjects.delete(player.id);
    }
    return;
  }

  public disconnectPlayer(playerID: string): void {
    if (this.gameObjects.has(playerID)) {
      this.removePlayer(this.gameObjects.get(playerID) as Player);
      console.log(this.name + " : " + "Disconnected player with ID = " + playerID);
    }
    else {
      console.log(this.name + " : " + "ERROR: Could not find player with ID = " + playerID + " in room to disconnect")
    }
  }

  private addSpaceStation(): void {
    let x = getRndInteger(0, this.canvasWidth);
    let y = getRndInteger(0, this.canvasHeight);
    let newSpaceSatition = new SpaceStation(x, y, 100, "life", 5, 180);
    this.gameObjects.set(newSpaceSatition.id, newSpaceSatition);
    this.insertInRandomPosition(newSpaceSatition);
    newSpaceSatition.restorationShape.x = newSpaceSatition.x;
    newSpaceSatition.restorationShape.y = newSpaceSatition.y;
    this.collisionSystem.insert(newSpaceSatition.restorationShape);
    this.io.in(this.name).emit("island_create", newSpaceSatition.getData());
    this.stationsCount++;
    return;
  }

  private addAsteroid(): void {
    let x = getRndInteger(0, this.canvasWidth);
    let y = getRndInteger(0, this.canvasHeight);
    let newAsteroid = new Asteroid(x, y, this.canvasWidth, this.canvasHeight);
    this.gameObjects.set(newAsteroid.id, newAsteroid);
    this.insertInRandomPosition(newAsteroid);
    this.io.in(this.name).emit("asteroid_create", newAsteroid.getData());
    this.asteroidsCount++;
    return;
  }

  public removeAsteroid(obj: GameObject): void {
    this.removeFromCollisionSystem(obj);
    this.gameObjects.delete(obj.id);
    this.io.in(this.name).emit("remove_asteroid", obj.getData());
    this.asteroidsCount--;
    return;
  }

  private addFuelCell(): void {
    let x = getRndInteger(0, this.canvasWidth);
    let y = getRndInteger(0, this.canvasHeight);
    let newFuelCell = new FuelCell(x, y, this.canvasWidth, this.canvasHeight);
    this.gameObjects.set(newFuelCell.id, newFuelCell);
    this.insertInRandomPosition(newFuelCell);
    this.io.in(this.name).emit("cell_create", newFuelCell.getData());
    this.fuelCellsCount++;
    return;
  }

  public removeFuelCell(obj: GameObject): void {
    this.removeFromCollisionSystem(obj);
    this.gameObjects.delete(obj.id);
    this.io.in(this.name).emit("cell_remove", obj.getData());
    this.fuelCellsCount--;
    return;
  }

  private addAmmoPack(): void {
    let x = getRndInteger(0, this.canvasWidth);
    let y = getRndInteger(0, this.canvasHeight);
    let newAmmoPack = new AmmoPack(x, y, this.canvasWidth, this.canvasHeight);
    this.gameObjects.set(newAmmoPack.id, newAmmoPack);
    this.insertInRandomPosition(newAmmoPack);
    this.io.in(this.name).emit("ammo_create", newAmmoPack.getData());
    this.ammoPacksCount++;
    return;
  }

  public removeAmmoPack(obj: GameObject): void {
    this.removeFromCollisionSystem(obj);
    this.gameObjects.delete(obj.id);
    this.io.in(this.name).emit("ammo_remove", obj.getData());
    this.ammoPacksCount--;
    return;
  }

  private addBot(): void {
    let x = getRndInteger(0, this.canvasWidth);
    let y = getRndInteger(0, this.canvasHeight);
    let newBot = new Bot(x, y, "Blindside");
    this.gameObjects.set(newBot.id, newBot);
    this.insertInRandomPosition(newBot);
    newBot.agro.x = newBot.x;
    newBot.agro.y = newBot.y;
    this.collisionSystem.insert(newBot.agro);
    this.io.in(this.name).emit("new_enemyPlayer", newBot.getData());
    this.botsCount++;
    return;
  }

  public removeBot(bot: Bot): void {
    this.removeFromCollisionSystem(bot);
    this.collisionSystem.remove(bot.agro);
    this.gameObjects.delete(bot.id);
    this.io.in(this.name).emit("remove_player", bot.getData());
    this.botsCount--;
    return;
  }

  private addDerbisField(): void {
    let x = getRndInteger(0, this.canvasWidth);
    let y = getRndInteger(0, this.canvasHeight);
    let r = 100 + Math.ceil(Math.random()*250);

    let newDerbisField = new DebrisField(x, y, r, r - 50);
    this.gameObjects.set(newDerbisField.id, newDerbisField);
    this.insertInDefinedPosition(newDerbisField);
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

  private fillWAmmoPacks(): void {
    for (let i:number = this.ammoPacksCount; i < this.ammoPacksMax; i++) {
      this.addAmmoPack();
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
    this.gameObjects.forEach((value: GameObject, key: string) => {
      if (value.collisionShape.type == "Player") {
        let player = value as Player;
        if (player.username == username) {
          response = true;
        }
      }
    });
    return response;
  }

  public updatePlayerInput(socket: any, data: any): void {
    let value: GameObject = this.gameObjects.get(socket.id);
    let player: Player = value as Player;
    if (!this.gameObjects.has(socket.id))
      return;

    player.inputs.up = data.up;
    player.inputs.down = data.down;
    player.inputs.left = data.left;
    player.inputs.right = data.right;
    player.inputs.primaryFire = data.primary_fire;
    player.inputs.secondaryFire = data.secondary_fire;
    player.inputs.boost = data.boost;
  }
}
