////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                             Server - FuelCell                              //
////////////////////////////////////////////////////////////////////////////////

import { Polygon, Circle } from './collisions/Collisions'
import { Player } from './player';
import { getRndInteger } from './aux';
import { GameObject } from './gameObject';

export class AmmoPack extends GameObject {
  public rounds: number;

  public readonly polygonPoints: number[][] = [
    [-16, -20],
    [16, -20],
    [16, 20],
    [-16, 20]
  ];

  constructor(x: number, y: number, max_x: number, max_y: number) {
    super(x, y);
    this.rounds = getRndInteger(1, 3);
    this.spawnToleranceRadius = 10;
    this.spawnToleranceShape = new Circle(this.x, this.y, this.spawnToleranceRadius);
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints, 0, 0.9, 0.9);
    this.collisionShape.type = 'AmmoPack';
    this.collisionShape.id = this.id;
  }

  public giveResource(player: Player): void {
    player.secondaryAmmo += this.rounds;
    return;
  }

  public getData():any {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      polygonPoints: this.polygonPoints,
      spawnToleranceRadius: this.spawnToleranceRadius
    };
  }
}
