////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                            Server - SpaceStation                           //
////////////////////////////////////////////////////////////////////////////////


import { Circle } from './collisions/Collisions';
import { Player } from './player';
import { GameObject } from './gameObject';

export class SpaceStation extends GameObject {
  public radius: number;
  public type: string;
  public resource: number;
  public threshold: number;
  public restorationShape: Circle;

  constructor (x: number, y: number, radius: number, type: string, resource: number, threshold: number) {
    super(x, y);
    this.radius = radius;
    this.type = type;
    this.resource = resource;
    this.threshold = threshold;
    this.restorationShape = new Circle(this.x, this.y, 2 * radius);
    this.restorationShape.type = 'SpaceSationRest';
    this.restorationShape.id = this.id;
    this.collisionShape = new Circle(this.x, this.y, radius);
    this.collisionShape.type = 'SpaceSationCol';
    this.collisionShape.id = this.id;
  }

  private giveResource (player: Player): void {
    if (this.type == "life") {
      player.hp+=this.resource;
    }
    return;
  }

  public updateCounter(player: Player): void {
    if (player.counter >= this.threshold) {
      this.giveResource(player);
      player.counter = 0;
    }
    else {
      player.counter++;
    }
    return;
  }

  public getData():any {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      radius: this.radius
    };
  }
};