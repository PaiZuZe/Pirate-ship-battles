////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                         Server - CollisionHandler                          //
////////////////////////////////////////////////////////////////////////////////

import { Room } from './room';
import { Player } from './player';
import { DamageArtefact } from './damageArtefact';

export function collisionHandler(room: Room, obj1: any, obj2: any, obj1Type: string, obj2Type: string) {
    if (obj1Type == 'Player' && obj2Type == 'Player') {
      collidePlayers(room, obj1, obj2);
    }
    else if (obj1Type == 'DamageArtefact' && obj2Type != 'DamageArtefact') {
      collideDamageArtefact(room, obj1, obj2);
    }
    else if (obj1Type != 'DamageArtefact' && obj2Type == 'DamageArtefact') {
      collideDamageArtefact(room, obj2, obj1);
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

function collideDamageArtefact(room: Room, artefact: DamageArtefact, obj: any): void {
  var signal: string;
  signal = artefact.applyEffect(obj);
  if (signal != null) {
    room.io.in(room.name).emit(signal, obj.getData());
  }
  return;
}
