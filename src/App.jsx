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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    ctxRef.current = context;

    if (canvas.width !== 2500) {
      canvas.width = 2500;
      canvas.height = 2500;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // 線の太さを「キャンバス内部の数値」で固定（画面サイズに依存させない）
  const applyToolToContext = (context) => {
    const tool = TOOL_CONFIG[toolMode] ?? TOOL_CONFIG.pencil;
    context.globalCompositeOperation = tool.composite;
    // 画面の拡大率(scale)を掛けず、直接数値を指定することで回転時の太さ変化を防ぐ
    context.lineWidth = tool.size;
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

    // タッチパッドのクリックを確実に捕捉
    canvas.setPointerCapture(event.pointerId);

    applyToolToContext(context);
    isDrawingRef.current = true;
    const point = getPointFromEvent(event);
    lastPointRef.current = point;

    // 点を描画するための処理
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(point.x, point.y); // 同じ位置に線を引くことで「点」にする
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
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] md:flex-row landscape:flex-row">
      <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#777777] p-2 sm:p-6 md:p-10">
        <div
          ref={containerRef}
          className="relative aspect-square h-full max-h-full max-w-full bg-white shadow-2xl"
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
            onPointerLeave={(e) => {
              setIsPointerInCanvas(false);
              // ここではstopDrawingを呼ばない（キャプチャしているため枠外でも描けるようにする）
            }}
          />
          {isPointerInCanvas && (
            <div
              className="pointer-events-none absolute rounded-full border-[2px] border-black/40 bg-white/20 mix-blend-difference"
              style={{
                // 画面上のカーソルサイズは見た目の比率に合わせる
                width: `${TOOL_CONFIG[toolMode].size * (containerRef.current?.offsetWidth / 2500)}px`,
                height: `${TOOL_CONFIG[toolMode].size * (containerRef.current?.offsetWidth / 2500)}px`,
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </div>
      </main>

      <div className="flex shrink-0 items-center justify-center bg-[#D1D1D1] h-24 w-full px-2 py-1 landscape:h-full landscape:w-28 landscape:px-2 md:h-full md:w-32 md:px-4">
        <div className="flex h-full w-full max-w-md items-center justify-around rounded-[1.5rem] bg-[#00FFAB] p-2 shadow-xl landscape:h-[90vh] landscape:flex-col landscape:justify-evenly md:h-[85vh] md:flex-col md:justify-evenly">
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
