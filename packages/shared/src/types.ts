export type PlayerId = "P1" | "P2";
export type Phase = "Action"|"ROLL"|"RESOLVE"|"DRAW"|"END";
export type CardId = "REVERSE"|"MULTIPLER"|"ESCAPE"|"NEG_NEG_POS"
export interface PlayerState{
    id:PlayerId
    position:number;
    hand: CardId[];
}

export interface GameState{
    turn:number;
    currentPlayer:PlayerId;
    phase:Phase;
    deck:CardId[]
    discard:CardId[]
    players:Record<PlayerId,PlayerState>;
    lastroll?:{
        roller:PlayerId
        value:number
    }
    log:string[]
    winner?:PlayerId
}

export type GameAction=
    | {type: "PLAY_CARD"; player:PlayerId; card:CardId}
    | {type: "SKIP_CARD"; player:PlayerId}
    | {type: "ROLL_DICE"; player:PlayerId}
    | {type: "RESOLVE_ROLL"}
    | {type: "DRAW_CARD"}
    | {type: "END_TURN"}
    | {type: "RESET"}

