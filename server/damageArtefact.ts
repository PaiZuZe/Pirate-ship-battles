////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                            Server - DamageArtefact                         //
////////////////////////////////////////////////////////////////////////////////

import { Polygon } from './collisions/Collisions'

export abstract class DamageArtefact {
  public id: string;
  public x: number;
  public y: number;
  public creator: string;
  public timeCreated: number;
  public polygonPoints: number[][];
  public collisionShape: Polygon;

  constructor (startX: number, startY: number, creator: string) {
    this.x = startX;
    this.y = startY;
    this.creator = creator;
    this.timeCreated = Date.now();
  }

  abstract addPos (x: number, y: number): void;

  abstract updatePos (dt: number): void;
};


export class PrimaryFire extends DamageArtefact {
  public angle: number;
  public speed: number;
  constructor (startX: number, startY: number, creator: string, angle: number, speed: number) {
    super(startX, startY, creator);
    this.angle = angle;
    this.speed = speed;
    this.polygonPoints = [
      [0, -26],
      [0, 26]
    ];
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints);
  
  }
  addPos (x: number, y: number): void {
    this.x += x;
    this.y += y;
  }

  updatePos (dt: number): void {
    this.addPos(Math.sin(this.angle) * this.speed * dt, -Math.cos(this.angle) * this.speed * dt);
  }
 };


