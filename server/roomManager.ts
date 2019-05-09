////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                            Server - RoomManager                            //
////////////////////////////////////////////////////////////////////////////////

import { Room } from './room';

export class RoomManager {
    
    private rooms: Room[];
    private static instance: RoomManager = new RoomManager();
 
    private constructor() {
        if (RoomManager.instance){
            throw new Error("Error: Instantiation failed: Use RoomManager.getInstance() instead of new.");
        }
        RoomManager.instance = this;
        this.rooms = [new Room(0)];
    }
 
    public static getInstance(): RoomManager {
        return RoomManager.instance;
    }

    public getRoom(): String {
        return this.rooms[0].name;
    }
}