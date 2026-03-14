export type PlayerId = "P1" | "P2";
export type Phase = "ACTION"|"ROLL"|"REACTION"|"RESOLVE"|"DRAW"|"END";
export type CardId = "REVERSE"|"MULTIPLIER"|"ESCAPE"|"NEG_NEG_POS"|"HALF_DAMAGE"|"SET_ROLL"|"NULLIFY"|"SELF_HEAL"
export type CardTiming = "ACTION"|"REACTION"|"BOTH";

export type CardCategory= "VALUE"|"TARGET"|"OUTCOME"|"SIDE_EFFECT";

export type CardStacking= "EXCLUSIVE"|"STACKABLE";

export interface CardMeta{
    id: CardId
    timing: CardTiming
    category: CardCategory
    stacking: CardStacking

    exclusiveGroup?: string
}

export const CARD_META: Record<CardId, CardMeta>={
    MULTIPLIER: {id:"MULTIPLIER", timing:"ACTION", category:"VALUE", stacking:"STACKABLE"},
    SET_ROLL: {id:"SET_ROLL", timing:"ACTION", category:"VALUE", stacking:"STACKABLE"},
    SELF_HEAL: {id:"SELF_HEAL", timing:"ACTION", category:"SIDE_EFFECT", stacking:"STACKABLE"},

    REVERSE: {id:"REVERSE", timing:"REACTION", category:"TARGET", stacking:"EXCLUSIVE", exclusiveGroup:"DEF_OUTCOME"},
    ESCAPE: {id:"ESCAPE", timing:"REACTION", category:"OUTCOME", stacking:"EXCLUSIVE", exclusiveGroup:"DEF_OUTCOME"},
    NEG_NEG_POS: {id:"NEG_NEG_POS", timing:"REACTION", category:"OUTCOME", stacking:"EXCLUSIVE", exclusiveGroup:"DEF_OUTCOME"},
    HALF_DAMAGE: {id:"HALF_DAMAGE", timing:"REACTION", category:"OUTCOME", stacking:"EXCLUSIVE", exclusiveGroup:"DEF_OUTCOME"},

    NULLIFY: {id:"NULLIFY", timing:"BOTH", category:"OUTCOME", stacking:"STACKABLE"},
}

export type SetRollPayload={chosen:number};
export type MultiplierPayload={factor: 1|2|3};


export type PlayedCard=
    |{id:"SET_ROLL"; payload:SetRollPayload}
    |{id:"MULTIPLIER"; payload:MultiplierPayload}
    |{id:Exclude<CardId,"SET_ROLL"|"MULTIPLIER">; payload?: undefined}

export interface TurnFlags{
    attackerNullify?: boolean;
    defenderNullify?: boolean;
}

export interface TurnContext{
    attacker: PlayerId;
    defender: PlayerId;

    attackerCard?: PlayedCard;
    defenderCard?: PlayedCard;

    roll?: number;
    multiplier: number;
    flags: TurnFlags;
}


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
    turnCtx:TurnContext;
    winner?:PlayerId
}

export type GameAction=
    | {type: "PLAY_CARD"; player:PlayerId; cardId: "SET_ROLL"; payload: SetRollPayload}
    | {type: "PLAY_CARD"; player:PlayerId; cardId: "MULTIPLIER"; payload: MultiplierPayload}
    | {type: "PLAY_CARD"; player:PlayerId; cardId: Exclude<CardId, "SET_ROLL" | "MULTIPLIER">; payload?:undefined}
    | {type: "SKIP_CARD"; player:PlayerId}
    | {type: "ROLL_DICE"; player:PlayerId}
    | {type: "RESOLVE_ROLL"}
    | {type: "DRAW_CARD"}
    | {type: "DISCARD_CARD",player: PlayerId; cardId: CardId}
    | {type: "END_TURN", player: PlayerId}
    | {type: "RESET"}




