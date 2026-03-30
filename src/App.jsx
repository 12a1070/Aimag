import React, { useEffect, useRef, useState } from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

/**
 * ツールの設定定義
 * 消しゴムは destination-out（描画先を削る）を利用して実現
 */
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
const BRUSH_INDICATOR_SIZE = 20;

/**
 * CanvasRenderingContext2D に対し、選択中のツール設定を適用する
 */
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
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isPointerInCanvas, setIsPointerInCanvas] = useState(false);

  // ReactのState更新を待たずにCanvas操作を行うためのRef管理
  const toolModeRef = useRef(toolMode);
  const canvasEverSizedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    /**
     * デバイスピクセル比（DPR）を考慮した高解像度対応のリサイズ処理
     * リサイズ時に既存の描画内容が消失するのを防ぐためスナップショットを保持
     */
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const { width, height } = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      if (width <= 0 || height <= 0) return;

      // 既存の描画内容を退避
      let snapshotImageData = null;
      let snapshotWidth = 0;
      let snapshotHeight = 0;
      if (canvasEverSizedRef.current && canvas.width > 0 && canvas.height > 0) {
        snapshotWidth = canvas.width;
        snapshotHeight = canvas.height;
        snapshotImageData = context.getImageData(
          0,
          0,
          snapshotWidth,
          snapshotHeight,
        );
      }

      // バッファサイズと表示サイズの同期
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      // 退避したデータをリサイズ後のCanvasへ再描画
      if (snapshotImageData) {
        const snapshotCanvas = document.createElement("canvas");
        snapshotCanvas.width = snapshotWidth;
        snapshotCanvas.height = snapshotHeight;
        const snapshotContext = snapshotCanvas.getContext("2d");
        if (snapshotContext) {
          snapshotContext.putImageData(snapshotImageData, 0, 0);
          context.imageSmoothingEnabled = false;
          context.drawImage(snapshotCanvas, 0, 0, width, height);
          context.imageSmoothingEnabled = true;
        }
      }

      context.lineCap = "round";
      context.lineJoin = "round";
      applyToolToContext(context, toolModeRef.current);

      canvasEverSizedRef.current = true;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  /**
   * ブラウザの座標をCanvas上の座標に変換
   */
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

    isDrawingRef.current = true;
    const point = getPointFromEvent(event);
    lastPointRef.current = point;
    setCursorPos(point);

    // 単発クリックでの点描画に対応
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

    // 前回の座標から現在の座標までを短い線分で繋ぎ、手書きの軌跡を再現
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
    setCursorPos(getPointFromEvent(event));
  };

  const handlePointerMove = (event) => {
    updateCursorPosition(event);
    draw(event);
  };

  const handlePointerEnter = (event) => {
    setIsPointerInCanvas(true);
    updateCursorPosition(event);
  };

  const handlePointerLeave = () => {
    setIsPointerInCanvas(false);
    stopDrawing();
  };

  const handlePointerCancel = () => {
    setIsPointerInCanvas(false);
    stopDrawing();
  };

  /**
   * ツール切り替え：ReactのState更新とCanvasのコンテキスト設定を一括で行う
   * 副作用（useEffect）を介さず直接命令を出すことで、処理の透明性を確保
   */
  const updateTool = (newMode) => {
    setToolMode(newMode);
    toolModeRef.current = newMode;
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        applyToolToContext(context, newMode);
      }
    }
  };

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] landscape:flex-row">
      <aside className="hidden shrink-0 bg-[#D1D1D1] landscape:block landscape:w-16 md:landscape:w-20" />

      <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#BCBCBC] p-3 landscape:p-2">
        <div className="relative h-full w-full bg-white">
          <canvas
            ref={canvasRef}
            className="h-full w-full cursor-none bg-white touch-none"
            onPointerDown={startDrawing}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDrawing}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={handlePointerCancel}
          />
          {/* ブラシサイズを可視化するカスタムカーソル */}
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
          <div className="pointer-events-none absolute inset-0 box-border border-4 border-black/5" />
        </div>
      </main>

      <div className="flex h-24 w-full shrink-0 items-center justify-center bg-[#D1D1D1] px-3 py-2 landscape:h-full landscape:w-[84px] landscape:px-1 md:landscape:w-[96px]">
        <div className="grid h-full w-full max-w-[560px] grid-cols-5 items-center justify-items-center rounded-2xl bg-[#00FFAB] px-3 py-2 shadow-2xl landscape:h-auto landscape:max-h-[88vh] landscape:w-full landscape:grid-cols-1 landscape:gap-1 landscape:px-1 landscape:py-2 md:landscape:gap-2 md:landscape:px-2 md:landscape:py-3">
          <ToolbarButton
            icon={
              <Pencil className="h-8 w-8 landscape:h-6 landscape:w-6 md:landscape:h-7 md:landscape:w-7" />
            }
            label="ペン"
            onClick={() => updateTool("pencil")}
            isActive={toolMode === "pencil"}
          />
          <ToolbarButton
            icon={
              <Eraser className="h-8 w-8 landscape:h-6 landscape:w-6 md:landscape:h-7 md:landscape:w-7" />
            }
            label="消しゴム"
            onClick={() => updateTool("eraser")}
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
