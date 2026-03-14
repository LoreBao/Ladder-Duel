import { CARD_META, CardId } from "../types";

export interface EngineDeps{
    rollDice():number;
    createFreshDeck(): CardId[];
    shuffle<T>(xs:T[]): T[];
}

export function createDefaultDeps(): EngineDeps{
    return {
        rollDice:()=>{
            return Math.floor((Math.random())*7)
        },
        createFreshDeck():CardId[]{
            const all:CardId[]=["REVERSE","MULTIPLIER","ESCAPE","NEG_NEG_POS","HALF_DAMAGE","SET_ROLL","NULLIFY","SELF_HEAL"]
            const deck:CardId[]=[];
            for(const c of all){
                deck.push(c,c);
            }
            return deck;
        },        
        shuffle<T>(xs:T[]):T[]{
            const newXs=xs.slice();
            for(let i=newXs.length-1; i>0; i--){
                let j=Math.floor(((i+1)*Math.random()));
                [newXs[i],newXs[j]]=[newXs[j],newXs[i]];
            }
            return newXs;
        }
    }
}
    