////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                             Server - AppServer                             //
////////////////////////////////////////////////////////////////////////////////

import * as path from 'path';
import { Pool, Client } from 'pg';
import * as express from 'express';
import * as socketIO from 'socket.io';
import { RoomManager } from './roomManager';
import { createServer, Server } from 'http';

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
    this.app.get('/', function (req, res) {
      res.sendFile(path.normalize(__dirname + "/..") + '/index.html');
    });
    this.app.use('/client', express.static(path.normalize(__dirname + "/..") + '/client'));
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
    this.server.listen({
      host: '0.0.0.0',
      port: this.port,
      exclusive: true
      }, () => {
        console.log('Running server on port %s', this.port)}
      );

    this.io.on('connect', (socket: any) => {
      socket.join('login');
      socket.on('enter_name', this.onEntername.bind(this, socket));
      socket.on('logged_in', function(data) { 
        this.io.emit('enter_game', {username: data.username});
        socket.leave('login');
        socket.join(this.roomManager.pickRandomRoom(socket.id));
      }.bind(this));
      socket.on("new_player", this.onNewPlayer.bind(this, socket));
      socket.on("input_fired", this.onInputFired.bind(this, socket));
      
      socket.on('disconnect', () => {  
        console.log('Client disconnected');
      });
    });
  }

  private createPool(): Pool {
    const pool: Pool = new Pool({
      user: 'postgres',
      host: 'postgres',
      database: 'ssb',
      password: 'postgress',
      port: 5432,
    })
    return pool;
  }

  // Called when someone enters its names
  private onEntername (socket: any, data: any): void {                        
    console.log(`Received joinning request from ${socket.id}, size: ${data.config.width}:${data.config.height}`);
    if (data.username.length > 0 && data.username.length < 15) {
      let pool: Pool = this.createPool();
      pool.query('INSERT INTO players(name, password) VALUES($1, $2)', [data.username, data.password])
        .then((res) => socket.emit('join_game', { username: data.username, id: socket.id, password: data.password }))
        .catch(err => {
          pool.query('SELECT password FROM players WHERE name = $1', [data.username])
            .then((res) => {
              if (res.rows[0].password == data.password)
                socket.emit('join_game', { username: data.username, id: socket.id, password: data.password });
              else socket.emit('throw_error', { message: "Player already exists or wrong password" });
            });
        })
        .finally(() => pool.end());
    }
    else if (data.username.length <= 0)
      this.io.emit('throw_error', { message: "Name can't be null" });
    else if (data.username.length >= 15)
      this.io.emit('throw_error', { message: "Name is too long" });
  }

  // Called when a new player connects to the server
  private onNewPlayer(socket: any, data: any): void {
    this.roomManager.newPlayer(socket, data);
  }

  // Called when someone fired an input
  private onInputFired (socket: any, data: any): void {
    this.roomManager.inputFired(socket, data)
  }

  public getApp(): express.Application {
    return this.app;
  }
}