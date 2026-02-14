import React ,{ startTransition, StaticLifecycle, use, useMemo, useReducer, useState, useRef, useEffect } from "react";
import {createDefaultDeps, createInitalState, reduce} from "@ladder-duel/shared"
import type {GameState,GameAction, PlayerId,CardId} from "@ladder-duel/shared"
import "./GamePage.css"
/* HW 18: Generate GamePage.css file
Limitation:
1. GamePage.tsx: Only allowed to modify "class" , "id" in each HTML tag 
2. GamePage.css : allowed to modify by AI
Requirements:
1. Layout: HW14 (HackMD)
2. Your style

Another HW:
1. Modify your gallery(canvas)
DDL: 2/15 20:00 p.m.
*/

function reduceFn(state:GameState,action:GameAction){
    return reduce(state,action)
}
/* HW 16 Color Picker Typing*/
type PlayerColor = "red" | "blue" 
const COLOR_OPTIONS : PlayerColor[] = ["red" , "blue"]

export function GamePage(){
    const initState=useMemo(()=>{
        return createInitalState(createDefaultDeps());
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
        <Gallery
            p1Color={playerColor.P1}
            p2Color={playerColor.P2}
            p1Level={state.players.P1.position}
            p2Level={state.players.P2.position}
            maxLevel={120}
            width={800}
            height={600}
        />
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
    useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ensure canvas size matches props
    canvas.width = width;
    canvas.height = height;
        
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---------- Helpers ----------
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    // map level -> y position (top = maxLevel, bottom = 0)
    const levelToY = (level: number) => {
        const padTop = 60;
        const padBottom = 60;
        const usableH = height - padTop - padBottom;
        const t = clamp(level, 0, maxLevel) / maxLevel; // 0..1
        // t=1 => near top, t=0 => near bottom
        return padTop + (1 - t) * usableH;
    };

    // ---------- Clear & background ----------
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // ---------- Center "mountain rock" rectangle ----------
    const rockW = Math.max(60, width * 0.14);
    const rockH = Math.max(260, height * 0.62);
    const rockX = (width - rockW) / 2;
    const rockY = (height - rockH) / 2;

    ctx.fillStyle = "#9aa0a6"; // rock color
    ctx.fillRect(rockX, rockY, rockW, rockH);

    // rock outline
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 3;
    ctx.strokeRect(rockX, rockY, rockW, rockH);

    // ---------- P1 (left) ----------
    const p1X = width * 0.22;
    const p1Y = levelToY(p1Level);

    // P1 sphere
    const r = 18;
    ctx.beginPath();
    ctx.fillStyle = p1Color || "red";
    ctx.arc(p1X, p1Y, r, 0, Math.PI * 2);
    ctx.fill();

    // P1 label (text + level)
    ctx.fillStyle = p1Color || "red";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("P1", p1X, p1Y - r - 8);

    ctx.font = "14px Arial";
    ctx.textBaseline = "top";
    ctx.fillText(`Lv ${p1Level}`, p1X, p1Y + r + 8);

    // ---------- P2 (right) ----------
    const p2X = width * 0.78;
    const p2Y = levelToY(p2Level);

    // P2 sphere
    ctx.beginPath();
    ctx.fillStyle = p2Color || "blue";
    ctx.arc(p2X, p2Y, r, 0, Math.PI * 2);
    ctx.fill();

    // P2 label (text + level)
    ctx.fillStyle = p2Color || "blue";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("P2", p2X, p2Y - r - 8);

    ctx.font = "14px Arial";
    ctx.textBaseline = "top";
    ctx.fillText(`Lv ${p2Level}`, p2X, p2Y + r + 8);

    // ---------- Scale (maxLevel -> 0) ----------
    const scaleX = width - 60;
    const scaleTop = 60;
    const scaleBottom = height - 60;

    // scale line
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scaleX, scaleTop);
    ctx.lineTo(scaleX, scaleBottom);
    ctx.stroke();

    // ticks
    const tickCount = 6; // includes top/bottom-ish ticks
    ctx.font = "12px Arial";
    ctx.fillStyle = "#111827";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= tickCount; i++) {
        const t = i / tickCount; // 0..1 downward
        const y = scaleTop + t * (scaleBottom - scaleTop);
        const level = Math.round(maxLevel * (1 - t));

        ctx.beginPath();
        ctx.moveTo(scaleX - 8, y);
        ctx.lineTo(scaleX + 8, y);
        ctx.stroke();

        // label every other tick (less clutter)
        if (i % 2 === 0) ctx.fillText(String(level), scaleX + 14, y);
    }

    // Explicit max & 0 labels (to satisfy requirement clearly)
    ctx.font = "13px Arial";
    ctx.fillText(String(maxLevel), scaleX + 14, scaleTop);
    ctx.fillText("0", scaleX + 14, scaleBottom);

    // Mark P1 / P2 level positions on scale
    const p1ScaleY = levelToY(p1Level);
    const p2ScaleY = levelToY(p2Level);

    ctx.lineWidth = 3;

    // P1 marker
    ctx.strokeStyle = p1Color || "red";
    ctx.beginPath();
    ctx.moveTo(scaleX - 14, p1ScaleY);
    ctx.lineTo(scaleX + 14, p1ScaleY);
    ctx.stroke();
    ctx.fillStyle = p1Color || "red";
    ctx.fillText("P1", scaleX - 40, p1ScaleY);

    // P2 marker
    ctx.strokeStyle = p2Color || "blue";
    ctx.beginPath();
    ctx.moveTo(scaleX - 14, p2ScaleY);
    ctx.lineTo(scaleX + 14, p2ScaleY);
    ctx.stroke();
    ctx.fillStyle = p2Color || "blue";
    ctx.fillText("P2", scaleX - 40, p2ScaleY);
    }, [p1Color, p2Color, p1Level, p2Level, maxLevel, width, height]);

    return(
        <div>
            <canvas ref={canvasRef}></canvas> 
        </div>
    )
}

