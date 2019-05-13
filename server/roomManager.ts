////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                            Server - RoomManager                            //
////////////////////////////////////////////////////////////////////////////////

import { Room } from './room';

export class RoomManager {
  private rooms: Room[];
  private static instance: RoomManager = new RoomManager();
  public roomMap: Map<String, String> = new Map<String, String>(); 
 
  private constructor() {
    if (RoomManager.instance)
      throw new Error("Error: Instantiation failed: Use RoomManager.getInstance() instead of new.");
    RoomManager.instance = this;
    this.rooms = [new Room(0)];
  }

  private searchRoom(roomName: String): Room {
    for (let i: number = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].name == roomName) return this.rooms[i];
    }
    return;
  }

  public static getInstance(): RoomManager {
      return RoomManager.instance;
  }

  public pickRandomRoom(playerId: String): String {
    this.roomMap.set(playerId, this.rooms[0].name);
    return this.rooms[0].name;
  }

  public newPlayer(socket: any, data: any): void {
    let playerRoomName: String = this.roomMap.get(socket.id);
    if (playerRoomName == null) {
			console.log("Error: could not locate player room1.");
			return;
		}
		let playerRoom = this.searchRoom(playerRoomName);
		if (playerRoom == null) {
			console.log("Error: could not locate player room2.");
			return;
    }
    
		playerRoom.newPlayer(socket, data);
	}
}