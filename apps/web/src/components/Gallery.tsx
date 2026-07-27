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

export function Gallery({
  p1Color,
  p2Color,
  p1Level,
  p2Level,
  maxLevel = 120,
  width = 780,
  height = 560,
  backgroundImage = null,
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

    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    } else {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, width, height);
    }

    const cliffW = Math.max(90, width * 0.22);
    const cliffH = Math.max(280, height * 0.68);
    const cliffX = (width - cliffW) / 2;
    const cliffY = (height - cliffH) / 2;
    const wallX = cliffX + cliffW * 0.72;
    const topY = cliffY;
    const botY = cliffY + cliffH;

    const outline = [
      { x: wallX, y: topY + 8 },
      { x: cliffX + cliffW * 0.15, y: topY + cliffH * 0.08 },
      { x: cliffX + cliffW * 0.06, y: topY + cliffH * 0.3 },
      { x: cliffX + cliffW * 0.18, y: topY + cliffH * 0.55 },
      { x: cliffX + cliffW * 0.08, y: topY + cliffH * 0.82 },
      { x: wallX, y: botY - 8 },
    ];

    const rockGrad = ctx.createLinearGradient(cliffX, 0, wallX, 0);
    rockGrad.addColorStop(0, "#9ca3af");
    rockGrad.addColorStop(1, "#64748b");
    ctx.fillStyle = rockGrad;
    ctx.beginPath();
    ctx.moveTo(outline[0].x, outline[0].y);
    for (const point of outline.slice(1)) ctx.lineTo(point.x, point.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#334155";
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
    for (let i = 0; i < 6; i += 1) {
      const y = topY + (i + 1) * (cliffH / 7);
      ctx.beginPath();
      ctx.moveTo(cliffX + cliffW * 0.18, y);
      ctx.lineTo(wallX - 8, y + (i % 2 === 0 ? 7 : -7));
      ctx.stroke();
    }

    drawPlayer(ctx, "P1", p1Color, width * 0.22, levelToY(p1Level), p1Level);
    drawPlayer(ctx, "P2", p2Color, width * 0.78, levelToY(p2Level), p2Level);
    drawScale(ctx, width, height, maxLevel, levelToY, p1Color, p2Color, p1Level, p2Level);
  }, [
    p1Color,
    p2Color,
    p1Level,
    p2Level,
    maxLevel,
    width,
    height,
    backgroundImage,
  ]);

  return (
    <div className="gallery-panel panel">
      <canvas ref={canvasRef} />
    </div>
  );
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  label: string,
  color: string,
  x: number,
  y: number,
  level: number,
) {
  const r = 18;
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(label, x, y - r - 8);

  ctx.font = "14px Arial";
  ctx.textBaseline = "top";
  ctx.fillText(`Lv ${level}`, x, y + r + 8);
}

function drawScale(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  maxLevel: number,
  levelToY: (level: number) => number,
  p1Color: string,
  p2Color: string,
  p1Level: number,
  p2Level: number,
) {
  const scaleX = width - 60;
  const scaleTop = 60;
  const scaleBottom = height - 60;

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(scaleX, scaleTop);
  ctx.lineTo(scaleX, scaleBottom);
  ctx.stroke();

  ctx.font = "12px Arial";
  ctx.fillStyle = "#111827";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 6; i += 1) {
    const t = i / 6;
    const y = scaleTop + t * (scaleBottom - scaleTop);
    const level = Math.round(maxLevel * (1 - t));
    ctx.beginPath();
    ctx.moveTo(scaleX - 8, y);
    ctx.lineTo(scaleX + 8, y);
    ctx.stroke();
    if (i % 2 === 0) ctx.fillText(String(level), scaleX + 14, y);
  }

  drawScaleMarker(ctx, scaleX, levelToY(p1Level), p1Color, "P1");
  drawScaleMarker(ctx, scaleX, levelToY(p2Level), p2Color, "P2");
}

function drawScaleMarker(
  ctx: CanvasRenderingContext2D,
  scaleX: number,
  y: number,
  color: string,
  label: string,
) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(scaleX - 14, y);
  ctx.lineTo(scaleX + 14, y);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillText(label, scaleX - 40, y);
}