////////////////////////////////////////////////////////////////////////////////
//                             Space Ship Battles                             //
//                                                                            //
//                                Server - Room                               //
////////////////////////////////////////////////////////////////////////////////

import { Game } from './game';

const UPDATE_TIME = 0.06; // sec

export class Room {
    public name: String;
    private game: Game;

    constructor(num: number) {
        this.name = 'room' + num;
        this.game = new Game();
        setInterval(this.game.updateGame, 1000 * UPDATE_TIME);
    }
}