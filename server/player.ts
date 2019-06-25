////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                              Server - Player                               //
////////////////////////////////////////////////////////////////////////////////

import { Collisions, Polygon } from './collisions/Collisions'
import { rotate } from './aux';
import { DamageArtefact, PrimaryFire } from './damageArtefact';
import { Agent } from './agent';

const MAX_ACCEL = 100;
const DRAG_CONST = 0.1;
const ANGULAR_VEL = 1;
const DRAG_POWER = 1.5;

export class Player extends Agent {
  public counter: number = 0;
  public counterDebri: number = 0;
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
    this.username = username;
    this.shipname = shipname;
    this.hp = 5;
    this.primaryCooldown = 500;
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

  public updatePos(dt: number, collisionSystem: Collisions): void {
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
    //Acording with the docs of the Collisions, we have to do this to change the tree that it uses.
    collisionSystem.remove(this.collisionShape);
    collisionSystem.insert(this.collisionShape);
  }
};
