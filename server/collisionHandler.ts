////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                         Server - CollisionHandler                          //
////////////////////////////////////////////////////////////////////////////////

import { Room } from './room';
import { Player } from './player';

export function collisionHandler(room: Room, obj1: any, obj2: any, obj1Type: string, obj2Type: string) {
    if (obj1Type == 'Player' && obj2Type == 'Player') {
      collidePlayers(room, obj1, obj2);
    }
}

export function isColliding(collisionPoly: any): boolean {
  let retValue: boolean = false;
  const potentials = collisionPoly.potentials();
  potentials.some(body => {
    if (collisionPoly.collides(body)) {
      retValue = true;
      return true;
    }
  });

  return retValue;
}

function collidePlayers(room: Room, p1: Player, p2: Player) {
  room.removePlayer(p1);
  room.removePlayer(p2);
}