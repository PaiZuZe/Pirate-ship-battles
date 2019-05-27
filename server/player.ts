////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                              Server - Player                               //
////////////////////////////////////////////////////////////////////////////////

import * as SAT from 'sat';
import { Polygon } from './collisions/Collisions'
import { rotate } from './aux';
//const Bullet = require('./bullet.js');
import { DamageArtefact, PrimaryFire } from './damageArtefact';
// import { something } from './aux';

const MAX_ACCEL = 100;
const DRAG_CONST = 0.1;
const ANGULAR_VEL = 1;
const DRAG_POWER = 1.5;
const BULLET_COOLDOWN = 500; // ms

export class Player {
  public id: string;
  public username: string;
  public isDead: boolean = false;
  public x: number;
  public y: number;
  public angle: number;
  public collisionShape: Polygon;
  public speed: number = 0;
  private accel: number = 0;
  public hp: number = 3;
  private invulTime: number = 0; // Invulnerability time inside debrisField
  public stationInfluenceTimer: number = 0;
  public fuel: number = 100;
  private primaryCooldown: number = 0;
  public readonly polygonPoints: number[][];

  public inputs = {
    up: false,
    left: false,
    right: false,
    primaryFire: false,
    boost: false
  };
  
  constructor (x: number, y: number, angle: number, id: string, username: string) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.angle = angle;
    this.username = username;
    this.polygonPoints = [
      [-9, -38],
      [1, -38],
      [11, -13],
      [35, 1],
      [48, -7],
      [43, 21],
      [13, 26],
      [6, 36],
      [-8, 36],
      [-16, 26],
      [-45, 21],
      [-50, -7],
      [-37, 1],
      [-13, -13]
    ];
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints);
    this.collisionShape.type = 'Player';
    this.collisionShape.id = this.id;

  }

  private canPrimaryFire(): boolean {
    if (this.primaryCooldown + BULLET_COOLDOWN > Date.now())
      return false;
    return true;
  }

  private addAngle(angle: number): void {
    this.angle += angle;
    this.collisionShape.angle = (this.angle);
  }

  private addPos(x: number, y: number): void {
    this.x += x;
    this.y += y;
    this.collisionShape.x = this.x;
    this.collisionShape.y = this.y;
  }

  public setPos(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.collisionShape.x = this.x;
    this.collisionShape.y = this.y;
  }

  public getData(): any {
    // TODO: Change anchored_timer in the client to stationInfluenceTimer
    let playerInfo: any = {
      id: this.id,
      x: this.x,
      y: this.y,
      speed: this.speed,
      angle: this.angle,
      username: this.username,
      life: this.hp,
      fuel: this.fuel,
      anchored_timer: this.stationInfluenceTimer,
      polygonPoints: this.polygonPoints,
    };

    return playerInfo; 
  }

  public updatePos(dt: number): void {
    this.accel = -Math.max(DRAG_CONST*Math.pow(this.speed, DRAG_POWER), 0);
    this.accel += (this.inputs.up)? MAX_ACCEL : 0;
    this.speed += this.accel*dt;
    if (this.speed < 2 && this.accel < 2)
      this.speed = 0;
    this.fuel = (this.inputs.boost && this.fuel > 0) ? this.fuel - 1 : this.fuel; 
    let mod = (this.inputs.boost && this.fuel) ? 2 : 1;
    this.addPos(mod*Math.sin(this.angle)*this.speed*dt, -mod*Math.cos(this.angle)*this.speed*dt);
    let ratio = this.speed/Math.pow(MAX_ACCEL/DRAG_CONST, 1/DRAG_POWER); 
    this.addAngle((this.inputs.right)? mod*ANGULAR_VEL*dt : 0);
    this.addAngle((this.inputs.left)? -mod*ANGULAR_VEL*dt : 0);
  }

  /**
   * Attempts to fire, taking into account the last time it fired.
   * Returns the DamageArtefact's just created, or null if it can not fire.
   */
  public primaryFire(): PrimaryFire[] { 
    if (this.canPrimaryFire()) {
      console.log(`FIRE! fire from: ${this.username}`);
      this.primaryCooldown = Date.now();
      let [offx, offy] = rotate(this.angle, 20, -10); // NO TYPES
      let [offx1, offy1] = rotate(this.angle, -20, -10); // NO TYPES
      let damageArtefacts: PrimaryFire[] = [new PrimaryFire(this.x + offx, this.y + offy, this.id, this.angle, 1000),
                                            new PrimaryFire(this.x + offx1, this.y + offy1, this.id, this.angle, 1000)];
        return damageArtefacts;
      } else {
        return null; // not sure if it works, works with []
      }
    }
    
  /*
  public takeDamage(delta: number, mod: number) {
    this.invulTime += delta;
    if (this.invulTime % (mod * delta) == 0) {
      this.hp--;
      this.invulTime = delta;
    }
  }

  public gainResource(delta: number, mod: number, type: string) {
    if (type == 'life') {
      this.hp += 1;
    }
  }
  */
};