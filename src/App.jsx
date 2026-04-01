import React, { useEffect, useRef, useState } from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

// 固定解像度(2000px)に合わせて線の太さを調整
const TOOL_CONFIG = {
  pencil: { lineWidth: 12, composite: "source-over", strokeStyle: "#111827" },
  eraser: { lineWidth: 80, composite: "destination-out" },
};
const BRUSH_INDICATOR_SIZE = 20;

const applyToolToContext = (context, toolMode) => {
  const tool = TOOL_CONFIG[toolMode] ?? TOOL_CONFIG.pencil;
  context.globalCompositeOperation = tool.composite;
  context.lineWidth = tool.lineWidth;
  if (tool.strokeStyle) context.strokeStyle = tool.strokeStyle;
};

function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState("pencil");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isPointerInCanvas, setIsPointerInCanvas] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    ctxRef.current = context;

    // 解像度を2000pxに固定してリサイズによる劣化を防止
    canvas.width = 2000;
    canvas.height = 2000;

    context.lineCap = "round";
    context.lineJoin = "round";
    applyToolToContext(context, "pencil");
  }, []);

  // 画面上の座標をキャンバス内の固定座標(2000px)に変換
  const getPointFromEvent = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const displaySize = Math.min(rect.width, rect.height);

    // object-containによる余白(レターボックス)を考慮したオフセット計算
    const offsetX = (rect.width - displaySize) / 2;
    const offsetY = (rect.height - displaySize) / 2;
    const scale = canvas.width / displaySize;

    return {
      x: (event.clientX - (rect.left + offsetX)) * scale,
      y: (event.clientY - (rect.top + offsetY)) * scale,
    };
  };

  const startDrawing = (event) => {
    const context = ctxRef.current;
    if (!context) return;
    isDrawingRef.current = true;
    const point = getPointFromEvent(event);
    lastPointRef.current = point;

    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const draw = (event) => {
    const context = ctxRef.current;
    if (!context || !isDrawingRef.current) return;
    const point = getPointFromEvent(event);
    const lastPoint = lastPointRef.current;

    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const updateCursorPosition = (event) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const updateTool = (newMode) => {
    setToolMode(newMode);
    if (ctxRef.current) applyToolToContext(ctxRef.current, newMode);
  };

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] landscape:flex-row">
      <aside className="hidden shrink-0 bg-[#D1D1D1] landscape:block landscape:w-16 md:landscape:w-20" />
      <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#BCBCBC] p-0">
        <div className="relative aspect-square h-full max-h-full w-full max-w-full bg-white shadow-2xl">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full object-contain cursor-none touch-none"
            onPointerDown={startDrawing}
            onPointerMove={(e) => {
              updateCursorPosition(e);
              draw(e);
            }}
            onPointerUp={stopDrawing}
            onPointerEnter={(e) => {
              setIsPointerInCanvas(true);
              updateCursorPosition(e);
            }}
            onPointerLeave={() => {
              setIsPointerInCanvas(false);
              stopDrawing();
            }}
            onPointerCancel={() => {
              setIsPointerInCanvas(false);
              stopDrawing();
            }}
          />
          {isPointerInCanvas && (
            <div
              className="pointer-events-none absolute rounded-full border-2 border-black/80 bg-black/10"
              style={{
                width: `${BRUSH_INDICATOR_SIZE}px`,
                height: `${BRUSH_INDICATOR_SIZE}px`,
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </div>
      </main>

      <div className="flex h-20 w-full shrink-0 items-center justify-center bg-[#D1D1D1] px-3 py-2 landscape:h-full landscape:w-[84px] landscape:px-1 md:landscape:w-[96px]">
        <div className="grid h-full w-full max-w-[560px] grid-cols-5 items-center justify-items-center rounded-2xl bg-[#00FFAB] px-3 py-2 shadow-2xl landscape:h-auto landscape:max-h-[88vh] landscape:w-full landscape:grid-cols-1 landscape:gap-1 landscape:px-1 landscape:py-2 md:landscape:gap-2 md:landscape:px-2 md:landscape:py-3">
          <ToolbarButton
            icon={<Pencil />}
            label="ペン"
            onClick={() => updateTool("pencil")}
            isActive={toolMode === "pencil"}
          />
          <ToolbarButton
            icon={<Eraser />}
            label="消しゴム"
            onClick={() => updateTool("eraser")}
            isActive={toolMode === "eraser"}
          />
          <ToolbarButton icon={<Layers />} label="レイヤー" />
          <ToolbarButton icon={<Undo2 />} label="元に戻す" />
          <ToolbarButton icon={<PaintBucket />} label="塗りつぶし" />
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
      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-90 ${isActive ? "bg-black/20" : "hover:bg-black/10"}`}
    >
      {React.cloneElement(icon, { className: "h-7 w-7" })}
    </button>
  );
}

export default App;
