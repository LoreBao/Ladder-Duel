import type { EngineDeps } from "./deps";
import { createDefaultDeps } from "./deps";
import { createInitalState } from "./init";
import { appendLog,clampPosition,getOpponent } from "./utils";
import type { GameAction, GameState } from "../types";

export function allow(phase:GameState["phase"]):GameAction["type"][]{
    /*Allow Actions Based on Current Phase*/
    switch (phase){
        case "ACTION":
            return ["PLAY_CARD","SKIP_CARD","RESET"];
        case "ROLL":
            return ["ROLL_DICE","RESET"]
        case "RESOLVE":
            return ["RESOLVE_ROLL","RESET"]
        case "DRAW":
            return ["DRAW_CARD","RESET"]
        case "END":
            return ["END_TURN", "RESET"]
    }
}

export function reduce(
    state: GameState,
    action: GameAction,
    deps: EngineDeps=createDefaultDeps()
): GameState{
    if(state.winner&&action.type!=="RESET"){
        return appendLog(state,"Game Has Ended!");
    }
    if("player" in action&&action.player!==state.currentPlayer){
        return appendLog(state,`Action ${action.player} Didn't Match With ${state.currentPlayer}`);
    }

    switch(action.type){
        case "RESET":{
            return createInitalState();
        }
        
        case "PLAY_CARD":{
            return appendLog(state,"Incomplete");
        }

        case "SKIP_CARD":{
            let newState=state;
            newState.phase="ROLL";
            return appendLog(newState,"Skip Card");
        }

        case "ROLL_DICE":{
            const diceValue=deps.rollDice();
            let newState=state;
            newState.lastroll={
                roller:state.currentPlayer,
                value:diceValue
            }
            newState.phase="RESOLVE";
            return appendLog(newState,`${newState.currentPlayer} Has Rolled a Value of ${diceValue}`);
        }

        case "RESOLVE_ROLL":{
            if(!state.lastroll){
                let newState=state;
                newState.phase="DRAW"
                return appendLog(newState, "Error: Without Essential Last Roll");
            }

            const target=getOpponent(state.lastroll.roller);
            const delta=-state.lastroll.value
            
            const newPosition=clampPosition(state.players[target].position+delta)
            let newState=state;
            newState.players[target].position=newPosition;
            newState.phase="DRAW"
            newState=appendLog(newState, `${target}->${newPosition}`)
            
            if(newPosition<=0){
                newState.winner=getOpponent(target);
            }

            return appendLog(newState, `Winner is ${newState.winner}`)
        }

        case "DRAW_CARD":{
            if(state.deck.length===0){
                let newState=state;
                newState.phase="END"
                return appendLog(newState, "End Turn")
            }
            const drawCard=state.deck.pop()  
            let newState=state;
            if(drawCard!==undefined){
                 newState.players[state.currentPlayer].hand = [...newState.players[state.currentPlayer].hand, drawCard]
            }

            newState.phase="END";
            return appendLog(newState,`${newState.currentPlayer} has drawn ${drawCard}!`);
        }

        case "END_TURN":{
            let newState=state;
            newState.turn+=1;
            newState.phase="Action"
            newState.currentPlayer=getOpponent(newState.currentPlayer);
            newState.lastroll=undefined;
            return appendLog(newState, `End of Turn, Changing Player ${newState.currentPlayer}`);
        }
    }
}