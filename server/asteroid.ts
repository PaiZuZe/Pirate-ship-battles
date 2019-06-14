////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                               Server - Asteroid                            //
////////////////////////////////////////////////////////////////////////////////


import { Polygon } from './collisions/Collisions'
import {v4} from 'node-uuid'
import { GameObject } from './gameObject';

export class Asteroid extends GameObject {
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
    super(x, y);
    this.hp = 7;
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints);
    this.collisionShape.type = 'Asteroid';
    this.collisionShape.id = this.id;
  }
}