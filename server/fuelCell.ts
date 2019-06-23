////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                             Server - FuelCell                              //
////////////////////////////////////////////////////////////////////////////////

import { Circle } from './collisions/Collisions'
import { Player } from './player';
import { getRndInteger } from './aux';
import { GameObject } from './gameObject';

const RADIUS: number = 9;

export class FuelCell extends GameObject {
  public cells: number;

  constructor(x: number, y: number, max_x: number, max_y: number) {
    super(x, y);
    this.cells = getRndInteger(10, 25);
    this.collisionShape = new Circle(this.x, this.y, RADIUS);
    this.collisionShape.type = 'FuelCell';
    this.collisionShape.id = this.id;
  }

  public giveResource(player: Player): void {
    player.fuel+=this.cells;
    return;
  }

  public getData():any {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      radius: RADIUS
    };
  }
}