import type { CardId, GameState, PlayerId, PlayerState } from "../types";

export function createPlayer(id:PlayerId, initialHand:CardId[]):PlayerState{
    return{
        id:id,
        position:120,
        hand:initialHand
    }
}

export function createInitalState():GameState{
    const initDeck:CardId[]=["REVERSE","ESCAPE","NEG_NEG_POS","MULTIPLER"]
    
    return{
        turn:0,
        currentPlayer:"P1",
        phase:"ACTION",
        deck:initDeck,
        discard:[],
        players:{
            P1: createPlayer("P1",initDeck.slice(3)),
            P2: createPlayer("P2",initDeck.slice(3))
        },
        log: ["[T1][P1][ACTION] Game Started"]
    }
}

