import React ,{ startTransition, StaticLifecycle, use, useMemo, useReducer } from "react";
import {createInitalState, reduce} from "@ladder-duel/shared"
import type {GameState,GameAction, PlayerId,CardId} from "@ladder-duel/shared"

function reduceFn(state:GameState,action:GameAction){
    return reduce(state,action)
}
export function GamePage(){
    const initState=useMemo(()=>{
        return createInitalState();
    },[]);
    const [state,dispatch]=useReducer(reduceFn,initState)
    state.currentPlayer
    return(
        <>
        <button>Picker Button</button>
        <div className="Gallery">Gallery</div>
        <p>Turn</p>

        <CardPanel player="P1" hands={state.players.P1.hand}/>
        <CardPanel player="P2" hands={state.players.P2.hand}/>

        <div className="operationBtns">
            <h1>Operation Buttons</h1>
        </div>

        <div className="log">
            <h1>Log Panel</h1>
        </div>
        </>
    )
}

interface CharacterPickerProps{
    //TO-DO
}
function CharacterPicker(){
    //TO-DO
}

interface CardPanelProps{
    player: PlayerId
    hands: CardId[]
}

function CardPanel({player,hands}:CardPanelProps){
    return(
        <div className="CardPanel" id={player}>
            <h1>{player}</h1>
            <div>
            {hands.length!==0&&
                hands.map((card)=>{
                    return <button id={card}>{card}</button>
                })
            }
            </div>
        </div>
    )
}

interface LogPanelProps{
    log: string[]
}

function LogPanel({log}:LogPanelProps){
// HW 15: DDL 2/3(Tuesday) 17:00
// including H1 Title
return(
    <>
    <h1 className="LogPanel">Log Panel</h1>
    <div className="LogPanel">
        {log.length!==0&&
            log.map((msg)=>{
                return <div id={msg}>{msg}</div>
            })
        }
    </div>
    </>
)
// Div (scrollable):website search
// each log(string) be wrapped as Div tag
}

interface OperatePanelProps{
    can:Object
}

function OperatePanel(){

}



