////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                              Server - Bot                                  //
////////////////////////////////////////////////////////////////////////////////

import { Player } from './player';
import { Collisions, Polygon, Circle } from './collisions/Collisions'
import { rotate, distSq } from './aux';
import { DamageArtefact, PrimaryFire } from './damageArtefact';
import { Agent } from './agent';

const BULLET_COOLDOWN = 1500; // ms

export class Bot extends Agent {
  public invul_time: number;
  public agro: Circle;

  public readonly polygonPoints: number[][] = [
    [-64, -89],
    [64, -89],
    [64, 90],
    [-64, 90]
  ];

  constructor (x: number, y: number, shipname: string) {
    super(x, y, "BotBlob", "Blindside");
    this.hp = 3;
    this.invul_time = 0;
    this.spawnToleranceRadius = 100;
    this.spawnToleranceShape = new Circle(this.x, this.y, this.spawnToleranceRadius);
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints, 0, 0.675, 0.675);
    this.collisionShape.id = this.id;
    this.collisionShape.type = 'Bot';
    this.agro = new Circle(this.x, this.y, 600);
  }

  public takeAction(playerList: any, collisionSystem: Collisions): DamageArtefact[] {
    var playersToConsider: any[] = [];
    var bullets: DamageArtefact[] = [];
    playerList.forEach((value: Player, key: string) => {
      if (value.collisionShape.type == "Player" && value.collisionShape.collides(this.agro)) {
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
    collisionSystem.remove(this.collisionShape);
    collisionSystem.insert(this.collisionShape);
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
};
