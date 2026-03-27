import React, { useEffect, useRef, useState } from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

function App() {
  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState("pencil");

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = canvasWrapperRef.current;
    if (!canvas || !wrapper) return;

    const setupCanvasSize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    setupCanvasSize();
    window.addEventListener("resize", setupCanvasSize);
    return () => window.removeEventListener("resize", setupCanvasSize);
  }, []);

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const drawLine = (from, to) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (toolMode === "eraser") {
      // 消しゴムの理屈:
      // destination-out は「新しく描いた線の部分だけ、既存の絵を透明にする」合成モード。
      // つまり白で上から塗っているのではなく、ピクセル自体を削って消している。
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 24;
      ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#111111";
    }

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    const point = getCanvasPoint(event);
    isDrawingRef.current = true;
    lastPointRef.current = point;
    drawLine(point, point);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();
    const currentPoint = getCanvasPoint(event);

    // なぜ「マウスを動かすと線が引ける」のか:
    // 1) pointerdown で「描画中フラグ」を true にする
    // 2) pointermove が動くたびに発火する
    // 3) 前回座標(lastPoint) -> 今回座標(currentPoint)を毎回結ぶ
    // この処理を高速に繰り返すことで、連続した1本の線に見える。
    drawLine(lastPointRef.current, currentPoint);
    lastPointRef.current = currentPoint;
  };

  const endDrawing = (event) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] landscape:flex-row">
      {/* 左パネル：横向き時のみ表示 */}
      <aside className="hidden shrink-0 bg-[#D1D1D1] landscape:block landscape:w-16 md:landscape:w-20" />

      {/* キャンバスエリア */}
      <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#BCBCBC] p-3 landscape:p-2">
        <div ref={canvasWrapperRef} className="relative h-full w-full bg-white">
          <canvas
            ref={canvasRef}
            className="h-full w-full touch-none bg-white"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrawing}
            onPointerLeave={endDrawing}
            onPointerCancel={endDrawing}
          />
          <div className="pointer-events-none absolute inset-0 box-border border-4 border-black/5" />
        </div>
      </main>

      {/* ツールバー外枠 */}
      <div className="flex h-24 w-full shrink-0 items-center justify-center bg-[#D1D1D1] px-3 py-2 landscape:h-full landscape:w-[84px] landscape:px-1 md:landscape:w-[96px]">
        <div className="grid h-full w-full max-w-[560px] grid-cols-5 items-center justify-items-center rounded-2xl bg-[#00FFAB] px-3 py-2 shadow-2xl landscape:h-auto landscape:max-h-[88vh] landscape:w-full landscape:grid-cols-1 landscape:gap-1 landscape:px-1 landscape:py-2 md:landscape:gap-2 md:landscape:px-2 md:landscape:py-3">
          <ToolbarButton
            icon={
              <Pencil className="h-8 w-8 landscape:h-6 landscape:w-6 md:landscape:h-7 md:landscape:w-7" />
            }
            label="ペン"
            isActive={toolMode === "pencil"}
            onClick={() => setToolMode("pencil")}
          />
          <ToolbarButton
            icon={
              <Eraser className="h-8 w-8 landscape:h-6 landscape:w-6 md:landscape:h-7 md:landscape:w-7" />
            }
            label="消しゴム"
            isActive={toolMode === "eraser"}
            onClick={() => setToolMode("eraser")}
          />
          <ToolbarButton
            icon={
              <Layers className="h-8 w-8 landscape:h-6 landscape:w-6 md:landscape:h-7 md:landscape:w-7" />
            }
            label="レイヤー"
          />
          <ToolbarButton
            icon={
              <Undo2 className="h-8 w-8 landscape:h-6 landscape:w-6 md:landscape:h-7 md:landscape:w-7" />
            }
            label="元に戻す"
          />
          <ToolbarButton
            icon={
              <PaintBucket className="h-8 w-8 landscape:h-6 landscape:w-6 md:landscape:h-7 md:landscape:w-7" />
            }
            label="塗りつぶし"
          />
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ icon, label, onClick, isActive = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-xl text-black transition-all active:scale-90 landscape:h-8 landscape:w-8 md:landscape:h-10 md:landscape:w-10 ${
        isActive ? "bg-black/15" : "hover:bg-black/10"
      }`}
    >
      {icon}
    </button>
  );
}

export default App;
