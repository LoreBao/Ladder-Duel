import {useMemo,useState} from "react"
import type{
    CardId,
    GameView,
    PlayerId,
    PlayerIntent,
    RoomSummary,
} from "@ladder-duel/shared";
import { CharacterPicker, type PlayerColor} from "./CharacterPicker";
import { Gallery } from "./Gallery";
import { LogPanel } from "./LogPanel";
import {OperatePanel} from "./OperatePanel"
import {PlayerInfoPanel} from "./PlayerInfoPanel"

interface GameBoardProps{
    connected: boolean;
    socketUrl:string;
    view:GameView;
    room: RoomSummary|null;
    errorMessage:string|null;
    onPlayerIntent(intent: PlayerIntent): void;
    onRestart(): void;
}

interface PlayerPanelView{
    playerId:PlayerId;
    displayName?:string;
    position:number;
    handCount:number;
    hand?:CardId[];
    connected?:boolean;
    isSelf:boolean;
}

export function GameBoard({
    connected,
    socketUrl,
    view,
    room,
    errorMessage,
    onPlayerIntent,
    onRestart,
}: GameBoardProps){
    const [colorPickerOpen,setColorPickerOpen]=useState(false);
    const [playerColor,setPlayerColor]=useState<Record<PlayerId,PlayerColor>>({
        P1:"blue",
        P2:"red",
    })

    const p1=createPlayerPanelView(view,room,"P1")
    const p2=createPlayerPanelView(view,room,"P2")

    const isAttacker=view.myPlayerId===view.attacker;
    const isDefender=view.myPlayerId===view.defender;
    const isCurrentPlayer=view.myPlayerId===view.currentPlayer;
    const hasWinner=view.winner!== undefined;
    const needDiscard=
        view.phase==="DRAW"&&isCurrentPlayer&&view.me.hand.length>5;
    const canPlayActionCard=
        !hasWinner&&view.phase==="ACTION"&&isAttacker&&!view.attackerCard;
    const canPlayReactionCard=
        !hasWinner&&view.phase==="REACTION" && isDefender && !view.defenderCard;

    const can=useMemo(
        ()=>({
            actionSkip:!hasWinner&&view.phase==="ACTION"&&isAttacker,
            rollDice:!hasWinner&&view.phase==="ROLL"&&isAttacker,
            reactionSkip:!hasWinner&&view.phase==="REACTION"&&isDefender,
            resolveRoll: !hasWinner&&view.phase==="RESOLVE"&&isAttacker,
            drawCard:
                !hasWinner&&view.phase==="DRAW" && isCurrentPlayer &&!needDiscard,
            endTurn: !hasWinner&& view.phase === "END" && isAttacker,
            restart:true,
        }),
        [
            hasWinner,
            isAttacker,
            isCurrentPlayer,
            isDefender,
            needDiscard,
            view.phase,
        ],
    )

    const actionHand=canPlayActionCard?view.me.hand:[];
    const reactionHand=canPlayReactionCard?view.me.hand:[];
    const winnerText=view.winner?`Winner: ${view.winner}`: "Winner: none";

    return(
        <div className="game-page">
            <div className="game-layout">
                <main className="game-main-column">
                    <section className="panel connection-panel" aria-label="Room summary">
                        <div className="summary-primary">
                            Room <b>{view.roomId}</b> ¡P You are <b>{view.myPlayerId}</b>
                        </div>
                        <div className="summary-secondary">
                            <span
                                className="connection-state"
                                data-connected={connected}
                            >
                                {connected?"Connected":"Disconnected"}
                            </span>
                            <span aria-hidden="true">¡P</span>
                            <span className="socket-url">{socketUrl}</span>
                        </div>
                    </section>

                    {errorMessage&&<div className="error-banner board-error">{errorMessage}</div>}

                    <section className="panel info-panel" aria-label="Game information">
                        <h3>Game Info</h3>
                        <div className="info-row">
                            <div>{winnerText}</div>
                            <div>Turn {view.turn}</div>
                            <div>Phase {view.phase}</div>
                            <div>Attacker {view.attacker}</div>
                            <div>Defender {view.defender}</div>
                            <div>Roll: {view.roll??"-"}</div>
                            <div>Attack Card: {view.attackerCard?.id??"-"}</div>
                            <div>Defense Card: {view.defenderCard?.id??"-"}</div>
                        </div>
                    </section>

                    <section className="arena-row" aria-label="Ladder duel arena">
                        <PlayerInfoPanel {...p1}/>

                        <div className="gallery-shell">
                            <Gallery
                                p1Color={playerColor.P1}
                                p2Color={playerColor.P2}
                                p1Level={p1.position}
                                p2Level={p2.position}
                            />
                        </div>

                        <PlayerInfoPanel {...p2}/>
                    </section>

                    <OperatePanel
                        view={view}
                        can={can}
                        actionHand={actionHand}
                        reactionHand={reactionHand}
                        needDiscard={needDiscard}
                        canPlayActionCard={canPlayActionCard}
                        canPlayReactionCard={canPlayReactionCard}
                        onPlayerIntent={onPlayerIntent}
                        onRestart={onRestart}
                    />
                </main>

                <aside className="game-side-column" aria-label="Game tools">
                    <LogPanel log={view.log}/>

                    <div className="character-picker-anchor">
                        <button
                            className="picker-toggle"
                            type="button"
                            aria-expanded={colorPickerOpen}
                            aria-controls="character-picker"
                            onClick={()=>setColorPickerOpen((prev)=>!prev)}
                        >
                            Character Picker
                        </button>

                        <CharacterPicker
                            open={colorPickerOpen}
                            value={playerColor}
                            onChange={(player,color)=>
                                setPlayerColor((prev)=>({...prev,[player]: color}))
                            }
                            onClose={()=>setColorPickerOpen(false)}
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
}

function createPlayerPanelView(
    view:GameView,
    room: RoomSummary|null,
    playerId:PlayerId,
): PlayerPanelView{
    if(view.me.id===playerId){
        return{
            playerId,
            displayName:room?.players[playerId]?.displayName,
            position:view.me.position,
            handCount:view.me.handCount,
            hand: view.me.hand,
            connected:room?.players[playerId]?.connected,
            isSelf:true
        };
    }

    return{
        playerId,
        displayName:room?.players[playerId]?.displayName,
        position:view.opponent.position,
        handCount:view.opponent.handCount,
        connected:room?.players[playerId]?.connected,
        isSelf:false,
    }
}
