export interface EngineDeps{
    rollDice():number;
    createFreshDeck(): CardId[];
    shuffle<T>(xs:T[]): T[];
}

export function createDefaultDeps(): EngineDeps{
    return {
        rollDice:()=>{
            return Math.floor((Math.random())*7)
        }
    }
}