import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createDefaultDeps, createInitalState, reduce } from "@ladder-duel/shared";
import type { GameAction, GameState, PlayerId, CardId } from "@ladder-duel/shared";
import "./GamePage.css";

function reduceFn(state: GameState, action: GameAction) {
  return reduce(state, action);
}

type PlayerColor = "red" | "blue";
const COLOR_OPTIONS: PlayerColor[] = ["red", "blue"];
const PLAYERS: PlayerId[] = ["P1", "P2"];

export function GamePage() {
  const initState = useMemo(() => createInitalState(createDefaultDeps()), []);
  const [state, dispatch] = useReducer(reduceFn, initState);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [playerColor, setPlayerColor] = useState<Record<PlayerId, PlayerColor>>({
    P1: "blue",
    P2: "red",
  });

  const currentPlayer = state.currentPlayer;
  const currentHand = state.players[currentPlayer].hand;

  const can = useMemo(() => {
    const hasWinner = state.winner !== undefined;
    return {
      PLAY_CARD: !hasWinner && state.phase === "ACTION",
      SKIP_CARD: !hasWinner && state.phase === "ACTION",
      ROLL_DICE: !hasWinner && state.phase === "ROLL",
      RESOLVE_ROLL: !hasWinner && state.phase === "RESOLVE",
      DRAW_CARD: !hasWinner && state.phase === "DRAW",
      END_TURN: !hasWinner && state.phase === "END",
      RESET: true,
    };
  }, [state]);

  function onChange(player: PlayerId, color: PlayerColor) {
    setPlayerColor((prev) => ({
      ...prev,
      [player]: color,
    }));
  }

  function executeDispatchFn(actionType: GameAction["type"], card?: CardId) {
    if (actionType === "PLAY_CARD") {
      dispatch({
        type: "PLAY_CARD",
        player: currentPlayer,
        card: card ?? currentHand[0] ?? "MULTIPLER",
      });
      return;
    }

    if (actionType === "SKIP_CARD" || actionType === "ROLL_DICE") {
      dispatch({
        type: actionType,
        player: currentPlayer,
      });
      return;
    }

    if (
      actionType === "RESOLVE_ROLL" ||
      actionType === "DRAW_CARD" ||
      actionType === "END_TURN" ||
      actionType === "RESET"
    ) {
      dispatch({ type: actionType });
    }
  }

  return (
    <div className="game-page">
      <div className="page-tools">
        <div className="character-picker-anchor">
          <button
            className="picker-toggle"
            type="button"
            onClick={() => setColorPickerOpen((prev) => !prev)}
          >
            Character Picker
          </button>

          <CharacterPicker
            open={colorPickerOpen}
            value={playerColor}
            onChange={onChange}
            onClose={() => setColorPickerOpen(false)}
          />
        </div>
      </div>

      <main className="game-layout">
        <section className="game-info-panel">
          <h1 className="panel-title">Game Info</h1>

          <div className="game-info-grid">
            <div className="game-info-item">
              <span className="game-info-item__label">Turn</span>
              <strong className="game-info-item__value">{state.turn}</strong>
            </div>

            <div className="game-info-item">
              <span className="game-info-item__label">Current Player</span>
              <strong className="game-info-item__value">{state.currentPlayer}</strong>
            </div>

            <div className="game-info-item">
              <span className="game-info-item__label">P1 Position</span>
              <strong className="game-info-item__value">{state.players.P1.position}</strong>
            </div>

            <div className="game-info-item">
              <span className="game-info-item__label">P2 Position</span>
              <strong className="game-info-item__value">{state.players.P2.position}</strong>
            </div>

            <div className="game-info-item">
              <span className="game-info-item__label">Phase</span>
              <strong className="game-info-item__value">{state.phase}</strong>
            </div>

            <div className="game-info-item">
              <span className="game-info-item__label">Last Roll</span>
              <strong className="game-info-item__value">
                {state.lastroll ? state.lastroll.value : "-"}
              </strong>
            </div>

            <div className="game-info-item">
              <span className="game-info-item__label">Winner</span>
              <strong className="game-info-item__value">{state.winner ?? "-"}</strong>
            </div>

            <div className="game-info-item">
              <span className="game-info-item__label">Current Hand Count</span>
              <strong className="game-info-item__value">{currentHand.length}</strong>
            </div>
          </div>
        </section>

        <aside className="player-panel-slot player-panel-slot--left">
          <PlayerInfoPanel
            player="P1"
            color={playerColor.P1}
            position={state.players.P1.position}
            cards={state.players.P1.hand}
            isCurrent={state.currentPlayer === "P1"}
          />
        </aside>

        <section className="gallery-section">
          <div className="gallery-shell">
            <h2 className="gallery-shell__title">Gallery</h2>
            <Gallery
              p1Color={playerColor.P1}
              p2Color={playerColor.P2}
              p1Level={state.players.P1.position}
              p2Level={state.players.P2.position}
              maxLevel={120}
              width={800}
              height={600}
            />
          </div>
        </section>

        <aside className="player-panel-slot player-panel-slot--right">
          <PlayerInfoPanel
            player="P2"
            color={playerColor.P2}
            position={state.players.P2.position}
            cards={state.players.P2.hand}
            isCurrent={state.currentPlayer === "P2"}
          />
        </aside>

        <section className="operate-section">
          <h2 className="panel-title">Operate Panel</h2>
          <OperatePanel can={can} executeDispatch={executeDispatchFn} />

          <PlayCardPanel
            visible={can.PLAY_CARD && currentHand.length > 0}
            cards={currentHand}
            onPlay={(card) => executeDispatchFn("PLAY_CARD", card)}
          />
        </section>
      </main>

      <LogPanel log={state.log} />
    </div>
  );
}

