////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                            Server - ScoreBoard                             //
////////////////////////////////////////////////////////////////////////////////

export class ScoreBoard {
    private scores: Map<string, number> = new Map<string, number>();

    constructor() {
    }
  
    public addPlayer(username: string) {
      this.scores.set(username, 0);
    }
  
    public removePlayer(username) {
      this.scores.delete(username);
    }
  
    public updateScore(username) {
      this.scores.set(username, this.scores.get(username) + 1);
    }
}
  