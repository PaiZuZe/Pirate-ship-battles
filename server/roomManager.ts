////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                            Server - RoomManager                            //
////////////////////////////////////////////////////////////////////////////////

import { Room } from './room';
import * as socketIO from 'socket.io';

export class RoomManager {
  public rooms: Room[];
  private io: socketIO.Server;
  public roomMap: Map<string, string> = new Map<string, string>(); 
 
  constructor(io: socketIO.Server) {
    this.io = io;
    this.rooms = [new Room(this.io, 0), new Room(this.io, 1)];
  }

  private searchRoom(roomName: string): Room {
    let playerRoom: Room;
    this.rooms.some((room: Room, index: number) => {
      if (room.name == roomName) {
        playerRoom = room;
        return true;
      }
    });
    if (playerRoom == null) {
      throw new Error("could not locate room");
      return;
    }
  
    return playerRoom;
  }

  public getPlayerRoom(playerID: string): Room {
    let playerRoomName: string = this.roomMap.get(playerID);
    if (playerRoomName == null) {
			console.log("could not locate player");
			return null;
    }
     
    return this.searchRoom(playerRoomName);
  }

  public pickRandomRoom(playerId: string): string {
    this.roomMap.set(playerId, this.rooms[0].name);
    // TODO: Improve this algorithm
    return this.rooms[0].name;
  }

  public pickRoom(playerId: string, roomId: number): string {
    console.log(roomId);
    this.roomMap.set(playerId, this.rooms[roomId -1].name);
    return this.rooms[roomId -1].name;
  }
}