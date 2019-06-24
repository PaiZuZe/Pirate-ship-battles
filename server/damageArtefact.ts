////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                            Server - DamageArtefact                         //
////////////////////////////////////////////////////////////////////////////////

import { Collisions, Polygon } from './collisions/Collisions'
import { GameObject } from './gameObject';

export abstract class DamageArtefact extends GameObject {
  public angle: number;
  public speed: number;
  public creator: string;
  public timeCreated: number;
  public polygonPoints: number[][];
  public collisionShape: Polygon;

  constructor (x: number, y: number, creator: string,  angle: number, speed: number) {
    super(x, y);
    this.creator = creator;
    this.angle = angle;
    this.speed = speed;
    this.timeCreated = Date.now();
  }

  public abstract addPos (x: number, y: number): void;

  public abstract applyEffect (target: any): string;
  
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

  public updatePos (dt: number, collisionSystem: Collisions): void {
    this.addPos(Math.sin(this.angle) * this.speed * dt, -Math.cos(this.angle) * this.speed * dt);
    collisionSystem.remove(this.collisionShape);
    collisionSystem.insert(this.collisionShape);
    return;
  }

  public applyEffect (target: any): string {
    if (target.id != this.creator) {
      target.hp--;
      this.hp = 0;
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
      speed: this.speed,
      polygonPoints: this.polygonPoints
    };
    return artefactData;
  }
};


