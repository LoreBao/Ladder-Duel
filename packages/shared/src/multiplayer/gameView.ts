import type {CardId,Phase, PlayedCard, PlayerId} from "../types";

export interface PlayerPublicView{
    id: PlayerId;
    position:number;
    handCount:number;
}

export interface PlayerSelfView extends PlayerPublicView{
    hand: CardId[];
}

export interface GameView{
    roomId:string;
    myPlayerId: PlayerId;

    turn: number;
    currentPlayer: PlayerId;
    phase:Phase;

    attacker: PlayerId;
    defender: PlayerId;
    attackerCard?: PlayedCard;
    defenderCard?: PlayedCard;
    roll?:number;

    me: PlayerSelfView;
    opponent: PlayerPublicView;

    winner?: PlayerId|"DRAW";
    log: string[];
}