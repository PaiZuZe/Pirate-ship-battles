////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                         Server - CollisionHandler                          //
////////////////////////////////////////////////////////////////////////////////

import { Room } from './room';
import { Player } from './player';
import { DamageArtefact } from './damageArtefact';
import { SpaceStation } from './spaceStation';
import { FuelCell } from './fuelCell';


export function collisionHandler(room: Room, obj1: any, obj2: any, obj1Type: string, obj2Type: string): void {
    if (obj1Type == 'Player' && obj2Type == 'Player') {
      collidePlayers(room, obj1, obj2);
    }
    else if (obj1Type == 'DamageArtefact' && obj2Type != 'DamageArtefact') {
      collideDamageArtefact(room, obj1, obj2);
    }
    else if (obj1Type != 'DamageArtefact' && obj2Type == 'DamageArtefact') {
      collideDamageArtefact(room, obj2, obj1);
    }
    else if (obj1Type == 'Player' && obj2Type == 'SpaceSationRest') {
      collideRestoration(obj1, obj2);
    }
    else if (obj1Type == 'SpaceSationRest' && obj2Type == 'Player') {
      collideRestoration(obj2, obj1);
    }
    else if (obj1Type == 'Player' && obj2Type == 'SpaceSationCol') {
      collideStation(room, obj1);
    }
    else if (obj1Type == 'SpaceSationCol' && obj2Type == 'Player') {
      collideStation(room, obj2);
    }
    else if (obj1Type == 'Player' && obj2Type == 'Asteroid') {
      collideAsteroid(room, obj1);
    }
    else if (obj1Type == 'Asteroid' && obj2Type == 'Player') {
      collideAsteroid(room, obj2);
    }
    else if (obj1Type == 'Player' && obj2Type == 'FuelCell') {
      collideFuelCell(room, obj1, obj2);
    }
    else if (obj1Type == 'FuelCell' && obj2Type == 'Player') {
      collideFuelCell(room, obj2, obj1);
    }
    return;
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

function collidePlayers(room: Room, p1: Player, p2: Player): void {
  room.removePlayer(p1);
  room.removePlayer(p2);
  return;
}

function collideDamageArtefact(room: Room, artefact: DamageArtefact, obj: any): void {
  var signal: string;
  signal = artefact.applyEffect(obj);
  if (signal != null) {
    room.io.in(room.name).emit(signal, obj.getData());
  }
  return;
}

function collideRestoration(player: Player, station: SpaceStation): void {
  station.updateCounter(player);
  return;
}

function collideStation(room: Room, player: Player): void {
  room.removePlayer(player);
  return;
}

function collideAsteroid(room: Room, player: Player): void {
  room.removePlayer(player);
  return;
}

function collideFuelCell(room: Room, player: Player, cell: FuelCell): void {
  cell.giveResource(player);
  room.removeFuelCell(cell);
  return;
}