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
  public angle: number;
  public speed: number;
  public creator: string;
  public timeCreated: number;
  public polygonPoints: number[][];
  public collisionShape: Polygon;

  constructor (startX: number, startY: number, creator: string,  angle: number, speed: number) {
    this.x = startX;
    this.y = startY;
    this.creator = creator;
    this.angle = angle;
    this.speed = speed;
    this.timeCreated = Date.now();
  }

  abstract addPos (x: number, y: number): void;

  abstract updatePos (dt: number): void;
};


export class PrimaryFire extends DamageArtefact {
  public angle: number;
  public speed: number;
  constructor (startX: number, startY: number, creator: string, angle: number, speed: number) {
    super(startX, startY, creator, angle, speed);
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


