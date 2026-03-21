import type { EngineDeps } from "./deps";
import { createDefaultDeps } from "./deps";
import { createInitalState } from "./init";
import { appendLog,clampPosition,getOpponent } from "./utils";
import { CARD_META, PlayerId, type CardCategory, type CardId, type GameAction, type GameState } from "../types";

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
            if(action.player!==attacker){
                return appendLog(state,`${action.player} is not attacker, cannot roll dice`)
            }

            let newValue=0;
            if(state.turnCtx.attackerCard==="SET_ROLL"&&state.turnCtx.attackerCard.payload){
                if(isIntInRange(state.turnCtx.attackerCard.payload.chosen,0,6)){
                    newValue=state.turnCtx.attackerCard.payload.chosen
                    state=appendLog(state,`SET_ROLL use successfully, dice value is now ${newValue}`)
                }
                else{
                    newValue= deps.rollDice();
                    state=appendLog(state, "SET_ROLL Card Could Exceed Limit or Not an Interger, Fallback to Ro11ing Dice")
                }
            }
            else{
                newValue=deps.rollDice()
                state=appendLog(state,`Roll Dice (${newValue}) Succcessful`)
            }

            return {
                ...state,
                turnCtx:{
                    ...state.turnCtx,
                    roll:newValue
                },
                phase:"REACTION"
            };

        }

        case "RESOLVE_ROLL":{
            const baseRoll=state.turnCtx.roll
            if(!isIntInRange(baseRoll,0,6)){
                return appendLog(state, "Roll Dice Value Does not Follow the Rules")
            }
            const effectiveness=getEffectiveCards(state.turnCtx)
            if(effectiveness.attackerNullify&&effectiveness.defenderNullify){
                state=appendLog(state,"Both (Attacker & Defender) Cards are Nullfied")
            }
            else if(effectiveness.attackerNullify){
                state=appendLog(state,"Defender Card Nullify")
            }
            else if(effectiveness.defenderNullify){
                state=appendLog(state,"Attacker Card Nullify")
            }

            state=appendLog(state,`current baseroll: ${baseRoll}`)
            let m=state.turnCtx.multiplier;
            if(m!==1&&m!=2&&m!==3){
                state=appendLog(state,`Multiplier Number (${m}) cannot be used, switch to default value--1`)
                m=1
            }
            let finalValue=baseRoll*m
            let target:"attacker"|"defender"="defender"
            let attackerCard=effectiveness.attacker;
            let defenderCard=effectiveness.defender;
            if(defenderCard?.id==="REVERSE"){
                target="attacker"
                state=appendLog(state,`Defender has used ${defenderCard}, Roles are Reversed!!!!!`)
            }

            const nextPlayers={...state.players}
            // players:record<PlayerID,PlayerState>
            // playerState: Object=> id, position, hand

            const applyDelta=(playerid:PlayerId,delta:number)=>{
                nextPlayers[playerid] ={
                    ...nextPlayers[playerid],
                    position:clampPosition(nextPlayers[playerid].position+delta)
                }
            }
            // Processing Outcome
            if(target==="attacker"){
                applyDelta(attacker,-finalValue)
                state=appendLog(state,"REVERSE CARD::: Current Target is now the Attacker! Attacker will fall down")
            }
            else{
                if(defenderCard?.id==="ESCAPE"){
                    applyDelta(defender,0);
                    state=appendLog(state, "ESCAPE CARD::: Defender has Moved 0 Steps")
                }
                else if(defenderCard?.id==="NEG_NEG_POS"){
                    applyDelta(defender, finalValue);
                    state=appendLog(state, `NEG_NEG_POS::: Defender has went up ${finalValue} steps`)
                }
                else if(defenderCard?.id==="HALF_DAMAGE"){
                    applyDelta(defender, -Math.ceil(finalValue/2));
                    state=appendLog(state, `HALF DAMAGE ::: Defender has went down ${Math.ceil(finalValue/2)} steps`)
                }
                else{
                    applyDelta(defender,-finalValue)
                    state=appendLog(state, "Current Target is now the Defender! Defender will fall down")
                }                
            }
            // Processing Side-effect
            if(attackerCard?.id==="SELF_HEAL"){
                applyDelta(attacker,baseRoll)
                state=appendLog(state,`SELF HEAL::: Attacker has healed himself for ${baseRoll}`)
            }

            let nextState={...state,players:nextPlayers}

            if(nextState.players.P1.position<=0 && nextState.players.P2.position<=0){
                nextState={...nextState,winner:"DRAWN"}
            }
            else if(state.players.P1.position<=0){
                nextState={...nextState,winner:"P2"}   
            }
            else{
                nextState={...nextState,winner:"P1"}
            }
            nextState=appendLog(nextState,`Winners are ${nextState.winner}`)
            nextState={...nextState,phase:"DRAW"}
            return nextState;
        }

        case "DRAW_CARD":{
            const cPlayer=state.currentPlayer;
            if(state.deck.length===0){
                const newDeck=deps.shuffle(deps.createFreshDeck())  
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