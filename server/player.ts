////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                              Server - Player                               //
////////////////////////////////////////////////////////////////////////////////

import * as SAT from 'sat';
//const Bullet = require('./bullet.js');
import * as aux from './aux';
//import { DamageArtefact } from './damageArtefact';

const MAX_ACCEL = 100;
const DRAG_CONST = 0.1;
const ANGULAR_VEL = 1;
const DRAG_POWER = 1.5;
const BULLET_COOLDOWN = 500; // ms

export class Player {
  public id: String;
  public username: String;
  private isDead: boolean = false;
  private x: number;
  private y: number;
  private angle: number;
  private speed: number = 0;
  private accel: number = 0;
  private hull: number = 3;
  private invulTime: number = 0; // Invulnerability time inside debrisField
  private stationInfluenceTimer: number = 0;
  private fuel: number = 100;
  private primaryCooldown: number = 0;

  private poly: SAT.Polygon = new SAT.Polygon(new SAT.Vector(this.x, this.y), [
    new SAT.Vector(-9, -38),
    new SAT.Vector(1, -38),
    new SAT.Vector(11, -13),
    new SAT.Vector(35, 1),
    new SAT.Vector(48, -7),
    new SAT.Vector(43, 21),
    new SAT.Vector(13, 26),
    new SAT.Vector(6, 36),
    new SAT.Vector(-8, 36),
    new SAT.Vector(-16, 26),
    new SAT.Vector(-45, 21),
    new SAT.Vector(-50, -7),
    new SAT.Vector(-37, 1),
    new SAT.Vector(-13, -13)
  ]);
  private inputs = {
    up: false,
    left: false,
    right: false,
    primaryFire: false,
    boost: false
  };
  
  constructor (x, y, angle, id, username) {
    this.id = id;
    this.username = username;
    this.x = x;
    this.y = y;
  }

  private addAngle(angle: number): void {
    this.angle += angle;
    this.poly.setAngle(this.angle);
  }

  private addPos(x: number, y: number): void {
    this.x += x;
    this.y += y;
    this.poly.pos.x = this.x;
    this.poly.pos.y = this.y;
  }

  private setPos(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.poly.pos.x = this.x;
    this.poly.pos.y = this.y;
  }

  private canFire(): boolean {
    if (this.primaryCooldown + BULLET_COOLDOWN > Date.now())
      return false;
    return true;
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
  /*
  public fire(): DamageArtefact { 
    if (this.canFire()) {
      console.log(`FIRE! fire from: ${this.username}`);
      this.primaryCooldown = Date.now();
      let [offx, offy] = aux.rotate(this.angle, 20, -10); // NO TYPES
      let [offx1, offy1] = aux.rotate(this.angle, -20, -10); // NO TYPES
      let damageArtefacts: DamageArtefact[] = [new DamageArtefact(this.x + offx, this.y + offy, this.angle, this.id, 1000),
                                               new DamageArtefact(this.x + offx1, this.y + offy1, this.angle, this.id, 1000)];
      return damageArtefacts;
    } else {
      return null; // not sure if it works, works with []
    }
  }

  public takeDamage(delta: number, mod: number) {
    this.invulTime += delta;
    if (this.invulTime % (mod * delta) == 0) {
      this.hull--;
      this.invulTime = delta;
    }
  }

  public gainResource(delta: number, mod: number, type: String) {
    if (type == 'life') {
      this.hull += 1;
    }
  }
  */
};