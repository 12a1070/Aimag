import React, { useEffect, useRef, useState } from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

const TOOL_CONFIG = {
  pencil: {
    lineWidth: 4,
    composite: "source-over",
    strokeStyle: "#111827",
  },
  eraser: {
    lineWidth: 22,
    composite: "destination-out",
  },
};

const applyToolToContext = (context, toolMode) => {
  const tool = TOOL_CONFIG[toolMode] ?? TOOL_CONFIG.pencil;
  context.globalCompositeOperation = tool.composite;
  context.lineWidth = tool.lineWidth;

  if (tool.strokeStyle) {
    context.strokeStyle = tool.strokeStyle;
  }
};

function App() {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState("pencil");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const { width, height } = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);
      context.lineCap = "round";
      context.lineJoin = "round";
      applyToolToContext(context, "pencil");
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const getPointFromEvent = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // pointerdown の時点で「描画中フラグ」を true にすることで、
    // pointermove が発生したときだけ線を引くように制御できます。
    // これがないと、ただマウスを動かしただけで常に描画されてしまいます。
    isDrawingRef.current = true;

    const point = getPointFromEvent(event);
    lastPointRef.current = point;

    // 押した瞬間に点を打つために beginPath -> moveTo -> lineTo を同じ座標で実行。
    // これにより「クリック/タップだけ」の操作でも小さな点が残ります。
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const draw = (event) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const point = getPointFromEvent(event);
    const lastPoint = lastPointRef.current;

    // なぜマウスを動かすと線が引けるのか:
    // 1) 前回座標(lastPoint)と今回座標(point)を結ぶ「短い線分」を毎回描く
    // 2) pointermove は移動中に何度も発火する
    // 3) 短い線分が連続して並ぶと、人の目には 1 本の連続した線に見える
    // つまり「移動イベントの連続」+「2点間の線分描画」の組み合わせで手書き線になります。
    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    applyToolToContext(context, toolMode);
  }, [toolMode]);

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] landscape:flex-row">
      {/* 左パネル：横向き時のみ表示 */}
      <aside className="hidden shrink-0 bg-[#D1D1D1] landscape:block landscape:w-16 md:landscape:w-20" />

      {/* キャンバスエリア */}
      <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#BCBCBC] p-3 landscape:p-2">
        <div className="relative h-full w-full bg-white">
          <canvas
            ref={canvasRef}
            className="h-full w-full bg-white touch-none"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            onPointerCancel={stopDrawing}
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
            onClick={() => setToolMode("pencil")}
            isActive={toolMode === "pencil"}
          />
          <ToolbarButton
            icon={
              <Eraser className="h-8 w-8 landscape:h-6 landscape:w-6 md:landscape:h-7 md:landscape:w-7" />
            }
            label="消しゴム"
            onClick={() => setToolMode("eraser")}
            isActive={toolMode === "eraser"}
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
        isActive ? "bg-black/20" : "hover:bg-black/10"
      }`}
    >
      {icon}
    </button>
  );
}

export default App;
