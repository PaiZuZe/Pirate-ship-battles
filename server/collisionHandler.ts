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
import { DebrisField } from './debrisField';
import { ScoreBoard } from './scoreBoard';


export function collisionHandler(room: Room, obj1: any, obj2: any, obj1Type: string, obj2Type: string): void {
    if (obj1Type == 'Player' && obj2Type == 'Player') {
      collidePlayers(room, obj1, obj2);
    }
    else if (obj1Type == 'DamageArtefact') {
      if (obj2Type == 'Player' || obj2Type == 'Asteroid' || obj2Type == 'Bot')
        collideDamageArtefact(room, obj1, obj2);
    }
    else if (obj1Type != 'DamageArtefact' && obj2Type == 'DamageArtefact') {
      if (obj1Type == 'Player' || obj1Type == 'Asteroid' || obj1Type == 'Bot')
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
    else if (obj1Type == 'Player' && obj2Type == 'DebrisField') {
      collideDebrisField(obj1, obj2);
    }
    else if (obj1Type == 'DebrisField' && obj2Type == 'Player') {
      collideDebrisField(obj2, obj1);
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
  p1.hp = 0;
  p2.hp = 0;
  return;
}

function collideDamageArtefact(room: Room, artefact: DamageArtefact, obj: any): void {
  var signal: string;
  signal = artefact.applyEffect(obj, 1);
  if (signal != null) {
    if (obj.hp <= 0) {
      obj.killedBy = artefact.creator;
    }
    room.io.in(room.name).emit(signal, obj.getData());
  }
  return;
}

function collideRestoration(player: Player, station: SpaceStation): void {
  station.updateCounter(player);
  return;
}

function collideStation(room: Room, player: Player): void {
  player.hp = 0;
  return;
}

function collideAsteroid(room: Room, player: Player): void {
  player.hp = 0;
  return;
}

function collideFuelCell(room: Room, player: Player, cell: FuelCell): void {
  cell.giveResource(player);
  cell.hp = 0;
  return;
}

function collideDebrisField(player: Player, field: DebrisField): void {
  field.updateCounter(player);
  return;
}
