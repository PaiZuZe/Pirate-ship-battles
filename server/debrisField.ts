////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                           Server - Debris Field                            //
////////////////////////////////////////////////////////////////////////////////

import {Circle } from './collisions/Collisions'
import { Player } from './player';
import { GameObject } from './gameObject';

export class DebrisField extends GameObject {
  public radius: number;
  public threshold: number;
  constructor (x: number, y: number, radius: number, threshold: number) {
    super(x, y);
    this.radius = radius;
    this.threshold = threshold;
    this.spawnToleranceRadius = 0;
    this.spawnToleranceShape = new Circle(this.x, this.y, this.spawnToleranceRadius);
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
      radius: this.radius,
      spawnToleranceRadius: this.spawnToleranceRadius
    };
  }

}