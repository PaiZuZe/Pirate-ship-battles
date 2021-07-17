////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                             Server - AppServer                             //
////////////////////////////////////////////////////////////////////////////////

import * as path from "path";
import { Pool, Client } from "pg";
import * as express from "express";
import * as socketIO from "socket.io";
import { RoomManager } from "./roomManager";
import { createServer, Server } from "http";

export class AppServer {
  private app: express.Application;
  private server: Server;
  private io: socketIO.Server;
  private roomManager: RoomManager;
  private readonly port: number = 2000;

  constructor() {
    this.createApp();
    this.createServer();
    this.setClient();
    this.initializeSockets();
    this.listen();
    this.initializeRoomManager();
  }

  private createApp(): void {
    this.app = express();
  }

  private createServer(): void {
    // TODO: Error checking, must initialize server before
    this.server = createServer(this.app);
  }

  private setClient(): void {
    // TODO: Error checking, must initialize app before
    this.app.get("/", function(req, res) {
      res.sendFile(path.normalize(__dirname + "/..") + "/index.html");
    });
    this.app.use(
      "/client",
      express.static(path.normalize(__dirname + "/..") + "/client")
    );
  }

  private initializeSockets(): void {
    // TODO: Error checking, must initialize server before
    this.io = socketIO(this.server);
  }

  private initializeRoomManager(): void {
    // TODO: Error checking, must initialize sockets before
    this.roomManager = new RoomManager(this.io);
  }

  private listen(): void {
    // TODO: Error checking, must initialize server and io before
    this.server.listen(
      {
        host: "0.0.0.0",
        port: this.port,
        exclusive: true
      },
      () => {
        console.log("Running server on port %s", this.port);
      }
    );

    this.io.on("connect", (socket: any) => {
      socket.join("login");
      socket.on("enter_name", this.onEntername.bind(this, socket));
      socket.on(
        "logged_in",
        function(data) {
          this.io.emit("enter_game", {
            username: data.username,
            shipname: data.shipname
          });
          socket.leave("login");
          console.log(data);
          socket.join(this.roomManager.pickRoom(socket.id, data.room));
        }.bind(this)
      );
      //socket.on("selected_ship", this.onSelectedShip.bind(this, socket))
      socket.on("new_player", this.onNewPlayer.bind(this, socket));
      socket.on("input_fired", this.onInputFired.bind(this, socket));
      socket.on("disconnect", this.onClientDisconnect.bind(this, socket));
    });
  }

  // Called when someone enters its names
  private onEntername(socket: any, data: any): void {
    console.log(
      `Received joinning request from ${socket.id}, size: ${data.config.width}:${data.config.height}`
    );
    if (data.username.length <= 0) {
      this.io.emit("throw_error", { message: "Name can't be null" });
    } else if (data.username.length >= 15) {
      this.io.emit("throw_error", { message: "Name is too long" });
    } else if (this.playerInGame(data.username)) {
      this.io.emit("throw_error", { message: "Player in game" });
    } else if (data.username.length > 0 && data.username.length < 15) {
      socket.emit("join_game", {
        username: data.username,
        id: socket.id,
        password: data.password
      });
    }
  }

  /* Called when the ship is selected
  private onSelectedShip(socket: any, data: any): void {
    this.roomManager
  } */

  // Called when a new player connects to the server
  private onNewPlayer(socket: any, data: any): void {
    /* We do this verification because dead players that are in login page call this function
     * when a new player joins the game for some obscure reason, which makes the server crash.
     * See issue #22 on Github.
     */
    if (!this.io.sockets.adapter.sids[socket.id]["login"]) {
      try {
        this.roomManager.getPlayerRoom(socket.id).addNewPlayer(socket, data);
      } catch (err) {
        console.log(err);
      }
    }
  }

  public onClientDisconnect(socket: any): void {
    let playerRoom = this.roomManager.getPlayerRoom(socket.id);
    if (playerRoom != null) {
      playerRoom.disconnectPlayer(socket.id);
    }
  }

  private playerInGame(username: string): boolean {
    for (let i: number = 0; i < this.roomManager.rooms.length; ++i) {
      if (this.roomManager.rooms[i].playerInRoom(username)) {
        return true;
      }
    }
    return false;
  }

  // Called when someone fired an input
  private onInputFired(socket: any, data: any): void {
    try {
      this.roomManager.getPlayerRoom(socket.id).updatePlayerInput(socket, data);
    } catch (err) {
      console.log(err);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}
