////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                            Server - SpaceStation                           //
////////////////////////////////////////////////////////////////////////////////


import { Circle } from './collisions/Collisions';
import { Player } from './player';
import {v4} from 'node-uuid';

export class SpaceStation {
  public id: string;
  public x: number;
  public y: number;
  public radius: number;
  public type: string;
  public resource: number;
  public threshold: number;
  public restorationShape: Circle;
  public collisionShape: Circle;
  public hp:number = Infinity;

  constructor (x: number, y: number, radius: number, max_x: number, max_y: number, type: string, resource: number, threshold: number) {
    try {
      if (x < 0 || x >= max_x) {
        throw "x must be non-negative or smaller than max_x";
      } 
      if (y < 0 || y >= max_y) {
        throw "y must be non-negative or smaller than max_y";
      } 
      if (radius <= 0) {
        throw "radius must be bigger than zero";
      } 

      this.x = x;
      this.y = y;
      this.radius = radius;
      this.type = type;
      this.resource = resource;
      this.threshold = threshold;
      this.id = v4();
      this.restorationShape = new Circle(this.x, this.y, 2 * radius);
      this.restorationShape.type = 'SpaceSationRest';
      this.restorationShape.id = this.id;
      this.collisionShape = new Circle(this.x, this.y, radius);
      this.collisionShape.type = 'SpaceSationCol';
      this.collisionShape.id = this.id;
    } catch(err) {
      console.log("Island constructor: " + err);
    }
  }

  private giveResource (player: Player): void {
    if (this.type == "life") {
      player.hp+=this.resource;
    }
    return;
  }

  public updateCounter(player: Player): void {
    if (player.counter <= this.threshold) {
      this.giveResource(player);
      player.counter = 0;
    }
    else {
      player.counter+=1;
    }
    return;
  }

  public getData():any {
    return {
        radius: this.radius,
        x: this.x,
        y: this.y,
        id: this.id
    };
  }
};