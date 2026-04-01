import React, { useEffect, useRef, useState } from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

const TOOL_CONFIG = {
  pencil: { lineWidth: 12, composite: "source-over", strokeStyle: "#111827" },
  eraser: { lineWidth: 80, composite: "destination-out" },
};
const BRUSH_INDICATOR_SIZE = 24; // インジケーターも少し大きく

const applyToolToContext = (context, toolMode) => {
  const tool = TOOL_CONFIG[toolMode] ?? TOOL_CONFIG.pencil;
  context.globalCompositeOperation = tool.composite;
  context.lineWidth = tool.lineWidth;
  if (tool.strokeStyle) context.strokeStyle = tool.strokeStyle;
};

function App() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState("pencil");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isPointerInCanvas, setIsPointerInCanvas] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    ctxRef.current = context;

    // 比率の計算
    const rect = container.getBoundingClientRect();
    const ratio = rect.height / rect.width;

    canvas.width = 2000;
    canvas.height = 2000 * ratio;

    context.lineCap = "round";
    context.lineJoin = "round";
    applyToolToContext(context, "pencil");
  }, []);

  const getPointFromEvent = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
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

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] landscape:flex-row">
      <aside className="hidden shrink-0 bg-[#C0C0C0] landscape:block landscape:w-12" />

      {/* メインエリア：p-6に増やして「紙」を浮かせ、ツールバーとの距離を確保 */}
      <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#888888] p-6 md:p-10">
        <div
          ref={containerRef}
          className="relative h-full w-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all"
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full cursor-none touch-none bg-white"
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

      {/* ツールバー：高さを20→24(96px)に、横幅を84→112pxに拡大 */}
      <div className="flex h-24 w-full shrink-0 items-center justify-center bg-[#D1D1D1] px-4 py-3 landscape:h-full landscape:w-28 landscape:px-3">
        <div className="grid h-full w-full max-w-lg grid-cols-5 items-center justify-items-center rounded-3xl bg-[#00FFAB] shadow-xl landscape:h-auto landscape:max-h-[90vh] landscape:w-full landscape:grid-cols-1 landscape:gap-4 landscape:py-6">
          <ToolbarButton
            icon={<Pencil />}
            label="ペン"
            onClick={() => {
              setToolMode("pencil");
              applyToolToContext(ctxRef.current, "pencil");
            }}
            isActive={toolMode === "pencil"}
          />
          <ToolbarButton
            icon={<Eraser />}
            label="消しゴム"
            onClick={() => {
              setToolMode("eraser");
              applyToolToContext(ctxRef.current, "eraser");
            }}
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
      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all active:scale-95 active:bg-black/30 ${
        isActive ? "bg-black/25 shadow-inner scale-105" : "hover:bg-black/10"
      }`}
    >
      {/* アイコンサイズを h-7 -> h-9 にアップ */}
      {React.cloneElement(icon, { className: "h-9 w-9 stroke-[1.5px]" })}
    </button>
  );
}

export default App;
