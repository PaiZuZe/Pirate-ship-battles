////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                            Server - ScoreBoard                             //
////////////////////////////////////////////////////////////////////////////////

export class ScoreBoard {
    private scores: Map<String, number> = new Map<String, number>();

    constructor() {
    }
  
    public addPlayer(username: String) {
      this.scores.set(username, 0);
    }
  
    public removePlayer(username) {
      this.scores.delete(username);
    }
  
    public updateScore(username) {
      this.scores.set(username, this.scores.get(username) + 1);
    }
}
  