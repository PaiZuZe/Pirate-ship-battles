////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                           Server - SpaceStation                            //
////////////////////////////////////////////////////////////////////////////////


import { Polygon, Circle } from './collisions/Collisions';
import { Player } from './player';
import { GameObject } from './gameObject';

export class SpaceStation extends GameObject {
  public radius: number;
  public type: string;
  public resource: number;
  public threshold: number;
  public restorationShape: Circle;

  public readonly polygonPoints: number[][] = [
    [-79, -79],
    [80, -79],
    [80, 80],
    [-79, 80]
  ];

  constructor (x: number, y: number, radius: number, type: string, resource: number, threshold: number) {
    super(x, y);
    this.radius = radius;
    this.type = type;
    this.resource = resource;
    this.threshold = threshold;
    this.spawnToleranceRadius = 100;
    this.spawnToleranceShape = new Circle(this.x, this.y, this.spawnToleranceRadius);
    this.restorationShape = new Circle(this.x, this.y, 3 * radius);
    this.restorationShape.type = 'SpaceSationRest';
    this.restorationShape.id = this.id;
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints, 0, 0.95, 0.95);
    this.collisionShape.type = 'SpaceSationCol';
    this.collisionShape.id = this.id;
  }

  private giveResource (player: Player): void {
    player.hp+=this.resource;
    player.secondaryAmmo+=Math.floor(this.resource / 2);
    player.fuel+=this.resource * 3;
    return;
  }

  public updateCounter(player: Player): void {
    if (player.stationInfluenceTimer >= this.threshold) {
      this.giveResource(player);
      player.stationInfluenceTimer = 0;
    }
    else {
      player.stationInfluenceTimer++;
    }
    return;
  }

  public setPos(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.spawnToleranceShape.x = x;
    this.spawnToleranceShape.y = y;
    this.collisionShape.x = x;
    this.collisionShape.y = y;
    this.restorationShape.x = x;
    this.restorationShape.y = y;
  }

  public getData():any {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      radius: this.radius,
      spawnToleranceRadius: this.spawnToleranceRadius
    };
  }
};
