////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                                Server - FuelCell                           //
////////////////////////////////////////////////////////////////////////////////

import { Circle } from './collisions/Collisions'
import { Player } from './player';
import { v4 } from 'node-uuid';
import { getRndInteger } from './aux';


export class FuelCell {
  public x: number;
  public y: number;
  public hp: number = Infinity;
  public cells: number;
  public id: string;
  public collisionShape: Circle;

  constructor (x: number, y: number, max_x: number, max_y: number) {
    this.x = x;
    this.y = y;
    this.cells = getRndInteger(10, 25);
    this.id = v4();
    this.collisionShape = new Circle(this.x, this.y, 9);
    this.collisionShape.type = 'FuelCell';
    this.collisionShape.id = this.id;
  }

  public getData(): any {
    return {
      x: this.x,
      y: this.y,
      id: this.id
    };
  }

  public giveResource(player: Player): void {
    player.fuel+=this.cells;
    return;
  }
}