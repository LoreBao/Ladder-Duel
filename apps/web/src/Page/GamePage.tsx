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
    maxLevel = 120,
    width = 600,
    height = 600,
}: GalleryProps) {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // ---------- Helpers ----------
        const clamp = (v: number, min: number, max: number) =>
            Math.max(min, Math.min(max, v));

        const levelToY = (level: number) => {
            const padTop = 60;
            const padBottom = 60;
            const usableH = height - padTop - padBottom;
            const t = clamp(level, 0, maxLevel) / maxLevel;
            return padTop + (1 - t) * usableH;
        };

        // ---------- Clear ----------
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // =====================================================
        //  CENTER MOUNTAIN CLIFF (VERTICAL CLIMB)
        // =====================================================

        const cliffW = Math.max(90, width * 0.22);
        const cliffH = Math.max(280, height * 0.68);
        const cliffX = (width - cliffW) / 2;
        const cliffY = (height - cliffH) / 2;

        // 右側 = 幾乎垂直的攀爬面
        const wallX = cliffX + cliffW * 0.72;

        const jag = (amp: number) => (Math.random() * 2 - 1) * amp;

        const topY = cliffY;
        const botY = cliffY + cliffH;

        // 不規則岩體輪廓
        const p0 = { x: wallX, y: topY + 8 };
        const p1 = { x: cliffX + cliffW * 0.15 + jag(10), y: topY + cliffH * 0.08 };
        const p2 = { x: cliffX + cliffW * 0.05 + jag(12), y: topY + cliffH * 0.30 };
        const p3 = { x: cliffX + cliffW * 0.18 + jag(12), y: topY + cliffH * 0.55 };
        const p4 = { x: cliffX + cliffW * 0.08 + jag(10), y: topY + cliffH * 0.82 };
        const p5 = { x: wallX, y: botY - 8 };

        // 岩石漸層（增加立體感）
        const rockGrad = ctx.createLinearGradient(cliffX, 0, wallX, 0);
        rockGrad.addColorStop(0, "#8f949b");
        rockGrad.addColorStop(1, "#6f7680");
        ctx.fillStyle = rockGrad;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.lineTo(p5.x, p5.y);
        ctx.closePath();
        ctx.fill();

        // 外框
        ctx.strokeStyle = "#4b5563";
        ctx.lineWidth = 3;
        ctx.stroke();

        // 強調「垂直攀爬面」
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(wallX, topY + 10);
        ctx.lineTo(wallX, botY - 10);
        ctx.stroke();

        // 岩石裂紋
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(17,24,39,0.25)";
        for (let i = 0; i < 6; i++) {
            const y = topY + (i + 1) * (cliffH / 7) + jag(6);
            const x1 = cliffX + cliffW * 0.18 + jag(8);
            const x2 = wallX - 6 + jag(6);

            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y + jag(8));
            ctx.stroke();
        }

        // 小突起（像可抓點）
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        for (let i = 0; i < 5; i++) {
            const y = topY + cliffH * (0.15 + i * 0.16) + jag(6);
            const w = 10 + Math.random() * 14;
            const h = 3 + Math.random() * 4;
            ctx.fillRect(wallX - w - 4, y, w, h);
        }

        // =====================================================
        // P1 LEFT
        // =====================================================

        const p1X = width * 0.22;
        const p1Y = levelToY(p1Level);
        const r = 18;

        ctx.beginPath();
        ctx.fillStyle = p1Color || "red";
        ctx.arc(p1X, p1Y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p1Color || "red";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("P1", p1X, p1Y - r - 8);

        ctx.font = "14px Arial";
        ctx.textBaseline = "top";
        ctx.fillText(`Lv ${p1Level}`, p1X, p1Y + r + 8);

        // =====================================================
        // P2 RIGHT
        // =====================================================

        const p2X = width * 0.78;
        const p2Y = levelToY(p2Level);

        ctx.beginPath();
        ctx.fillStyle = p2Color || "blue";
        ctx.arc(p2X, p2Y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p2Color || "blue";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("P2", p2X, p2Y - r - 8);

        ctx.font = "14px Arial";
        ctx.textBaseline = "top";
        ctx.fillText(`Lv ${p2Level}`, p2X, p2Y + r + 8);

        // =====================================================
        // SCALE
        // =====================================================

        const scaleX = width - 60;
        const scaleTop = 60;
        const scaleBottom = height - 60;

        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(scaleX, scaleTop);
        ctx.lineTo(scaleX, scaleBottom);
        ctx.stroke();

        const tickCount = 6;
        ctx.font = "12px Arial";
        ctx.fillStyle = "#111827";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        for (let i = 0; i <= tickCount; i++) {
            const t = i / tickCount;
            const y = scaleTop + t * (scaleBottom - scaleTop);
            const level = Math.round(maxLevel * (1 - t));

            ctx.beginPath();
            ctx.moveTo(scaleX - 8, y);
            ctx.lineTo(scaleX + 8, y);
            ctx.stroke();

            if (i % 2 === 0) ctx.fillText(String(level), scaleX + 14, y);
        }

        ctx.font = "13px Arial";
        ctx.fillText(String(maxLevel), scaleX + 14, scaleTop);
        ctx.fillText("0", scaleX + 14, scaleBottom);

        // P1 / P2 scale markers
        const p1ScaleY = levelToY(p1Level);
        const p2ScaleY = levelToY(p2Level);

        ctx.lineWidth = 3;

        ctx.strokeStyle = p1Color || "red";
        ctx.beginPath();
        ctx.moveTo(scaleX - 14, p1ScaleY);
        ctx.lineTo(scaleX + 14, p1ScaleY);
        ctx.stroke();
        ctx.fillStyle = p1Color || "red";
        ctx.fillText("P1", scaleX - 40, p1ScaleY);

        ctx.strokeStyle = p2Color || "blue";
        ctx.beginPath();
        ctx.moveTo(scaleX - 14, p2ScaleY);
        ctx.lineTo(scaleX + 14, p2ScaleY);
        ctx.stroke();
        ctx.fillStyle = p2Color || "blue";
        ctx.fillText("P2", scaleX - 40, p2ScaleY);

    }, [p1Color, p2Color, p1Level, p2Level, maxLevel, width, height]);

    return (
        <div>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}


