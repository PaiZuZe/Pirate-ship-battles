////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                            Server - DamageArtefact                         //
////////////////////////////////////////////////////////////////////////////////

import { Polygon } from './collisions/Collisions'
import {v4} from 'node-uuid'

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
    this.id = v4();
  }

  public abstract addPos (x: number, y: number): void;

  public abstract updatePos (dt: number): void;

  public abstract applyEffect (target: any): string;
  
  public abstract getData(): any;
};


export class PrimaryFire extends DamageArtefact {
  constructor (startX: number, startY: number, creator: string, angle: number, speed: number) {
    super(startX, startY, creator, angle, speed);
    this.polygonPoints = [
      [0, -26],
      [0, 26]
    ];
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints);
    this.collisionShape.type = 'DamageArtefact';
    this.collisionShape.id = this.id;
  
  }
  public addPos (x: number, y: number): void {
    this.x += x;
    this.y += y;
    this.collisionShape.x = this.x;
    this.collisionShape.y = this.y;
  }

  public updatePos (dt: number): void {
    this.addPos(Math.sin(this.angle) * this.speed * dt, -Math.cos(this.angle) * this.speed * dt);
  }

  public applyEffect (target: any): string {
    if (target.id != this.creator) {
      target.hp--;
      return 'hit'
    }
    return null;
  }

  public getData(): any {
    let artefactData: any;
    artefactData = {
      id: this.id, 
      creator: this.creator, 
      x: this.x, 
      y: this.y, 
      angle: this.angle, 
      speed: this.speed
    };
    return artefactData;
  }
 };


