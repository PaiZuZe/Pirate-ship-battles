import { Circle } from './collisions/Collisions'
import { GameObject } from "./gameObject";
import { DamageArtefact, PrimaryFire } from './damageArtefact';
import { rotate } from './aux';


export abstract class Agent extends GameObject {
  public primaryCooldown: number;
  public lastTimeShotPrimary: number = 0;
  public attack: number;
  public speed: number = 0;
  public accel: number = 0;
  public fuel: number = 0;
  public boost: number;
  public secondaryAmmo: number = 0;
  public secondaryCooldown: number;

  public isDead: boolean;
  public stationInfluenceTimer: number;
  public username: string;
  public shipname: string;
  public polygonPoints: number[][];

  constructor (x: number, y: number, username: string, shipname: string) {
    super(x, y);
    this.angle = 0;
    this.stationInfluenceTimer = 0;
    this.username = username;
    this.shipname = shipname;
    this.isDead = false;
    this.spawnToleranceRadius = 100;
    this.spawnToleranceShape = new Circle(this.x, this.y, this.spawnToleranceRadius);
  }

  public canPrimaryFire(): boolean {
    if (this.lastTimeShotPrimary + this.primaryCooldown  > Date.now()) {
      return false;
    }
    return true;
  }

  public addAngle(angle: number): void {
    this.angle += angle;
    this.collisionShape.angle = this.angle;
    return;
  }

  public addPos(x: number, y: number): void {
    this.x += x;
    this.y += y;
    this.collisionShape.x = this.x;
    this.collisionShape.y = this.y;
    this.spawnToleranceShape.x = this.x;
    this.spawnToleranceShape.y = this.y;
    return;
  }

  public primaryFire(): PrimaryFire[] {
    if (this.canPrimaryFire()) {
      console.log(`FIRE! fire from: ${this.username}`);
      this.lastTimeShotPrimary = Date.now();
      let [offx, offy] = rotate(this.angle, 20, -10); // Why 20 and -10?
      let [offx1, offy1] = rotate(this.angle, -20, -10); // NO TYPES
      let damageArtefacts: PrimaryFire[] = [new PrimaryFire(this.x + offx, this.y + offy, this.id, this.angle, 1000),
                                            new PrimaryFire(this.x + offx1, this.y + offy1, this.id, this.angle, 1000)];
      return damageArtefacts;
    }
    else {
      return null; // not sure if it works, works with []
    }
  }

  public getData(): any {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      speed: this.speed,
      angle: this.angle,
      username: this.username,
      shipname: this.shipname,
      life: this.hp,
      fuel: this.fuel,
      anchored_timer: this.stationInfluenceTimer,
      polygonPoints: this.polygonPoints,
      spawnToleranceRadius: this.spawnToleranceRadius,
      secondaryAmmo: this.secondaryAmmo,
    };
  }
}
