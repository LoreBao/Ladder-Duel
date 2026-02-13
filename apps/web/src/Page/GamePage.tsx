import React ,{ startTransition, StaticLifecycle, use, useMemo, useReducer, useState, useRef, useEffect } from "react";
import {createInitalState, reduce} from "@ladder-duel/shared"
import type {GameState,GameAction, PlayerId,CardId} from "@ladder-duel/shared"

function reduceFn(state:GameState,action:GameAction){
    return reduce(state,action)
}
/* HW 16 Color Picker Typing*/
type PlayerColor = "red" | "blue" 
const COLOR_OPTIONS : PlayerColor[] = ["red" , "blue"]

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

    // HW16 - Color Picker
    const [colorPickerState,setColorPickerState]= useState<boolean>(false)
    const [playerColor, setPlayerColor]= useState<Record<PlayerId,PlayerColor>>(
        {
            P1:"blue",
            P2:"red"
        }
    )
    // HW16 TODO: Complete Interface function Here
    function onChange(player: PlayerId, color: PlayerColor){
        // TODO
        // Change Color Using SetPlayerColor (State) from given variable "Player"
        // Base on Player change corresponding color
        const nPlayerColor=playerColor
        nPlayerColor[player]=color
        setPlayerColor(nPlayerColor)
    }
    // function onClose(){
        
    // }
    function executeDispatchFn(actionType:GameAction["type"]){
        if(actionType==="PLAY_CARD"||actionType==="SKIP_CARD"||actionType==="ROLL_DICE"){
            if(actionType==="PLAY_CARD"){
                dispatch({
                    type:actionType,
                    player:currentplayer,
                    card:"MULTIPLER"
                })
            }
            else{
                dispatch({
                    type:actionType,
                    player:currentplayer
                })
            }
        }
        else if(actionType==="RESOLVE_ROLL"||actionType==="DRAW_CARD"||actionType==="END_TURN"||actionType==="RESET"){
            dispatch({
                type:actionType
            })
        }
        return

    }

    return(
        <>
        <button onClick={()=>{
            setColorPickerState(!colorPickerState);
            }
        }>Picker Button</button>
        <CharacterPicker open={colorPickerState} value={playerColor} onChange={onChange} onClose={()=>{
            setColorPickerState(!colorPickerState)
        }}/>
        <div className="Gallery">Gallery</div>
        <p>Turn {state.turn}-{state.currentPlayer}</p>
        <p>P1 Position: {state.players.P1.position}</p>
        <p>P2 Position: {state.players.P2.position}</p>
        <p>Current Roll: {state.lastroll?state.lastroll.value:""}</p>



        <CardPanel player="P1" hands={state.players.P1.hand}/>
        <CardPanel player="P2" hands={state.players.P2.hand}/>
        <OperatePanel can={can} executeDispatch={executeDispatchFn} />
        <LogPanel log={state.log}/>

        </>

    )
}

interface CharacterPickerProps {
  open: boolean;                                                //控制「彈窗要不要出現」
  value: Record<PlayerId, PlayerColor>;                         //提供「目前 P1 / P2 各自選到什麼顏色」的狀態給 CharacterPicker 顯示                          
  onChange: (player: PlayerId, color: PlayerColor) => void;     // 當使用者在 picker 裡「選某個 player 的顏色」時，通知外部（GamePage）去更新 UI state
  onClose: () => void;                                          //通知外部關閉彈窗                                        
}
function CharacterPicker({open,value,onChange,onClose}:CharacterPickerProps){
    //HW16 - TO-DO
    // Render Color Picker Pannel
    changeColor()
    if(!open){
        return;
    }
    
    return(
        <>
        <div id="p1">
            <h1>
                P1 Color Picker
            </h1>
            <div id="ColorsP1">

                {/* Render many color Btns => suggest to use .map*/}
                {COLOR_OPTIONS.map((color)=>{
                    return(
                    <button 
                        id={color}
                        onClick={
                            ()=>{
                                onChange("P1",color)
                                changeColor();
                            }
                        }>{color}</button>
                    )
                })}
                {/* Each Rendered btns should like:
                    {/* button->for blue. click this button, button call onChange(P1,"blue") */}

                    <button 
                    >red</button>
                
            </div>

        </div>

        <div id="p2">
        <h1>
            P1 Color Picker
        </h1>
        <div id="ColorsP2">

                {COLOR_OPTIONS.map((color)=>{
                    return(
                    <button 
                        id={color}
                        onClick={
                            ()=>{
                            onChange("P2",color)
                            changeColor();
                            }
                        }   
                        >{color}</button>
                    )
                })}
                {/* Each Rendered btns should like:
                    {/* button->for blue. click this button, button call onChange(P1,"blue") */}

                    <button 
                    onClick={
                        ()=>{
                        onChange("P2","blue")
                        changeColor();
                        }
                    }
                    >blue</button>
                 
        </div>
        </div>
        </>
        
    )
        // header 1 
        // P1 : Picker Div
            // Color Btns
        // P2 : Picker Div
            // Color Btns
        // Closed Btn
    // Minimun Completion Requirement
    // 1. Can Render the whole Componet
    // 2. At least can Change playerColor state (Console)
    // Hint: useEffect, EventListener, Father/Chilren Component Communication (ref: HW10)
}

function changeColor(){
    console.log("Color has Changed!")
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
    executeDispatch: (action:GameAction["type"])=>void
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

type GalleryProps={

    p1Color: string;
    p2Color: string;
    p1Level: number;
    p2Level: number;
    maxLevel?: number;
    width?:number;
    height?: number;

}

function Gallery({
    p1Color,
    p2Color,
    p1Level,
    p2Level,
    maxLevel=120,
    width=600,
    height=600,
}: GalleryProps){
    const canvasRef=useRef<HTMLCanvasElement|null>(null);
    useEffect(()=>{
        // use Canvas to paint
        // HW 17 
        // Limitation:
        // 1. only providing Component of Gallery source code
        // 2. only modified code in the callback of useEffect
        // Styling Limiation
        // 1. must containing: P1/P2 text, level, color

    },[p1Color,p2Color,p1Level,p2Level,maxLevel,width,height])
    return(
        <div>
            <canvas ref={canvasRef}></canvas> /**Canvas Ref. Current */
        </div>
    )
}

function canvasPatient(){
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    // 1. Clear Canvas
    ctx.clearRect(0,0,300,300)
    // 2. Draw Circle, Square, Triangle
    ctx.beginPath();
    ctx.arc(30, 60, 3, 4, 5);
    ctx.fill();

    ctx.fillStyle = "#2196F3";
    ctx.fillRect(140, 50, 60, 60);

    ctx.beginPath();
    ctx.moveTo(260,110);
    ctx.lineTo(230,50);
    ctx.lineTo(290,50);
    ctx.closePath();
    ctx.fillStyle = "#FF5722";
    ctx.fill();
    // 3. Write Text (or Draw) "120"

    ctx.font = "20px Arial";
    ctx.fillText("120", 50, 50);

}