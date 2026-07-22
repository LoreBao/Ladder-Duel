import { useState } from "react";
import type {CardId,PlayerIntent} from "@ladder-duel/shared"

interface CardButtonsProps{
    disabled: boolean,
    hand:CardId[];
    onPlayerIntent(intent: PlayerIntent): void;
}

export function CardButtons({
    disabled,
    hand,
    onPlayerIntent,
}: CardButtonsProps){
    const [openSetRollKey, setOpenSetRollKey]=useState<string|null>(null);
    const [setRollValue,setSetRollValue]=useState(0);
    const [multiplierFactor,setMultiplierFactor]=useState<1|2|3>(2)

    return(
        <div className="cardButtons">
            {hand.length===0&& <div className="hint">(no cards)</div>}

            {hand.map((cardId,index)=>{
                const key=`${cardId}-${index}`;
                if(cardId==="SET_ROLL"){
                    return(
                        <div key={key}>
                            <button
                                disabled={disabled}
                                onClick={()=>{
                                    setOpenSetRollKey(openSetRollKey===key?null:key)
                                }}>
                                SET_ROLL
                            </button>
                            {openSetRollKey===key&&(
                                <>
                                    <input
                                        type="number"
                                        min={0}
                                        max={6}
                                        step={1}
                                        value={setRollValue}
                                        disabled={disabled}
                                        onChange={(event)=>
                                            setSetRollValue(clampInt(Number(event.target.value),0,6))
                                        }
                                    />
                                    <button
                                        disabled={disabled}
                                        onClick={()=>{
                                            onPlayerIntent({
                                                type:"PLAY_CARD",
                                                cardId:"SET_ROLL",
                                                payload:{chosen:clampInt(setRollValue,0,6)},
                                            })
                                            setOpenSetRollKey(null);
                                        }}
                                        >
                                            Confirm
                                    </button>
                                </>
                            )}
                        </div>
                    )
                }
                if(cardId==="MULTIPLIER"){

                    return(
                        <div key={key}>
                            <select
                                className="factor-select"
                                value={multiplierFactor}
                                disabled={disabled}
                                onChange={(event)=>{
                                    setMultiplierFactor(Number(event.target.value) as 1|2|3)
                                }}
                            >
                                <option value={1}>x1</option>
                                <option value={2}>x2</option>
                                <option value={3}>x3</option>
                            </select>
                            <button
                                disabled={disabled}
                                onClick={()=>{
                                    onPlayerIntent({
                                        type:"PLAY_CARD",
                                        cardId: "MULTIPLIER",
                                        payload: {factor:multiplierFactor},
                                    })
                                }}
                            >
                                MULTIPLIER
                            </button>
                        </div>


                    )
                }

                return(
                    <div key={key}>
                        <button
                            disabled={disabled}
                            onClick={()=>onPlayerIntent({type: "PLAY_CARD",cardId})}
                        >
                            {cardId}
                        </button>
                    </div>
                )
            })  
            }
        </div>
    )
}

function clampInt(x:number, lo:number, hi:number):number{
    if(!Number.isFinite(x)) return lo;
    if(x<lo) return lo;
    if(x>hi) return hi;
    return Math.floor(x);
}

