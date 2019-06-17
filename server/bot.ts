////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                              Server - Bot                                  //
////////////////////////////////////////////////////////////////////////////////

import { Player } from './player';
import { Polygon, Circle } from './collisions/Collisions'
import { rotate, distSq } from './aux';
import { DamageArtefact, PrimaryFire } from './damageArtefact';
import { Agent } from './agent';

const BULLET_COOLDOWN = 1500; // ms



export class Bot extends Agent {
  public invul_time: number;
  public agro: Circle;

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
    super(x, y, "BotBlob", "ship-alt");
    this.hp = 3;
    this.invul_time = 0;
    this.collisionShape = new Polygon(this.x, this.y, this.polygonPoints);
    this.collisionShape.id = this.id;
    this.collisionShape.type = 'Bot';
    this.agro = new Circle(this.x, this.y, 600);
  }

  public takeAction(playerList: any): DamageArtefact[] {
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
