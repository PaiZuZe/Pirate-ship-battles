////////////////////////////////////////////////////////////////////////////////
//                            Space Ship Battles                              //
//                                                                            //
//                            Server - ScoreBoard                             //
////////////////////////////////////////////////////////////////////////////////

export class ScoreBoard {
    public scores: Map<string, number> = new Map<string, number>();

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

    public asObj() {
      var obj: any = {};
      this.scores.forEach((value: number, key: string) => {
        obj[key] = value;
      });
      return obj;
    }
}
  