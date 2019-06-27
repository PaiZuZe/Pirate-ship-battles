////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                              Server - Player                               //
////////////////////////////////////////////////////////////////////////////////

import { Collisions, Polygon } from './collisions/Collisions'
import { rotate } from './aux';
import { DamageArtefact, PrimaryFire, EnergyBall } from './damageArtefact';
import { Agent } from './agent';

const ships = require('./ships.json');

const MAX_ACCEL = 200; //100
const MAX_SPEED = 500;
const ANGULAR_VEL = 1.75; //1
const DRAG_CONST = 0.1;
const DRAG_POWER = 1.5;

export class Player extends Agent {
  public counter: number = 0;
  public counterDebri: number = 0;
  public lastTimeShotSecondary: number = 0;
  public secondaryCooldown: number = 1500;
  public accelAngle: number;

  private invulTime: number = 0; // Invulnerability time inside debrisField

  public inputs = {
    up: false,
    left: false,
    right: false,
    primaryFire: false,
    secondaryFire: false,
    boost: false
  };

  constructor (x: number, y: number, angle: number, id: string, username: string, shipname: string) {
    super(x, y, username, shipname);
    this.id = id;
    this.angle = angle;
    this.accelAngle = angle; // Could be used for Asteroids-like movement
    this.username = username;
    this.shipname = shipname;
    this.hp = 5;
    this.attack = ships[shipname].attack;
    this.primaryCooldown = 500/ships[shipname].firerate;
    this.fuel *= ships[shipname].fuel;
    this.boost = ships[shipname].boost;
    this.polygonPoints = ships[shipname].poly;
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints, this.angle, ships[shipname].scale, ships[shipname].scale);
    this.collisionShape.type = 'Player';
    this.collisionShape.id = this.id;
  }

  public setPos(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.collisionShape.x = this.x;
    this.collisionShape.y = this.y;
    this.spawnToleranceShape.x = this.x;
    this.spawnToleranceShape.y = this.y;
  }

  public canSecondaryFire(): boolean {
    if (this.lastTimeShotSecondary + this.secondaryCooldown <= Date.now()) {
      return true;
    }
    return false;
  }

  public secondaryFire(): DamageArtefact[] {
    if (this.canSecondaryFire()) {
      console.log(`SECONDARY FIRE! fire from: ${this.username}`);
      this.lastTimeShotSecondary = Date.now();
      if (this.shipname == "Blastbeat") {
        return this.fireEnergyBall();
      }
      else if (this.shipname == "Blindside") {
        return this.fireShotgun();
      }
    }
    return null;
}

  public fireEnergyBall(): DamageArtefact[] {
      return [new EnergyBall(this.x, this.y, this.id, this.angle, 500)];
  }

  public fireShotgun(): DamageArtefact[] {
    console.log(`FIRE! fire from: ${this.username}`);
    this.lastTimeShotPrimary = Date.now();
    let [offx, offy] = rotate(this.angle, 20, -10); // Why 20 and -10?
    let [offx1, offy1] = rotate(this.angle, 0, -10); // NO TYPES
    let [offx2, offy2] = rotate(this.angle, -20, -10); // NO TYPES
    let damageArtefacts: PrimaryFire[] = [new PrimaryFire(this.x + offx, this.y + offy, this.id, this.angle + Math.PI/4, 1000),
                                          new PrimaryFire(this.x + offx, this.y + offy, this.id, this.angle + Math.PI/8, 1000),
                                          new PrimaryFire(this.x + offx1, this.y + offy1, this.id, this.angle, 1000),
                                          new PrimaryFire(this.x + offx2, this.y + offy2, this.id, this.angle - Math.PI/8, 1000),
                                          new PrimaryFire(this.x + offx2, this.y + offy2, this.id, this.angle - Math.PI/4, 1000)];

    return damageArtefacts;    
  }

  public updatePos(dt: number, collisionSystem: Collisions): void {
    this.accel = -Math.max(DRAG_CONST*Math.pow(this.speed, DRAG_POWER), 0);
    this.accel += (this.inputs.up) ? MAX_ACCEL : 0;
    //this.accelAngle = (this.inputs.up) ? this.angle : this.accelAngle;
    this.speed += this.accel*dt;
    if (this.speed < 2 && this.accel < 2)
      this.speed = 0;
    this.fuel = (this.inputs.up && this.inputs.boost && this.fuel > 0) ? this.fuel - 1 : this.fuel;
    let mod = (this.inputs.up && this.inputs.boost && this.fuel > 0) ? this.boost : 1;
    this.addPos(mod*Math.sin(this.angle)*this.speed*dt, -mod*Math.cos(this.angle)*this.speed*dt);
    let ratio = this.speed/Math.pow(MAX_ACCEL/DRAG_CONST, 1/DRAG_POWER); // What is this for?
    this.addAngle((this.inputs.right)? ANGULAR_VEL*dt : 0); // mod*ANGULAR_VEL*dt
    this.addAngle((this.inputs.left)? -ANGULAR_VEL*dt : 0); // -mod*ANGULAR_VEL*dt
    //Acording with the docs of the Collisions, we have to do this to change the tree that it uses.
    collisionSystem.remove(this.collisionShape);
    collisionSystem.insert(this.collisionShape);
  }

  public getDrawData(): any {
    return {
      x: this.x,
      y: this.y,
      username: this.username,
      shipname: this.shipname,
      spawnToleranceRadius: this.spawnToleranceRadius
    };
  }
};
