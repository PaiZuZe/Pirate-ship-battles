////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                             Server - FuelCell                              //
////////////////////////////////////////////////////////////////////////////////

import { Polygon, Circle } from './collisions/Collisions'
import { Player } from './player';
import { getRndInteger } from './aux';
import { GameObject } from './gameObject';

const RADIUS: number = 9;

export class FuelCell extends GameObject {
  public cells: number;

  public readonly polygonPoints: number[][] = [
    [-16, -20],
    [16, -20],
    [16, 20],
    [-16, 20]
  ];

  constructor(x: number, y: number, max_x: number, max_y: number) {
    super(x, y);
    this.cells = getRndInteger(10, 25);
    this.spawnToleranceRadius = 10;
    this.spawnToleranceShape = new Circle(this.x, this.y, this.spawnToleranceRadius);
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints, 0, 0.75, 0.75);
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
      radius: RADIUS,
      spawnToleranceRadius: this.spawnToleranceRadius
    };
  }
}
