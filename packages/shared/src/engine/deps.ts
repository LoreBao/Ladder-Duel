export interface EngineDeps{
    rollDice():number;
}

export function createDefaultDeps(): EngineDeps{
    return {
        rollDice:()=>{
            return Math.floor((Math.random())*7)
        }
    }
}