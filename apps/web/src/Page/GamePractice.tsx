  import { useMemo, useReducer, useState, useRef, useEffect } from "react";
import { createDefaultDeps, createInitialState, reduce } from "@ladder-duel/shared";
import type { GameState, GameAction, PlayerId, CardId } from "@ladder-duel/shared";
import "./GamePractice.css";

/*
  Layout note:
  This file focuses on structure + className hooks for styling.
  If your shared engine/action typing has separate TS errors, handle those separately.
*/

type PlayerColor = "red" | "blue";
const COLOR_OPTIONS: PlayerColor[] = ["red", "blue"];

export default function GamePage() {
  const deps = useMemo(() => createDefaultDeps(), []);

  const [state, dispatch] = useReducer(
    (s: GameState, a: GameAction) => reduce(s, a, deps),
    undefined,
    () => createInitialState(deps)
  );

  const attacker = state.turnCtx.attacker;
  const defender = state.turnCtx.defender;
  const phase = state.phase;

  const handAttacker: CardId[] = state.players[attacker].hand;
  const handDefender: CardId[] = state.players[defender].hand;
  const currentHand: CardId[] = state.players[state.currentPlayer].hand;

  const needDiscard: boolean = useMemo(() => {
    return phase === "DRAW" && currentHand.length > 5;
  }, [phase, currentHand.length]);

  const canPlayInAction: boolean = phase === "ACTION" && !state.turnCtx.attackerCard;
  const canPlayInReaction: boolean = phase === "REACTION" && !state.turnCtx.defenderCard;
  const winnerText: string = state.winner ? `Winner: ${state.winner}` : "Winner: (none)";

  const can: Record<string, boolean> = useMemo(() => {
    const hasWinner: boolean = state.winner !== undefined;

    return {
      ACTION_SKIP: phase === "ACTION" && !hasWinner,
      ROLL_DICE: phase === "ROLL" && !hasWinner,
      REACTION_SKIP: phase === "REACTION" && !hasWinner,
      RESOLVE_ROLL: phase === "RESOLVE" && !hasWinner,
      DRAW_CARD: phase === "DRAW" && !hasWinner && !needDiscard,
      END_TURN: phase === "END" && !hasWinner,
      RESET: true,
    };
  }, [state.winner, phase, needDiscard]);

  const [colorPickerState, setColorPickerState] = useState<boolean>(false);
  const [playerColor, setPlayerColor] = useState<Record<PlayerId, PlayerColor>>({
    P1: "blue",
    P2: "red",
  });

  function onChange(player: PlayerId, color: PlayerColor) {
    setPlayerColor((prev) => ({
      ...prev,
      [player]: color,
    }));
  }

  return (
    <div className="game-page">
      <div className="character-picker-anchor">
        <button
          className="picker-toggle"
          type="button"
          onClick={() => setColorPickerState((prev) => !prev)}
        >
          Character
        </button>

        <CharacterPicker
          open={colorPickerState}
          value={playerColor}
          onChange={onChange}
          onClose={() => setColorPickerState(false)}
        />
      </div>

      <main className="game-main-column">
        <section className="panel info-panel" aria-label="Game information">
          <div className="panel-title-row">
            <h3>Game Info</h3>
            <span className="status-pill">{phase}</span>
          </div>

          <div className="info-grid">
            <div className="info-card info-card-wide">{winnerText}</div>
            <div className="info-card">Turn: {state.turn}</div>
            <div className="info-card">Attacker: {attacker}</div>
            <div className="info-card">Defender: {defender}</div>
          </div>
        </section>

        <section className="arena-row" aria-label="Game arena">
          <PlayerInfoPanel
            playerID="P1"
            playerPosition={state.players.P1.position}
            playerHand={state.players.P1.hand}
          />

          <div className="gallery-shell">
            <Gallery
              p1Color={playerColor.P1}
              p2Color={playerColor.P2}
              p1Level={state.players.P1.position}
              p2Level={state.players.P2.position}
              maxLevel={120}
              width={780}
              height={560}
            />
          </div>

          <PlayerInfoPanel
            playerID="P2"
            playerPosition={state.players.P2.position}
            playerHand={state.players.P2.hand}
          />
        </section>

        <OperatePanel
          can={can}
          state={state}
          attacker={attacker}
          handAttacker={handAttacker}
          defender={defender}
          handDefender={handDefender}
          canPlayInAction={canPlayInAction}
          canPlayInReaction={canPlayInReaction}
          dispatch={dispatch}
          needDiscard={needDiscard}
        />
      </main>

      <LogPanel log={state.log} />
    </div>
  );
}

interface CharacterPickerProps {
  open: boolean;
  value: Record<PlayerId, PlayerColor>;
  onChange: (player: PlayerId, color: PlayerColor) => void;
  onClose: () => void;
}

