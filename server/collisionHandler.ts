////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                         Server - CollisionHandler                          //
////////////////////////////////////////////////////////////////////////////////

import { Room } from './room';
import { Player } from './player';

export default function (room: Room, obj1: any, obj2: any, obj1Type: string, obj2Type: string) {
    if (obj1Type == 'Player' && obj2Type == 'Player') {
      collidePlayers(room, obj1, obj2);
    }
}

function collidePlayers(room: Room, p1: Player, p2: Player) {
  room.removePlayer(p1);
  room.removePlayer(p2);
}