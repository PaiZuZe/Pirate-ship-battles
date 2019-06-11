////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                               Server - Asteroid                            //
////////////////////////////////////////////////////////////////////////////////


import { Polygon } from './collisions/Collisions'
import {v4} from 'node-uuid'

export class Asteroid {
  public x: number;
  public y: number;
  public hp: number;
  public id: string;
  public collisionShape: Polygon;
  public readonly polygonPoints: number[][] = [
    [-34, -41],
    [24, -41],
    [50, -2],
    [34, 31],
    [10, 27],
    [-22, 40],
    [-50, 9],
  ];

  constructor (x: number, y: number, max_x: number, max_y: number) {
    try {
      if (x < 0 || x >= max_x) throw "x must be non-negative or smaller than max_x";
      if (y < 0 || y >= max_y) throw "y must be non-negative or smaller than max_y";

      this.x = x;
      this.y = y;
      this.hp = 7;
      this.id = v4();
      this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints);
      this.collisionShape.type = 'Asteroid';
      this.collisionShape.id = this.id;
    } catch(err) {
      console.log("Stone constructor: " + err);
    }
  }

  public getData (): any {
    return {
      x: this.x,
      y: this.y,
      id: this.id
    };
  }
}