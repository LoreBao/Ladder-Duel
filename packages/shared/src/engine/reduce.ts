import type { EngineDeps } from "./deps";
import { createDefaultDeps } from "./deps";
import { createInitalState } from "./init";
import { appendLog,clampPosition,getOpponent } from "./utils";
import { CARD_META, type CardCategory, type CardId, type GameAction, type GameState } from "../types";

export function allow(phase:GameState["phase"]):GameAction["type"][]{
    /*Allow Actions Based on Current Phase*/
    switch (phase){
        case "ACTION":
            return ["PLAY_CARD","SKIP_CARD","RESET"]
        case "ROLL":
            return ["ROLL_DICE","RESET"]
        case "REACTION":
            return ["PLAY_CARD","SKIP_CARD","RESET"]
        case "RESOLVE":
            return ["RESOLVE_ROLL","RESET"]
        case "DRAW":
            return ["DRAW_CARD","DISCARD_CARD","RESET"]
        case "END":
            return ["END_TURN", "RESET"]
    }
}

function removeOne(hand:CardId[], removeCard:CardId):{ok:true,next:CardId[]}|{ok:false}{
    if(!hand.includes(removeCard)){
        return {ok:false};
    }
    
    const removeIndex=hand.indexOf(removeCard);
    let next:CardId[]=[
        ...hand.slice(0,removeIndex),
        ...hand.slice(removeIndex+1)
    ];
    return {ok:true,next:next};
}

function drawOneWithReset(state:GameState,deps:EngineDeps):{state: GameState; card:CardId}{
    let deck=state.deck;
    if(deck.length===0){
        deck=deps.createFreshDeck();
        deck=deps.shuffle(deck);
        state=appendLog(
            {...state,deck},
            "Original Deck Empty, A New Deck is Created Automatically!"
        );
    }
    const firstCard=deck[0];
    let newState={...state , deck:deck.slice(1)}
    newState=appendLog(
        newState,
        `You Have Drawn ${firstCard}`
    );
    return {state:newState, card:firstCard};
}

function isIntInRange(x:unknown, lo:number, hi:number): x is number{
    return typeof x==="number"&& Number.isFinite(x)&&Number.isInteger(x)&&x>=lo&&x<=hi;
}

