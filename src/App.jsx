import React, { useEffect, useRef, useState } from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

// 表示上のサイズ（CSSピクセル）を定義
const TOOL_CONFIG = {
  pencil: { size: 16, composite: "source-over", strokeStyle: "#111827" },
  eraser: { size: 60, composite: "destination-out" }, // 消しゴムを大きく設定
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

    const rect = container.getBoundingClientRect();
    const ratio = rect.height / rect.width;

    // 高解像度設定
    canvas.width = 2000;
    canvas.height = 2000 * ratio;

    context.lineCap = "round";
    context.lineJoin = "round";
  }, []);

  // 描画ツールを適用（現在のCanvas表示サイズに合わせてlineWidthを動的に計算）
  const applyToolToContext = (context) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tool = TOOL_CONFIG[toolMode] ?? TOOL_CONFIG.pencil;
    const rect = canvas.getBoundingClientRect();

    // 論理サイズ(2000) / 表示サイズ(rect.width) = 1ピクセルあたりのCanvas内部比率
    const scale = canvas.width / rect.width;

    context.globalCompositeOperation = tool.composite;
    // 表示サイズ(tool.size)に比率(scale)を掛けることで、見た目通りの太さにする
    context.lineWidth = tool.size * scale;
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
    const context = ctxRef.current;
    if (!context) return;

    applyToolToContext(context); // 描画開始時に最新のスケールで太さを適用

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

  const currentToolSize = TOOL_CONFIG[toolMode]?.size || 16;

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] landscape:flex-row">
      <aside className="hidden shrink-0 bg-[#C0C0C0] landscape:block landscape:w-4" />

      <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center landscape:justify-start overflow-hidden bg-[#777777] p-8 md:p-12 lg:p-16">
        <div
          ref={containerRef}
          className="relative h-full w-full max-w-[95%] landscape:max-w-[90%] bg-white shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
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
              className="pointer-events-none absolute rounded-full border-[2px] border-black/40 bg-white/20 mix-blend-difference"
              style={{
                width: `${currentToolSize}px`,
                height: `${currentToolSize}px`,
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </div>
      </main>

      <div className="flex h-40 w-full shrink-0 items-center justify-center bg-[#D1D1D1] px-8 py-6 landscape:h-full landscape:w-44 landscape:px-6">
        <div className="grid h-full w-full max-w-2xl grid-cols-5 items-center justify-items-center rounded-[3rem] bg-[#00FFAB] shadow-2xl landscape:h-auto landscape:max-h-[92vh] landscape:grid-cols-1 landscape:gap-8 landscape:py-12">
          <ToolbarButton
            icon={<Pencil />}
            label="ペン"
            onClick={() => setToolMode("pencil")}
            isActive={toolMode === "pencil"}
          />
          <ToolbarButton
            icon={<Eraser />}
            label="消しゴム"
            onClick={() => setToolMode("eraser")}
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
      className={`flex h-20 w-20 items-center justify-center rounded-[1.5rem] transition-all active:scale-95 ${
        isActive
          ? "bg-black/35 shadow-2xl scale-110 ring-4 ring-black/10"
          : "hover:bg-black/10"
      }`}
    >
      {React.cloneElement(icon, { className: "h-14 w-14", strokeWidth: 2.8 })}
    </button>
  );
}

export default App;
