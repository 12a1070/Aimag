import React, { useEffect, useRef, useState } from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

const TOOL_CONFIG = {
  pencil: { size: 16, composite: "source-over", strokeStyle: "#111827" },
  eraser: { size: 60, composite: "destination-out" },
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
  const [cursorScale, setCursorScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    ctxRef.current = context;

    // 横長を考慮して内部解像度を 3000(横) x 2000(縦) で固定
    if (canvas.width !== 3000) {
      canvas.width = 3000;
      canvas.height = 2000;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const applyToolToContext = (context) => {
    const tool = TOOL_CONFIG[toolMode] ?? TOOL_CONFIG.pencil;
    context.globalCompositeOperation = tool.composite;
    context.lineWidth = tool.size; // 内部解像度に対して固定
    if (tool.strokeStyle) context.strokeStyle = tool.strokeStyle;
  };

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
    const canvas = canvasRef.current;
    const context = ctxRef.current;
    if (!context || !canvas) return;

    canvas.setPointerCapture(event.pointerId);
    applyToolToContext(context);
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

  const stopDrawing = (event) => {
    if (canvasRef.current) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
    isDrawingRef.current = false;
  };

  const updateCursorPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (rect && canvas) {
      const nextScale = rect.width / canvas.width;
      setCursorScale((prev) =>
        Math.abs(prev - nextScale) < 0.001 ? prev : nextScale,
      );
      setCursorPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] md:flex-row landscape:flex-row">
      {/* メインエリア */}
      <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#777777] p-2 sm:p-6 md:p-10">
        <div
          ref={containerRef}
          className="relative h-full w-full bg-white shadow-2xl
            /* 縦向きは正方形、横向きは親要素いっぱい(w-full h-full) */
            portrait:aspect-square portrait:h-auto portrait:w-full
            landscape:w-full landscape:h-full"
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
            onPointerEnter={() => setIsPointerInCanvas(true)}
            onPointerLeave={() => setIsPointerInCanvas(false)}
          />
          {isPointerInCanvas && (
            <div
              className="pointer-events-none absolute rounded-full border-2 border-black/40 bg-white/20 mix-blend-difference"
              style={{
                width: `${TOOL_CONFIG[toolMode].size * cursorScale}px`,
                height: `${TOOL_CONFIG[toolMode].size * cursorScale}px`,
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </div>
      </main>

      {/* ツールバー */}
      <div className="flex shrink-0 items-center justify-center bg-[#D1D1D1] h-24 w-full px-2 py-1 landscape:h-full landscape:w-28 landscape:px-2 md:h-full md:w-32 md:px-4">
        <div className="flex h-full w-full max-w-md items-center justify-around rounded-3xl bg-[#00FFAB] p-2 shadow-xl landscape:h-[90vh] landscape:flex-col landscape:justify-evenly md:h-[85vh] md:flex-col md:justify-evenly">
          <ToolbarButton
            icon={<Pencil />}
            onClick={() => setToolMode("pencil")}
            isActive={toolMode === "pencil"}
          />
          <ToolbarButton
            icon={<Eraser />}
            onClick={() => setToolMode("eraser")}
            isActive={toolMode === "eraser"}
          />
          <ToolbarButton icon={<Layers />} />
          <ToolbarButton icon={<Undo2 />} />
          <ToolbarButton icon={<PaintBucket />} />
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ icon, onClick, isActive = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center transition-all active:scale-95 h-12 w-12 rounded-xl landscape:h-[12vh] landscape:max-h-[56px] landscape:w-14 md:h-16 md:w-16 md:rounded-2xl
        ${isActive ? "bg-black/35 shadow-lg scale-110 ring-2 ring-black/10" : "hover:bg-black/10"}`}
    >
      {React.cloneElement(icon, {
        className: "h-6 w-6 md:h-8 md:w-8 landscape:h-[45%] landscape:w-auto",
        strokeWidth: 2.5,
      })}
    </button>
  );
}

export default App;