function getEffectiveCards(turnCtx:GameState["turnCtx"]):{
    attacker?: GameState["turnCtx"]["attackerCard"];
    defender?: GameState["turnCtx"]["defenderCard"];
    attackerNullify: boolean;
    defenderNullify: boolean;
} {
    const attackerNullify:boolean=!!turnCtx.flags.attackerNullify;
    const defenderNullify:boolean=!!turnCtx.flags.defenderNullify;

    const rawAttacker=turnCtx.attackerCard?.id==="NULLIFY"?undefined: turnCtx.attackerCard;
    const rawDefender=turnCtx.defenderCard?.id==="NULLIFY"?undefined: turnCtx.defenderCard;

    if(attackerNullify&&defenderNullify){
        return{
            attacker:undefined,
            defender:undefined,
            attackerNullify:attackerNullify,
            defenderNullify:defenderNullify
        }
    }
    else if(attackerNullify){
        return{
            attacker:rawAttacker,
            defender:undefined,
            attackerNullify:attackerNullify,
            defenderNullify:defenderNullify
        }
    }
    else if(defenderNullify){
        return{
            attacker:undefined,
            defender:rawDefender,
            attackerNullify:attackerNullify,
            defenderNullify:defenderNullify
        }
    }
    else{
        return{
            attacker:rawAttacker,
            defender:rawDefender,
            attackerNullify:attackerNullify,
            defenderNullify:defenderNullify
        }
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
    if(!allow(state.phase).includes(action.type)){
       return appendLog(state,`${action.type} at ${state.phase} is not allowed`);
    }
    const attacker=state.turnCtx.attacker;
    const defender=state.turnCtx.defender;

    switch(action.type){
        case "RESET":{
            return createInitalState(deps);
        }
        case "PLAY_CARD":{
            const cardMeta=CARD_META[action.cardId];
            if(state.phase==="ACTION"){
                if(action.player!==attacker){
                    return appendLog(state,`${state.phase} does not allow the player: ${action.player} to play card`)
                }
                if(state.turnCtx.attackerCard){
                    return appendLog(state,`A Card (${state.turnCtx.attackerCard}) Already Exists Before Attacker Plays a New Card`)
                }
                if(cardMeta.timing!="ACTION" && cardMeta.timing!="BOTH"){
                    return appendLog(state,`Wrong Timing (${state.turnCtx.attackerCard} is not allowed at ACTION , only allowed at ${cardMeta.timing})`)
                }
                return appendLog(state,`${state.phase} Not Allowed ${action.player} Play Card!`);
            }

            if(state.phase==="REACTION"){
                if(action.player!==defender){
                    return appendLog(state,`${state.phase} does not allow the player: ${action.player} to play card`)
                }
                if(state.turnCtx.defenderCard){
                    return appendLog(state,`A Card (${state.turnCtx.defenderCard}) Already Exists Before Defender Plays a New Card`)
                }
                if(cardMeta.timing!="REACTION" && cardMeta.timing!="BOTH"){
                    return appendLog(state,`Wrong Timing (${state.turnCtx.defenderCard} is not allowed at REACTION , only allowed at ${cardMeta.timing})`)
                }
                return appendLog(state,`${state.phase} Not Allowed ${action.player} Play Card!`);
            }
            
            if(!state.players[action.player].hand.includes(action.cardId)){
                return appendLog(state, `${action.cardId} not in ${action.player}'s hand`)
            }

            if(action.cardId==="SET_ROLL"){
                if(isIntInRange(action.payload.chosen,0,6)){
                    return appendLog(state, `${action.payload} out of r a n g e`)
                }
            }

            if(action.cardId==="MULTIPLIER"){
                if(action.payload.factor!==1&&action.payload.factor!==2&&action.payload.factor!==3){
                    return appendLog(state, `${action.payload.factor} out of range (1,2,3)`)
                }
            }

            const removeStatus=removeOne(state.players[action.player].hand,action.cardId);
            if(!removeStatus.ok){
                return appendLog(state, `remove ${action.cardId} failed`);
            }
            const newState:GameState = {
                ...state,
                players:{
                    ...state.players,
                    [action.player]:{
                        ...state.players[action.player],hand:removeStatus.next
                    }
                }
            }
            return appendLog(newState, "Play Card, Done");
        }

        case "SKIP_CARD":{
            if(state.phase==="ACTION"){
                if(action.player!=attacker){
                    return appendLog(state,`${action.player} is not the attacker`);
                }
                let newState = { ...state };
                newState.phase = "ROLL";
                return appendLog(newState, `${action.player} Skip's Card`);
            }
            else if(state.phase==="REACTION"){
                if(action.player!=defender){
                    return appendLog(state,`${action.player} is not the defender`);
                }
                let newState = { ...state };
                newState.phase = "ROLL";
                return appendLog(newState, `${action.player} Skip's Card`);  
            }
        }

        case "ROLL_DICE":{
            const diceValue=deps.rollDice();
            let newState={...state};
            newState.lastroll={
                roller:state.currentPlayer,
                value:diceValue
            }
            newState.phase="RESOLVE";
            return appendLog(newState,`${newState.currentPlayer} Has Rolled a Value of ${diceValue}`);
        }

        case "RESOLVE_ROLL":{
            if(!state.lastroll){
                let newState={...state};
                newState.phase="DRAW"
                return appendLog(newState, "Error: Without Essential Last Roll");
            }

            const target=getOpponent(state.lastroll.roller);
            const delta=-state.lastroll.value
            
            const newPosition=clampPosition(state.players[target].position+delta)
            let newState={...state};
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
                let newState={...state};
                newState.phase="END"
                return appendLog(newState, "End Turn")
            }
            const drawCard=state.deck.pop()  
            let newState={...state};
            if(drawCard!==undefined){
                 newState.players[state.currentPlayer].hand = [...newState.players[state.currentPlayer].hand, drawCard]
            }

            newState.phase="END";
            return appendLog(newState,`${newState.currentPlayer} has drawn ${drawCard}!`);
        }

        case "END_TURN":{
            let newState={...state};
            newState.turn+=1;
            newState.phase="ACTION"
            newState.currentPlayer=getOpponent(newState.currentPlayer);
            newState.lastroll=undefined;
            return appendLog(newState, `End of Turn, Changing Player ${newState.currentPlayer}`);
        }
    }
}