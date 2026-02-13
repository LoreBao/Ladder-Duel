import type { CardId, GameState, PlayerId, PlayerState } from "../types";
import { EngineDeps } from "./deps";
import { getOpponent } from "./utils";

export function createPlayer(id:PlayerId, initialHand:CardId[]):PlayerState{
    return{
        id:id,
        position:120,
        hand:initialHand
    }
}

export function createInitalState(deps:EngineDeps):GameState{
    let newDeck=deps.createFreshDeck();
    newDeck=deps.shuffle(newDeck);
    
    const firstDraw = drawN(newDeck,3,deps);
    newDeck = firstDraw.deck

    const secondDraw = drawN(newDeck,3,deps)
    newDeck = secondDraw.deck

    return{
        turn:0,
        currentPlayer:"P1",
        phase:"ACTION",
        deck:newDeck,
        discard:[],
        players:{
            P1: createPlayer("P1",firstDraw.cards),
            P2: createPlayer("P2",secondDraw.cards)
        },
        turnCtx:{
            attacker:"P1",
            defender:getOpponent("P1"),

            multiplier: 1,
            flags:{
                attackerNullify:false,
                defenderNullify:false
            }
        },
        log: ["[T1][P1][ACTION] Game Started"]
    }
}

function drawOne(deck:CardId[],deps:EngineDeps):{deck:CardId[]; card:CardId}{
    let d = deck.slice()
    if(d.length===0){
        d=deps.createFreshDeck();
        d=deps.shuffle(d);
    }
    const tookOut=d[0];
    return {deck:d.slice(1), card:tookOut};
}

function drawN(deck:CardId[], n:number, deps: EngineDeps):{deck:CardId[];cards:CardId[]}{
    if(n<=0){
        return {deck:deck,cards:[]};
    }
    const returnDrawCard:CardId[]=[]
    for(let i=0; i<n; i++){
        const returnDraw=drawOne(deck,deps);
        returnDrawCard.push(returnDraw.card);
        deck=returnDraw.deck;
    }
    return {deck:deck,cards:returnDrawCard};
}
