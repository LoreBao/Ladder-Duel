import type { GameState, PlayerId } from "../types";

export function getOpponent(p:PlayerId): PlayerId{
    if(p==="P1"){
        return "P2";
    }
    else{
        return "P1"
    }
}

export function clampPosition(pos:number):number{
    if(pos<0){
        return 0;
    }
    else if(pos>120){
        return 120;
    }
    return pos;
}

export function appendLog(state:GameState,message:string):GameState{
    const newState=state;
    const messageTemplate=`[${state.turn}][${state.currentPlayer}][${state.phase}] ${message}`
    newState.log.push(messageTemplate);
    return newState;
}

