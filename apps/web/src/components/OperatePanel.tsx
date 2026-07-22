import type {CardId,GameView,PlayerIntent} from "@ladder-duel/shared";
import { CardButtons } from "./CardButtons";

interface ActionFlags{
    actionSkip: boolean;
    rollDice: boolean;
    reactionSkip:boolean;
    resolveRoll: boolean;
    drawCard: boolean;
    endTurn: boolean;
    restart: boolean;
}

interface OperatePanelProps{
    view: GameView;
    can: ActionFlags;
    actionHand: CardId[];
    reactionHand: CardId[];
    needDiscard:boolean;
    canPlayActionCard:boolean;
    canPlayReactionCard: boolean;
    onPlayerIntent(intent: PlayerIntent): void;
    onRestart(): void;
}

export function OperatePanel({
    view,
    can,
    actionHand,
    reactionHand,
    needDiscard,
    canPlayActionCard,
    canPlayReactionCard,
    onPlayerIntent,
    onRestart,
}:OperatePanelProps){
    return(
        <section className="panel operate-panel">
            <h2>Operate</h2>
            <div className="operate-actions">
                <button
                    disabled={!can.actionSkip}
                    onClick={()=>onPlayerIntent({type:"SKIP_CARD"})}
                >
                    Action Skip
                </button>

                <button
                    disabled={!can.rollDice}
                    onClick={()=>onPlayerIntent({type:"ROLL_DICE"})}
                >
                    Roll Dice
                </button>

                <button
                    disabled={!can.reactionSkip}
                    onClick={()=>onPlayerIntent({type:"SKIP_CARD"})}
                >
                    Reaction Skip
                </button>

                <button
                    disabled={!can.resolveRoll}
                    onClick={()=>onPlayerIntent({type:"RESOLVE_ROLL"})}
                >
                    Resolve Roll
                </button>

                <button
                    disabled={!can.drawCard}
                    onClick={()=>onPlayerIntent({type:"DRAW_CARD"})}
                >
                    Draw
                </button>

                <button
                    disabled={!can.endTurn}
                    onClick={()=>onPlayerIntent({type:"END_TURN"})}
                >
                    End Turn
                </button>

                <button disabled={!can.restart} onClick={onRestart}>
                    Restart
                </button>
            </div>

            <div className="play-card-slot">
                {view.phase==="ACTION"&&(
                    <div className="play-card-box">
                        <h3>Action Cards</h3>
                        {view.attackerCard&&(
                            <div className="played-card">Played:{view.attackerCard.id}</div>
                        )}
                        <CardButtons
                            disabled={!canPlayActionCard}
                            hand={actionHand}
                            onPlayerIntent={onPlayerIntent}
                        />
                    </div>
                )}

                {view.phase==="REACTION"&&(
                    <div className="play-card-box">
                        <h3>Reaction Cards</h3>
                        {view.defenderCard&&(
                            <div className="played-card">Played:{view.defenderCard.id}</div>
                        )}
                        <CardButtons
                            disabled={!canPlayReactionCard}
                            hand={reactionHand}
                            onPlayerIntent={onPlayerIntent}
                        />
                    </div>
                )}

                {view.phase!=="ACTION" && view.phase !== "REACTION"&& (
                    <div className="play-card-box idle">No Card play in this phase</div>
                )}

                
            </div>

            {needDiscard&&(
                <div className="discard-slot">
                    <h3>Discard</h3>
                    <div className="discard-actions">
                        {view.me.hand.map((cardId,index)=>(
                            <button
                                key={`${cardId}-${index}`}
                                className="discard-btn"
                                onClick={()=>
                                    onPlayerIntent({type:"DISCARD_CARD", cardId})
                                }
                            >
                            {cardId}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}