////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                            Server - DamageArtefact                         //
////////////////////////////////////////////////////////////////////////////////

import { Collisions, Polygon, Circle } from './collisions/Collisions'
import { GameObject } from './gameObject';
import { distSq } from './aux';


export abstract class DamageArtefact extends GameObject {
  public angle: number;
  public speed: number;
  public initX: number;
  public initY: number;
  public range: number;
  public timeCreated: number;
  public creator: string;
  public signal: string
  public collisionShape: any;

  constructor (x: number, y: number, creator: string,  angle: number, speed: number) {
    super(x, y);
    this.creator = creator;
    this.initX = this.x;
    this.initY = this.y;
    this.angle = angle;
    this.speed = speed;
    this.timeCreated = Date.now();
  }

  public abstract addPos (x: number, y: number): void;

  public abstract applyEffect (target: any, mod: number): string;

  public abstract vanish (): boolean;
};

export class PrimaryFire extends DamageArtefact {
  public readonly polygonPoints: number[][] = [
    [-4, -27],
    [5, -27],
    [5, 27],
    [-4, 27]
  ];

  constructor (startX: number, startY: number, creator: string, angle: number, speed: number) {
    super(startX, startY, creator, angle, speed);
    this.signal = "bullet_create";
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints);
    this.range = 1000;
    this.spawnToleranceRadius = 20;
    this.spawnToleranceShape = new Circle(this.x, this.y, this.spawnToleranceRadius);
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints, angle);
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

  public applyEffect (target: any, mod: number): string {
    if (target.id != this.creator) {
      target.hp -= mod;
      this.hp = 0;
      return 'hit'
    }
    return null;
  }

  public vanish(): boolean {
    if (distSq({x: this.initX, y: this.initY}, {x: this.x, y: this.y}) >= Math.pow(this.range, 2)) {
      return true;
    }
    return false
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
      polygonPoints: this.polygonPoints,
      spawnToleranceRadius: this.spawnToleranceRadius
    };
    return artefactData;
  }
};

export class EnergyBall extends DamageArtefact {
  public radius: number = 60;
  public baseDamage: number = 1;
  public range: number = 500;

  constructor(x: number, y: number, creator: string, angle: number, speed: number) {
    super(x, y, creator, angle, speed);
    this.signal = "create_EBall";
    this.spawnToleranceRadius = 350;
    this.spawnToleranceShape = new Circle(this.x, this.y, this.spawnToleranceRadius);
    this.collisionShape = new Circle(this.x, this.y, this.radius);
    this.collisionShape.type = 'DamageArtefact';
    this.collisionShape.id = this.id;
  }

  public vanish(): boolean {
    if (distSq({x: this.initX, y: this.initY}, {x: this.x, y: this.y}) >= Math.pow(this.range, 2)) {
      return true;
    }
    return false;
  }

  public updatePos (dt: number, collisionSystem: Collisions): void {
    this.addPos(Math.sin(this.angle) * this.speed * dt, -Math.cos(this.angle) * this.speed * dt);
    collisionSystem.remove(this.collisionShape);
    collisionSystem.insert(this.collisionShape);
    return;
  }

  public addPos (x: number, y: number): void {
    this.x += x;
    this.y += y;
    this.collisionShape.x = this.x;
    this.collisionShape.y = this.y;
  }

  public applyEffect (target: GameObject): string {
    if (target.id != this.creator) {
      target.hp -= this.baseDamage + Math.floor(Math.random() * 10);
      return 'hit'
    }
    return null;
  }

  public getData(): any {
    return {
      id: this.id,
      creator: this.creator,
      x: this.x,
      y: this.y,
      angle: this.angle,
      speed: this.speed,
      radius: this.radius,
      spawnToleranceRadius: this.spawnToleranceRadius
    };
  }

}

/*
export class Mine extends DamageArtefact {
  public timeInactive: number = 500;
  public explosionTime: number = 500;
  public baseDamage: number = 5;
  public triggerTime: number = 0;
  public mineSize: number = 9;
  public explosionSize: number = 600;
  public explosionShape: Circle;
  constructor(x: number, y: number, creator: string, angle: number, speed: number) {
    super(x, y, creator, angle, speed);
    this.collisionShape = new Circle(x, y, this.mineSize);
    this.collisionShape.type = 'DamageArtefact';
    this.collisionShape.id = this.id;
  }

  public explode (): boolean {
    if (Date.now() >= this.timeCreated + this.timeInactive) {
      this.explosionShape = new Circle(this.x, this.y, this.explosionSize);
      this.hp = 0;
      return true;
    }
    return false;
  }

  public addPos (x: number, y: number): void {
    return;
  }

  public applyEffect (target: GameObject): string {
    target.hp -= this.baseDamage + Math.floor(Math.random() * 5);
    return 'hit';
  }
}
*/
