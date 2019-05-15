////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                            Server - RoomManager                            //
////////////////////////////////////////////////////////////////////////////////

import { Room } from './room';
import * as socketIO from 'socket.io';

export class RoomManager {
  private rooms: Room[];
  private io: socketIO.Server;
  public roomMap: Map<String, String> = new Map<String, String>(); 
 
  constructor(io: socketIO.Server) {
    this.io = io;
    this.rooms = [new Room(this.io, 0)];
  }

  private searchRoom(roomName: String): Room {
    for (let i: number = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].name == roomName) return this.rooms[i];
    }
    return;
  }

  public pickRandomRoom(playerId: String): String {
    this.roomMap.set(playerId, this.rooms[0].name);
    return this.rooms[0].name;
  }

  public newPlayer(socket: any, data: any): void {
    let playerRoomName: String = this.roomMap.get(socket.id);
    if (playerRoomName == null) {
			console.log("Error: could not locate player room.");
			return;
		}
		let playerRoom = this.searchRoom(playerRoomName);
		if (playerRoom == null) {
			console.log("Error: could not locate player room.");
			return;
    }
    
		playerRoom.newPlayer(socket, data);
  }
  
  public inputFired(socket: any, data: any): void {
    let playerRoomName: String = this.roomMap.get(socket.id);
    if (playerRoomName == null) {
			console.log("Error: could not locate player room2453.");
			return;
		}
		let playerRoom = this.searchRoom(playerRoomName);
		if (playerRoom == null) {
			console.log("Error: could not locate player room.");
			return;
    }
		playerRoom.inputFired(socket, data);
  }
}