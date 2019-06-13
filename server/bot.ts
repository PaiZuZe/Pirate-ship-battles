import { Player } from './player';
import { Polygon, Circle } from './collisions/Collisions'
import { rotate, distSq } from './aux';
import { DamageArtefact, PrimaryFire } from './damageArtefact';
import {v4} from 'node-uuid'

const BULLET_COOLDOWN = 1500; // ms



export class Bot {
  public id: string;
  public x: number;
  public y: number;
  public username: string = "blob";
  public angle: number;
  public speed: number;
  public accel: number;
  public dead: boolean;
  public bullets: number;
  public hp: number;
  public invul_time: number;
  public collisionShape: Polygon;
  public agro: Circle;
  private primaryCooldown: number;
  public readonly polygonPoints: number[][] = [
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
  constructor (x: number, y: number) {
    this.id = v4();
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.speed = 0;
    this.accel = 0;
    this.dead = false;
    this.bullets = Infinity;
    this.hp = 3;
    this.invul_time = 0;
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints);
    this.collisionShape.id = this.id;
    this.collisionShape.type = 'Bot';
    this.agro = new Circle(this.x, this.y, 600);
    this.primaryCooldown = 0;
  }

  public takeAction(playerList: any): DamageArtefact[] {
    var playersToConsider: any[] = [];
    var bullets: DamageArtefact[] = [];
    playerList.forEach((value: Player, key: string) => {
      if (value.collisionShape.collides(this.agro)) {
        playersToConsider.push(value);
      }
    });
    if (playersToConsider.length > 0) {
      let player_index = Math.floor(Math.random() * playersToConsider.length);
      this.aproach_target(playersToConsider[player_index]);
      bullets = this.attack_target(playersToConsider[player_index]);
    }
    else {
      this.random_move();
    }
    return bullets;
  }

  private allign_with(target: any): number {
    var del_x: number = this.x - target.x;
    var del_y: number = this.y - target.y;
    var theta: number = Math.atan2(del_y, del_x);
    return theta - Math.PI/2;
  }

  private random_move(): void {
    this.addAngle(Math.PI / 72);
    this.addPos(Math.sin(this.angle)*4, -Math.cos(this.angle)*4);
    return;
  }

  private aproach_target(target: any): void {
    var alligned_angle = this.allign_with(target);
    this.addAngle((alligned_angle - this.angle) / 10);
    this.addPos(Math.sin(this.angle)*4, -Math.cos(this.angle)*4);
    return;
  }

  private attack_target(target: any): any {
    if (distSq(target, this) < 400*400) {
      let bullets = this.primaryFire();
      return bullets;
    }
    return [];
  }

  public primaryFire(): PrimaryFire[] { 
    if (this.canPrimaryFire()) {
      console.log(`FIRE! fire from bot: ${this.id}`);
      this.primaryCooldown = Date.now();
      let [offx, offy] = rotate(this.angle, 20, -10); // NO TYPES
      let [offx1, offy1] = rotate(this.angle, -20, -10); // NO TYPES
      let damageArtefacts: PrimaryFire[] = [new PrimaryFire(this.x + offx, this.y + offy, this.id, this.angle, 1000),
                                            new PrimaryFire(this.x + offx1, this.y + offy1, this.id, this.angle, 1000)];
      return damageArtefacts;
    } 
    else {
      return null; // not sure if it works, works with []
    }
  }
  
  private canPrimaryFire(): boolean {
    if (this.primaryCooldown + BULLET_COOLDOWN > Date.now())
      return false;
    return true;
  }
  
  private addAngle(angle: number): void {
    this.angle += angle;
    this.collisionShape.angle = this.angle;
    return;
  }
  
  private addPos(x: number, y: number): void {
    this.x += x;
    this.y += y;
    this.collisionShape.x = this.x;
    this.collisionShape.y = this.y;
    return;
  }

  public getData(): any {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      speed: this.speed,
      angle: this.angle,
      username: this.username,
      life: this.hp,
      fuel: 0,
      anchored_timer: 0,
      polygonPoints: this.polygonPoints,
    };
  }

};
