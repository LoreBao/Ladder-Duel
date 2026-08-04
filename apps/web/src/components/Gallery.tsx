import { useEffect, useRef } from "react";

interface GalleryProps {
  p1Color: string;
  p2Color: string;
  p1Level: number;
  p2Level: number;
  maxLevel?: number;
  width?: number;
  height?: number;
  backgroundImage?: HTMLImageElement | null;
}

interface PlayerMotion {
  displayLevel: number;
  targetLevel: number;
  falling: boolean;
  impactStartedAt: number | null;
}

interface MotionState {
  P1: PlayerMotion;
  P2: PlayerMotion;
}

interface PlayerVisual {
  level: number;
  targetLevel: number;
  verticalScale: number;
  shakeX: number;
}

const TRACK_TOP = 54;
const TRACK_BOTTOM = 54;
const EGG_WIDTH = 38;
const EGG_HEIGHT = 50;
const IMPACT_DURATION_MS = 280;
const POSITION_EASING = 9;

export function Gallery({
  p1Color,
  p2Color,
  p1Level,
  p2Level,
  maxLevel = 120,
  width = 780,
  height = 560,
}: GalleryProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionRef = useRef<MotionState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previous = motionRef.current;
    const nextMotion: MotionState = {
      P1: updateMotionTarget(previous?.P1, p1Level),
      P2: updateMotionTarget(previous?.P2, p2Level),
    };
    motionRef.current = nextMotion;

    let animationFrame = 0;
    let previousTime = performance.now();

    const drawFrame = (time: number) => {
      const deltaSeconds = Math.min(Math.max((time - previousTime) / 1000, 0), 0.05);
      previousTime = time;

      advanceMotion(nextMotion.P1, deltaSeconds, time, reducedMotion);
      advanceMotion(nextMotion.P2, deltaSeconds, time, reducedMotion);

      const p1Visual = getPlayerVisual(nextMotion.P1, maxLevel, time, reducedMotion);
      const p2Visual = getPlayerVisual(nextMotion.P2, maxLevel, time, reducedMotion);

      drawGallery(
        ctx,
        width,
        height,
        maxLevel,
        p1Color,
        p2Color,
        p1Visual,
        p2Visual,
      );

      if (isAnimating(nextMotion.P1, time) || isAnimating(nextMotion.P2, time)) {
        animationFrame = window.requestAnimationFrame(drawFrame);
      }
    };

    animationFrame = window.requestAnimationFrame(drawFrame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [p1Color, p2Color, p1Level, p2Level, maxLevel, width, height]);

  return (
    <div className="gallery-panel panel">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Gallery. P1 level ${p1Level}; P2 level ${p2Level}.`}
      >
        P1 is at level {p1Level}. P2 is at level {p2Level}.
      </canvas>
    </div>
  );
}

function updateMotionTarget(
  previous: PlayerMotion | undefined,
  targetLevel: number,
): PlayerMotion {
  if (!previous) {
    return {
      displayLevel: targetLevel,
      targetLevel,
      falling: false,
      impactStartedAt: null,
    };
  }

  const falling = targetLevel < previous.targetLevel;
  return {
    displayLevel: previous.displayLevel,
    targetLevel,
    falling,
    impactStartedAt: falling ? null : previous.impactStartedAt,
  };
}

function advanceMotion(
  motion: PlayerMotion,
  deltaSeconds: number,
  time: number,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    motion.displayLevel = motion.targetLevel;
    motion.falling = false;
    motion.impactStartedAt = null;
    return;
  }

  const distance = motion.targetLevel - motion.displayLevel;
  if (Math.abs(distance) <= 0.04) {
    motion.displayLevel = motion.targetLevel;
    if (motion.falling && motion.impactStartedAt === null) {
      motion.impactStartedAt = time;
    }
    motion.falling = false;
    return;
  }

  const easing = 1 - Math.exp(-POSITION_EASING * deltaSeconds);
  motion.displayLevel += distance * easing;
}

function getPlayerVisual(
  motion: PlayerMotion,
  maxLevel: number,
  time: number,
  reducedMotion: boolean,
): PlayerVisual {
  const movement = motion.targetLevel - motion.displayLevel;
  let verticalScale = 1 + clamp(movement / Math.max(maxLevel, 1) * 0.55, -0.04, 0.04);
  let shakeX = 0;

  if (!reducedMotion && motion.impactStartedAt !== null) {
    const progress = clamp((time - motion.impactStartedAt) / IMPACT_DURATION_MS, 0, 1);
    const impactEnvelope = 1 - progress;
    shakeX = Math.sin(progress * Math.PI * 7) * 4 * impactEnvelope;
    verticalScale *= 1 - Math.sin(progress * Math.PI) * 0.075;
  }

  return {
    level: motion.displayLevel,
    targetLevel: motion.targetLevel,
    verticalScale,
    shakeX,
  };
}

function isAnimating(motion: PlayerMotion, time: number) {
  const moving = Math.abs(motion.targetLevel - motion.displayLevel) > 0.04;
  const impacting =
    motion.impactStartedAt !== null &&
    time - motion.impactStartedAt < IMPACT_DURATION_MS;
  return moving || motion.falling || impacting;
}

function drawGallery(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  maxLevel: number,
  p1Color: string,
  p2Color: string,
  p1: PlayerVisual,
  p2: PlayerVisual,
) {
  ctx.clearRect(0, 0, width, height);
  drawEnvironment(ctx, width, height);

  const trackTop = TRACK_TOP;
  const trackBottom = height - TRACK_BOTTOM;
  const trackMid = (trackTop + trackBottom) / 2;
  const p1X = width * 0.29;
  const p2X = width * 0.67;

  const p1Track = getScaledTrack(trackTop, trackBottom, p1.verticalScale);
  const p2Track = getScaledTrack(trackTop, trackBottom, p2.verticalScale);

  drawLane(ctx, p1X, trackTop, trackBottom, "P1");
  drawLane(ctx, p2X, trackTop, trackBottom, "P2");
  drawRope(ctx, p1X + p1.shakeX * 0.16, p1Track.top, p1Track.bottom, p1.verticalScale);
  drawRope(ctx, p2X + p2.shakeX * 0.16, p2Track.top, p2Track.bottom, p2.verticalScale);

  const p1BaseY = levelToY(p1.level, maxLevel, trackTop, trackBottom);
  const p2BaseY = levelToY(p2.level, maxLevel, trackTop, trackBottom);
  const p1Y = clamp(
    trackMid + (p1BaseY - trackMid) * p1.verticalScale,
    p1Track.top + EGG_HEIGHT * 0.52,
    p1Track.bottom - EGG_HEIGHT * 0.52,
  );
  const p2Y = clamp(
    trackMid + (p2BaseY - trackMid) * p2.verticalScale,
    p2Track.top + EGG_HEIGHT * 0.52,
    p2Track.bottom - EGG_HEIGHT * 0.52,
  );

  drawEgg(ctx, "P1", p1Color, p1X + p1.shakeX, p1Y, p1.verticalScale, p1.targetLevel);
  drawEgg(ctx, "P2", p2Color, p2X + p2.shakeX, p2Y, p2.verticalScale, p2.targetLevel);
  drawScale(ctx, width, trackTop, trackBottom, maxLevel);
}

function drawEnvironment(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "#303833");
  background.addColorStop(0.55, "#252c28");
  background.addColorStop(1, "#202622");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width * 0.48,
    height * 0.42,
    20,
    width * 0.48,
    height * 0.42,
    width * 0.62,
  );
  glow.addColorStop(0, "rgba(141, 176, 153, 0.12)");
  glow.addColorStop(1, "rgba(141, 176, 153, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(233, 238, 234, 0.035)";
  ctx.lineWidth = 1;
  for (let y = 32; y < height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawLane(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  bottom: number,
  label: string,
) {
  ctx.fillStyle = "rgba(229, 235, 230, 0.035)";
  ctx.fillRect(x - 58, top - 12, 116, bottom - top + 24);

  ctx.font = "700 14px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(244, 245, 242, 0.72)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, 27);
}

function getScaledTrack(top: number, bottom: number, scale: number) {
  const midpoint = (top + bottom) / 2;
  const halfHeight = (bottom - top) / 2 * scale;
  return {
    top: midpoint - halfHeight,
    bottom: midpoint + halfHeight,
  };
}

function drawRope(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  bottom: number,
  verticalScale: number,
) {
  ctx.save();
  ctx.lineCap = "round";

  ctx.strokeStyle = "rgba(5, 8, 6, 0.38)";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(x + 2, top + 3);
  ctx.lineTo(x + 2, bottom + 3);
  ctx.stroke();

  const ropeGradient = ctx.createLinearGradient(x - 8, 0, x + 8, 0);
  ropeGradient.addColorStop(0, "#76532f");
  ropeGradient.addColorStop(0.45, "#c59558");
  ropeGradient.addColorStop(0.7, "#9a6d3e");
  ropeGradient.addColorStop(1, "#604225");
  ctx.strokeStyle = ropeGradient;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.stroke();

  ctx.lineWidth = 2;
  const braidSpacing = 12 * verticalScale;
  for (let y = top + 4; y < bottom - 4; y += Math.max(braidSpacing, 8)) {
    ctx.strokeStyle = "rgba(255, 226, 172, 0.52)";
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x + 5, Math.min(y + 7, bottom));
    ctx.stroke();

    ctx.strokeStyle = "rgba(66, 42, 20, 0.46)";
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 1);
    ctx.lineTo(x - 5, Math.min(y + 8, bottom));
    ctx.stroke();
  }

  ctx.restore();
}

function drawEgg(
  ctx: CanvasRenderingContext2D,
  label: string,
  color: string,
  x: number,
  y: number,
  verticalScale: number,
  level: number,
) {
  const resolvedColor = color === "red" ? "#e85e5a" : color === "blue" ? "#519fea" : color;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, verticalScale);

  const fill = ctx.createRadialGradient(
    -EGG_WIDTH * 0.18,
    -EGG_HEIGHT * 0.24,
    2,
    0,
    0,
    EGG_HEIGHT * 0.56,
  );
  fill.addColorStop(0, "#ffffff");
  fill.addColorStop(0.12, resolvedColor);
  fill.addColorStop(1, shadeColor(resolvedColor, -34));

  ctx.beginPath();
  ctx.moveTo(0, -EGG_HEIGHT * 0.5);
  ctx.bezierCurveTo(
    EGG_WIDTH * 0.38,
    -EGG_HEIGHT * 0.47,
    EGG_WIDTH * 0.52,
    -EGG_HEIGHT * 0.08,
    EGG_WIDTH * 0.43,
    EGG_HEIGHT * 0.27,
  );
  ctx.bezierCurveTo(
    EGG_WIDTH * 0.34,
    EGG_HEIGHT * 0.51,
    -EGG_WIDTH * 0.34,
    EGG_HEIGHT * 0.51,
    -EGG_WIDTH * 0.43,
    EGG_HEIGHT * 0.27,
  );
  ctx.bezierCurveTo(
    -EGG_WIDTH * 0.52,
    -EGG_HEIGHT * 0.08,
    -EGG_WIDTH * 0.38,
    -EGG_HEIGHT * 0.47,
    0,
    -EGG_HEIGHT * 0.5,
  );
  ctx.closePath();
  ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(247, 249, 246, 0.82)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
  ctx.beginPath();
  ctx.ellipse(
    -EGG_WIDTH * 0.18,
    -EGG_HEIGHT * 0.2,
    EGG_WIDTH * 0.08,
    EGG_HEIGHT * 0.12,
    -0.35,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  ctx.font = "800 14px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#f4f5f2";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(label, x, y - EGG_HEIGHT * 0.63 * verticalScale);

  ctx.font = "600 12px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(223, 230, 224, 0.82)";
  ctx.textBaseline = "top";
  ctx.fillText(`Lv ${level}`, x, y + EGG_HEIGHT * 0.58 * verticalScale);
}

function drawScale(
  ctx: CanvasRenderingContext2D,
  width: number,
  top: number,
  bottom: number,
  maxLevel: number,
) {
  const scaleX = width - 52;
  ctx.strokeStyle = "rgba(226, 232, 227, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(scaleX, top);
  ctx.lineTo(scaleX, bottom);
  ctx.stroke();

  ctx.font = "600 11px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(223, 230, 224, 0.62)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  for (let index = 0; index <= 6; index += 1) {
    const progress = index / 6;
    const y = top + progress * (bottom - top);
    const level = Math.round(maxLevel * (1 - progress));
    ctx.beginPath();
    ctx.moveTo(scaleX - 6, y);
    ctx.lineTo(scaleX + 6, y);
    ctx.stroke();
    if (index % 2 === 0) ctx.fillText(String(level), scaleX + 10, y);
  }
}

function levelToY(
  level: number,
  maxLevel: number,
  top: number,
  bottom: number,
) {
  const progress = clamp(level, 0, maxLevel) / Math.max(maxLevel, 1);
  return bottom - progress * (bottom - top);
}

function shadeColor(color: string, amount: number) {
  const match = /^#([0-9a-f]{6})$/i.exec(color);
  if (!match) return color;

  const value = Number.parseInt(match[1], 16);
  const red = clamp((value >> 16) + amount, 0, 255);
  const green = clamp(((value >> 8) & 0xff) + amount, 0, 255);
  const blue = clamp((value & 0xff) + amount, 0, 255);
  return `rgb(${red}, ${green}, ${blue})`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
