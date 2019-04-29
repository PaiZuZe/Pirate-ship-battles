////////////////////////////////////////////////////////////////////////////////
//                            Space  Ship Battles                             //
//                                                                            //
//                             Server - AppServer                             //
////////////////////////////////////////////////////////////////////////////////

import { createServer, Server } from 'http';
import { Pool, Client } from 'pg';
import * as express from 'express';
import * as socketIO from 'socket.io';
import * as path from 'path';

export class AppServer {
  private app: express.Application; 
  private server: Server;
  private io: socketIO.Server;
  private readonly port: number = 2000;

  constructor() {
    this.createApp();
    this.createServer(); 
    this.setClient();
    this.sockets(); 
    this.listen();   
  }

  private createApp(): void {
    this.app = express();
  }

  private createServer(): void {
    this.server = createServer(this.app);
  }

  private setClient(): void {
    this.app.get('/', function (req, res) {
      res.sendFile(path.normalize(__dirname + "/..") + '/index.html');
    });
    this.app.use('/client', express.static(path.normalize(__dirname + "/..") + '/client'));
  }

  private sockets(): void {
    this.io = socketIO(this.server);
  }

  private listen(): void {
    this.server.listen({
      host: '0.0.0.0',
      port: this.port,
      exclusive: true
      }, () => {
        console.log('Running server on port %s', this.port)}
      );

    this.io.on('connect', (socket: any) => {
      socket.join('login');
      socket.on('enter_name', this.onEntername);
      socket.on('logged_in', function(data) {
        this.emit('enter_game', {username: data.username});
        socket.leave('login');
        socket.join('game');
      });
      //socket.on("new_player", onNewPlayer);
      //socket.on("input_fired", onInputFired);
      
      socket.on('disconnect', () => {   //socket.on('disconnect', onClientDisconnect);
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

  ////////////////////////////////////////////////////////////////////////////////
  // Called after the player entered its name
  private onEntername (data): void {
    console.log(`Received joinning request from ${this.id}, size: ${data.config.width}:${data.config.height}`);
    if (data.username.length > 0 && data.username.length < 15) {
      let pool = this.createPool();
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
        //.catch(err => this.emit('throw_error', {message: "Player already exists or wrong password"}))
        .finally(() => pool.end());
    }
    else if (data.username.length <= 0)
      this.emit('throw_error', {message: "Name can't be null"});
    else if (data.username.length >= 15)
      this.emit('throw_error', {message: "Name is too long"});
  }
  
  public getApp(): express.Application {
    return this.app;
  }
}