function CharacterPicker({ open, value, onChange, onClose }: CharacterPickerProps) {
  if (!open) return null;

  return (
    <div className="picker-popover panel" role="dialog" aria-label="Character picker">
      <div className="picker-head">
        <h4>Character Picker</h4>
        <button className="picker-close" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      {(["P1", "P2"] as PlayerId[]).map((player) => (
        <div className="picker-player-row" key={player}>
          <div className="picker-player-label">{player}</div>

          <div className="picker-color-group">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={`${player}-${color}`}
                type="button"
                className={`color-choice ${color === value[player] ? "active" : ""}`}
                onClick={() => onChange(player, color)}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface PlayerInfoPanelProps {
  playerID: PlayerId;
  playerPosition: number;
  playerHand: CardId[];
}

function PlayerInfoPanel({ playerID, playerPosition, playerHand }: PlayerInfoPanelProps) {
  return (
    <aside className={`panel player-panel player-panel-${playerID.toLowerCase()}`}>
      <h4>{playerID} Info</h4>

      <div className="player-stat">
        <span>Position</span>
        <strong>{playerPosition}</strong>
      </div>

      <div className="player-stat">
        <span>Cards</span>
        <strong>{playerHand.length}</strong>
      </div>

      <div className="player-hand-list" aria-label={`${playerID} hand cards`}>
        {playerHand.length === 0 ? (
          <p className="hint">No cards</p>
        ) : (
          <ul>
            {playerHand.map((card, index) => (
              <li key={`${playerID}-${card}-${index}`}>{card}</li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

interface LogPanelProps {
  log: string[];
}

function LogPanel({ log }: LogPanelProps) {
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <aside className="log-panel" aria-label="Game log">
      <h3>Game Log</h3>

      <div className="log-scroll" ref={logContainerRef}>
        {log.length === 0 ? (
          <p className="hint">No log yet.</p>
        ) : (
          log.map((entry, index) => (
            <div className="log-entry" key={`${entry}-${index}`}>
              {entry}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

interface CardButtonsProps {
  disabled: boolean;
  player: PlayerId;
  hand: CardId[];
  dispatch: (a: GameAction) => void;
}

function CardButtons({ disabled, player, hand, dispatch }: CardButtonsProps) {
  const [showSetRollInput, setShowSetRollInput] = useState(false);
  const [setRollValue, setSetRollValue] = useState<number>(0);

  return (
    <div className="card-buttons">
      {hand.length === 0 ? (
        <p className="hint">No card available.</p>
      ) : (
        hand.map((card, cardIndex) => (
          <div className="card-action" key={`${cardIndex}-${card}`}>
            <button
              className="card-play-btn"
              type="button"
              disabled={disabled}
              onClick={() => {
                const isSetRoll = card === "SET_ROLL";

                if (isSetRoll) {
                  setShowSetRollInput(true);
                  return;
                }

                if (card === "MULTIPLIER") {
                  dispatch({
                    type: "PLAY_CARD",
                    player,
                    cardId: "MULTIPLIER",
                    payload: {
                      factor: 2,
                    },
                  });
                  return;
                }

                dispatch({
                  type: "PLAY_CARD",
                  player,
                  cardId: card,
                });
              }}
            >
              Play {card}
            </button>

            {card === "SET_ROLL" && showSetRollInput && (
              <div className="set-roll-control">
                <input
                  type="number"
                  min={0}
                  max={6}
                  step={1}
                  value={setRollValue}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSetRollValue(clampInt(value, 0, 6));
                  }}
                />

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    dispatch({
                      type: "PLAY_CARD",
                      player,
                      cardId: "SET_ROLL",
                      payload: {
                        chosen: clampInt(setRollValue, 0, 6),
                      },
                    });

                    setShowSetRollInput(false);
                  }}
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

interface OperatePanelProps {
  can: Record<string, boolean>;
  state: GameState;
  attacker: PlayerId;
  handAttacker: CardId[];
  defender: PlayerId;
  handDefender: CardId[];
  canPlayInAction: boolean;
  canPlayInReaction: boolean;
  dispatch: (a: GameAction) => void;
  needDiscard: boolean;
}

function OperatePanel({
  can,
  state,
  attacker,
  handAttacker,
  defender,
  handDefender,
  canPlayInAction,
  canPlayInReaction,
  dispatch,
  needDiscard,
}: OperatePanelProps) {
  return (
    <section className="panel operate-panel" aria-label="Operate panel">
      <div className="panel-title-row">
        <h3>Operate Panel</h3>
        <span className="status-pill">Current: {state.currentPlayer}</span>
      </div>

      <div className="operate-actions">
        <button
          type="button"
          disabled={!can.ACTION_SKIP}
          onClick={() => dispatch({ type: "SKIP_CARD", player: attacker })}
        >
          Action Skip
        </button>

        <button
          type="button"
          disabled={!can.ROLL_DICE}
          onClick={() => dispatch({ type: "ROLL_DICE", player: attacker })}
        >
          Roll
        </button>

        <button
          type="button"
          disabled={!can.REACTION_SKIP}
          onClick={() => dispatch({ type: "SKIP_CARD", player: defender })}
        >
          Reaction Skip
        </button>

        <button
          type="button"
          disabled={!can.RESOLVE_ROLL}
          onClick={() => dispatch({ type: "RESOLVE_ROLL" })}
        >
          Resolve
        </button>

        <button
          type="button"
          disabled={!can.DRAW_CARD}
          onClick={() => dispatch({ type: "DRAW_CARD" })}
        >
          Draw Card
        </button>

        <button
          type="button"
          disabled={!can.END_TURN}
          onClick={() => dispatch({ type: "END_TURN", player: attacker })}
        >
          End Turn
        </button>

        <button
          type="button"
          disabled={!can.RESET}
          onClick={() => dispatch({ type: "RESET" })}
        >
          Reset
        </button>
      </div>

      <div className="play-card-panel">
        <h3>Play Card Panel</h3>
        <p className="hint">
          ACTION lets the attacker play. REACTION lets the defender play.
        </p>

        <div className="play-card-slot">
          {state.phase === "ACTION" && (
            <div className="play-card-box">
              <h4>Attacker Play Card: {attacker}</h4>
              <CardButtons
                disabled={!canPlayInAction}
                player={attacker}
                hand={handAttacker}
                dispatch={dispatch}
              />
            </div>
          )}

          {state.phase === "REACTION" && (
            <div className="play-card-box">
              <h4>Defender Play Card: {defender}</h4>
              <CardButtons
                disabled={!canPlayInReaction}
                player={defender}
                hand={handDefender}
                dispatch={dispatch}
              />
            </div>
          )}

          {state.phase !== "ACTION" && state.phase !== "REACTION" && (
            <div className="play-card-box idle">No card play in this phase.</div>
          )}
        </div>
      </div>

      {needDiscard && (
        <div className="discard-slot">
          <h3>Discard Card Panel</h3>
          <p className="hint">
            Your hand is above the limit. Discard one card before continuing.
          </p>

          <div className="discard-actions">
            {state.players[state.currentPlayer].hand.map((card, index) => (
              <button
                className="discard-btn"
                type="button"
                key={`${card}-${index}`}
                onClick={() =>
                  dispatch({
                    type: "DISCARD_CARD",
                    player: state.currentPlayer,
                    cardId: card,
                  })
                }
              >
                Discard {card}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

type GalleryProps = {
  p1Color: string;
  p2Color: string;
  p1Level: number;
  p2Level: number;
  maxLevel?: number;
  width?: number;
  height?: number;
};

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

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const levelToY = (level: number) => {
      const padTop = 60;
      const padBottom = 60;
      const usableH = height - padTop - padBottom;
      const t = clamp(level, 0, maxLevel) / maxLevel;
      return padTop + (1 - t) * usableH;
    };

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const cliffW = Math.max(90, width * 0.22);
    const cliffH = Math.max(280, height * 0.68);
    const cliffX = (width - cliffW) / 2;
    const cliffY = (height - cliffH) / 2;
    const wallX = cliffX + cliffW * 0.72;

    const jag = (amp: number) => (Math.random() * 2 - 1) * amp;

    const topY = cliffY;
    const botY = cliffY + cliffH;

    const p0 = { x: wallX, y: topY + 8 };
    const p1 = { x: cliffX + cliffW * 0.15 + jag(10), y: topY + cliffH * 0.08 };
    const p2 = { x: cliffX + cliffW * 0.05 + jag(12), y: topY + cliffH * 0.3 };
    const p3 = { x: cliffX + cliffW * 0.18 + jag(12), y: topY + cliffH * 0.55 };
    const p4 = { x: cliffX + cliffW * 0.08 + jag(10), y: topY + cliffH * 0.82 };
    const p5 = { x: wallX, y: botY - 8 };

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

    ctx.strokeStyle = "#4b5563";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(wallX, topY + 10);
    ctx.lineTo(wallX, botY - 10);
    ctx.stroke();

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

    ctx.fillStyle = "rgba(255,255,255,0.12)";

    for (let i = 0; i < 5; i++) {
      const y = topY + cliffH * (0.15 + i * 0.16) + jag(6);
      const w = 10 + Math.random() * 14;
      const h = 3 + Math.random() * 4;
      ctx.fillRect(wallX - w - 4, y, w, h);
    }

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
    <div className="gallery-panel panel">
      <canvas ref={canvasRef} aria-label="Game gallery"></canvas>
    </div>
  );
}

function clampInt(x: number, lo: number, hi: number): number {
  if (!Number.isFinite(x)) return lo;
  if (x < lo) return lo;
  if (x > hi) return hi;
  return Math.floor(x);
}
