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
    const currentplayer=state.currentPlayer
    const can=useMemo(()=>{
        const hasWinner:Boolean=state.winner!=undefined
        return{
            // Key :Action, Value: Boolean
            PLAY_CARD: !hasWinner&&state.phase==="ACTION",
            SKIP_CARD: !hasWinner&&state.phase==="ACTION",
            ROLL_DICE: !hasWinner&&state.phase==="ROLL",
            RESOLVE_ROLL: !hasWinner&&state.phase==="RESOLVE",
            DRAW_CARD: !hasWinner&&state.phase==="DRAW",
            END_TURN: !hasWinner&&state.phase==="END",
            RESET: true
        }
    },[state])
    return(
        <>
        <button>Picker Button</button>
        <div className="Gallery">Gallery</div>
        <p>Turn</p>

        <CardPanel player="P1" hands={state.players.P1.hand}/>
        <CardPanel player="P2" hands={state.players.P2.hand}/>
        <OperatePanel can={can} />
        <LogPanel log={state.log}/>

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
    <div className="LogPanel-Content">
        {log.length!==0&&
            log.map((msg,index)=>{
                return <div id={`${msg}-${index}`}>{msg}</div>
            })
        }
    </div>
    </>
)
// Div (scrollable):website search
// each log(string) be wrapped as Div tag
}

interface OperatePanelProps{
    can:Record<GameAction["type"],boolean>
    executeDispatch: (action:GameAction["type"])=>{}
}

function OperatePanel({can,executeDispatch}:OperatePanelProps){
    return(
        <>
        <button 
            disabled={!can.SKIP_CARD}
            onClick={()=>executeDispatch("SKIP_CARD")}>
                Skip
        </button>
        <button 
            disabled={!can.ROLL_DICE}  
            onClick={()=>executeDispatch("ROLL_DICE")}>Roll
        </button>
        <button 
            disabled={!can.RESOLVE_ROLL}
            onClick={()=>executeDispatch("RESOLVE_ROLL")}>Resolve
        </button>
        <button 
            disabled={!can.DRAW_CARD}
            onClick={()=>executeDispatch("DRAW_CARD")}>Draw
        </button>
        <button 
            disabled={!can.END_TURN}
            onClick={()=>executeDispatch("END_TURN")}>End
        </button>
        <button 
            disabled={!can.RESET}
            onClick={()=>executeDispatch("RESET")}>Reset
        </button>
        </>
    )
}



