////////////////////////////////////////////////////////////////////////////////
//                            Space  Ship Battles                             //
//                                                                            //
//                             Server - AppServer                             //
////////////////////////////////////////////////////////////////////////////////

import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIO from 'socket.io';

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
      res.sendFile(__dirname + '/index.html');
    });
    this.app.use('/client', express.static(__dirname + '/client'));
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
      //socket.on('enter_name', onEntername);
      //socket.on('logged_in', function(data) {
        //this.emit('enter_game', {username: data.username});
        //socket.leave('login');
        //socket.join('game');
      //});
      //socket.on("new_player", onNewPlayer);
      //socket.on("input_fired", onInputFired);
      
      socket.on('disconnect', () => {   //socket.on('disconnect', onClientDisconnect);
        console.log('Client disconnected');
      });
    });
  }
  
  public getApp(): express.Application {
    return this.app;
  }
}