interface PlayerInfoPanelProps {
  player: PlayerId;
  color: PlayerColor;
  position: number;
  cards: CardId[];
  isCurrent: boolean;
}

function PlayerInfoPanel({
  player,
  color,
  position,
  cards,
  isCurrent,
}: PlayerInfoPanelProps) {
  return (
    <section className={`player-panel ${isCurrent ? "is-active" : ""}`}>
      <div className="player-panel__header">
        <h2 className="player-panel__title">{player}</h2>
        <span className={`player-badge player-badge--${color}`}>{color}</span>
      </div>

      <div className="player-panel__stats">
        <div className="player-stat">
          <span className="player-stat__label">Position</span>
          <strong className="player-stat__value">{position}</strong>
        </div>

        <div className="player-stat">
          <span className="player-stat__label">Cards</span>
          <strong className="player-stat__value">{cards.length}</strong>
        </div>

        <div className="player-stat">
          <span className="player-stat__label">Turn Status</span>
          <strong className="player-stat__value">{isCurrent ? "Active" : "Waiting"}</strong>
        </div>
      </div>

      <div className="player-panel__hand">
        <h3 className="player-panel__subheading">Hand</h3>

        <div className="player-panel__card-list">
          {cards.length > 0 ? (
            cards.map((card, index) => (
              <span className="player-card-chip" key={`${player}-${card}-${index}`}>
                {card}
              </span>
            ))
          ) : (
            <span className="player-panel__empty">No cards</span>
          )}
        </div>
      </div>
    </section>
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
    <div className="character-picker-dropdown">
      <div className="character-picker__header">
        <h2 className="character-picker__title">Character Picker</h2>
        <button className="character-picker__close" type="button" onClick={onClose}>
          ✕
        </button>
      </div>

      {PLAYERS.map((player) => (
        <section className="picker-group" key={player}>
          <h3 className="picker-group__title">{player} Color</h3>

          <div className="picker-options">
            {COLOR_OPTIONS.map((color) => {
              const selected = value[player] === color;

              return (
                <button
                  key={`${player}-${color}`}
                  type="button"
                  className={`color-chip color-chip--${color} ${selected ? "is-selected" : ""}`}
                  onClick={() => onChange(player, color)}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

interface LogPanelProps {
  log: string[];
}

function LogPanel({ log }: LogPanelProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [log]);

  return (
    <section className="log-panel">
      <h2 className="log-panel__title">Log Panel</h2>

      <div className="log-panel__content" ref={contentRef}>
        {log.length > 0 ? (
          log.map((msg, index) => (
            <div className="log-panel__item" key={`${msg}-${index}`}>
              {msg}
            </div>
          ))
        ) : (
          <div className="log-panel__empty">No logs yet.</div>
        )}
      </div>
    </section>
  );
}

interface OperatePanelProps {
  can: Record<GameAction["type"], boolean>;
  executeDispatch: (action: GameAction["type"], card?: CardId) => void;
}

function OperatePanel({ can, executeDispatch }: OperatePanelProps) {
  return (
    <div className="operate-panel">
      <div className="operate-panel__buttons">
        <button type="button" disabled={!can.SKIP_CARD} onClick={() => executeDispatch("SKIP_CARD")}>
          Skip
        </button>

        <button type="button" disabled={!can.ROLL_DICE} onClick={() => executeDispatch("ROLL_DICE")}>
          Roll
        </button>

        <button
          type="button"
          disabled={!can.RESOLVE_ROLL}
          onClick={() => executeDispatch("RESOLVE_ROLL")}
        >
          Resolve
        </button>

        <button type="button" disabled={!can.DRAW_CARD} onClick={() => executeDispatch("DRAW_CARD")}>
          Draw
        </button>

        <button type="button" disabled={!can.END_TURN} onClick={() => executeDispatch("END_TURN")}>
          End
        </button>

        <button type="button" disabled={!can.RESET} onClick={() => executeDispatch("RESET")}>
          Reset
        </button>
      </div>
    </div>
  );
}

interface PlayCardPanelProps {
  visible: boolean;
  cards: CardId[];
  onPlay: (card: CardId) => void;
}

function PlayCardPanel({ visible, cards, onPlay }: PlayCardPanelProps) {
  return (
    <div className="play-card-panel">
      <div className="play-card-panel__header">Play Card Panel</div>

      <div className="play-card-panel__body">
        {visible ? (
          cards.map((card, index) => (
            <button
              type="button"
              className="play-card-panel__card"
              key={`${card}-${index}`}
              onClick={() => onPlay(card)}
            >
              {card}
            </button>
          ))
        ) : (
          <div className="play-card-panel__placeholder">
            目前沒有可出的卡，這個區塊會保留固定高度，避免條件渲染時整體版面明顯跳動。
          </div>
        )}
      </div>
    </div>
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

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

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
    const p2 = { x: cliffX + cliffW * 0.05 + jag(12), y: topY + cliffH * 0.30 };
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
      const holdW = 10 + Math.random() * 14;
      const holdH = 3 + Math.random() * 4;
      ctx.fillRect(wallX - holdW - 4, y, holdW, holdH);
    }

    const playerRadius = 18;

    const p1X = width * 0.22;
    const p1Y = levelToY(p1Level);
    ctx.beginPath();
    ctx.fillStyle = p1Color || "red";
    ctx.arc(p1X, p1Y, playerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p1Color || "red";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("P1", p1X, p1Y - playerRadius - 8);

    ctx.font = "14px Arial";
    ctx.textBaseline = "top";
    ctx.fillText(`Lv ${p1Level}`, p1X, p1Y + playerRadius + 8);

    const p2X = width * 0.78;
    const p2Y = levelToY(p2Level);
    ctx.beginPath();
    ctx.fillStyle = p2Color || "blue";
    ctx.arc(p2X, p2Y, playerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p2Color || "blue";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("P2", p2X, p2Y - playerRadius - 8);

    ctx.font = "14px Arial";
    ctx.textBaseline = "top";
    ctx.fillText(`Lv ${p2Level}`, p2X, p2Y + playerRadius + 8);

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

      if (i % 2 === 0) {
        ctx.fillText(String(level), scaleX + 14, y);
      }
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
    <div className="gallery-canvas-wrap">
      <canvas className="gallery-canvas" ref={canvasRef}></canvas>
    </div>
  );
}