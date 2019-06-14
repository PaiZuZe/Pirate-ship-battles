////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                           Server - Debris Field                            //
////////////////////////////////////////////////////////////////////////////////

import {v4} from 'node-uuid'
import {Circle } from './collisions/Collisions'
import { Player } from './player';

export class DebrisField {
  public x: number;
  public y: number;
  public id: string;
  public radius: number;
  public collisionShape: Circle;
  public threshold: number;
  constructor (x: number, y: number, radius: number, threshold: number) {
    this.x = x;
    this.y = y;
    this.id = v4();
    this.radius = radius;
    this.threshold = threshold;
    this.collisionShape = new Circle(x, y, radius);
    this.collisionShape.id = this.id;
    this.collisionShape.type = "DebrisField";
  }

  private takeResource (player: Player): void {
      player.hp--;
    return;
  }

  public updateCounter(player: Player): void {
    if (player.counterDebri >= this.threshold) {
      this.takeResource(player);
      player.counterDebri = 0;
    }
    else {
      player.counterDebri++;
    }
    return;
  }

  public getData(): any {
    return {
      center_x: this.x,
      center_y: this.y,
      id: this.id,
      radius: this.radius
    };
  }

}