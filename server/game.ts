////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                                Server - Game                               //
////////////////////////////////////////////////////////////////////////////////

import { ScoreBoard } from './scoreBoard';
import { Player } from './player';
/*
import { Bot } from './bot';
import { Station } from './station';
import { DamageArtefact } from './damageArtefact';
import { DebrisField } from './debrisField';
import { Asteroid } from './asteroid';
import { FuelCell } from './fuelCell';
*/

const BULLET_LIFETIME = 5000; // ms

export class Game {
    // Game Elements
    private players: Map<String, Player> = new Map<String, Player>(); 
    /*
    private bots: Map<String, Bot> = new Map<String, Bot>();  
    private damageArtefacts: Map<String, DamageArtefact> = new Map<String, DamageArtefact>();
    private stations: Map<String, Station> = new Map<String, Station>();
    private debrisField: Map<String, DebrisField> = new Map<String, DebrisField>();
    private asteroids: Map<String, Asteroid> = new Map<String, Asteroid>();
    private fuelCells: Map<String, FuelCell> = new Map<String, FuelCell>();
    private scoreBoard: ScoreBoard; // The list of scores form active players
    */
    // Game Propertires
    private fuelCellsMax: number = 15; 
    private botsMax: number = 1;
    private debrisFieldMax: number = 3;
    private stationsMax: number = 10; 
    private asteroidsMax: number = 4;  
    private canvasHeight: number = 2000;  
    private canvasWidth: number = 2000; 
    private delta: number = 1; // Advances by one each game update cycle (related to player invulnerability)
    private mod: number = 120;  // Arbitrary integer variable, used to define invulnerability time

    constructor() {
    }
    
    public updateGame(): void {

    }
}

