////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                              Server - Game Object                          //
////////////////////////////////////////////////////////////////////////////////


import {v4} from 'node-uuid'
import { Collisions } from './collisions/Collisions'


export abstract class GameObject {
  public id: string;
  public x: number;
  public y: number;
  public angle: number;
  public hp: number;
  public killedBy: string;
  public spawnToleranceRadius: number;
  public collisionShape: any; //Could not find a abstract class from colissions to put here :(
  public spawnToleranceShape: any;

  constructor (x: number, y:number) {
    this.id = v4();
    this.x = x;
    this.y = y;
    this.hp = Infinity;
    this.killedBy = null;
  }

  public getData(): any {
    return {
      id: this.id,
      x: this.x,
      y: this.y
    };
  }

  public setPos(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.collisionShape.x = this.x;
    this.collisionShape.y = this.y;
    this.spawnToleranceShape.x = this.x;
    this.spawnToleranceShape.y = this.y;
  }

  public updatePos(dt: number = 0, collisionSystem: Collisions = null): void {
    return;
  }
}
