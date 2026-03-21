import React, { useState, useEffect, useRef } from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

function App() {
  const canvasRef = useRef(null);
  const [isLandscape, setIsLandscape] = useState(
    () => window.innerWidth > window.innerHeight
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);

      const canvas = canvasRef.current;
      const parent = canvas?.parentElement;
      if (canvas && parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ツールバーは「必要な高さ/幅」を確保し、キャンバスが flex で残りを取る（縦で潰れないようにする）
  return (
    <div
      className={
        isLandscape
          ? "flex h-[100dvh] w-screen flex-row overflow-hidden bg-[#E5E5E5]"
          : "flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#E5E5E5]"
      }
    >
      {/* 1. 左（横） / 上（縦）のグレー余白 */}
      <div
        className={
          isLandscape
            ? "w-[15%] shrink-0 bg-[#D1D1D1]"
            : "h-10 shrink-0 bg-[#D1D1D1]"
        }
      />

      {/* 2. 中央キャンバス：flex-1 + min-h-0 / min-w-0 でツールバー領域を確保 */}
      <div
        className={
          isLandscape
            ? "flex min-h-0 min-w-0 flex-[0_0_70%] items-center justify-center bg-[#BCBCBC] px-5 py-10"
            : "flex min-h-0 min-w-0 flex-1 items-center justify-center bg-[#BCBCBC] p-5"
        }
      >
        <div className="relative h-full w-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <canvas
            ref={canvasRef}
            className="block h-full w-full cursor-crosshair"
          />
          <div
            className="pointer-events-none absolute inset-0 border-[20px] border-black/[0.03]"
            aria-hidden
          />
        </div>
      </div>

      {/* 3. 右（横） / 下（縦）：ツールバー — 縦は幅100%・高さは内容に合わせる */}
      <div
        className={
          isLandscape
            ? "flex w-[15%] shrink-0 items-center justify-center bg-[#D1D1D1]"
            : "flex w-full shrink-0 items-center justify-center bg-[#D1D1D1] px-2 py-2"
        }
      >
        <div
          className={
            isLandscape
              ? "flex flex-col items-center justify-center gap-6 rounded-lg bg-[#00FFAB] px-4 py-6 shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
              : "flex max-w-full flex-row flex-wrap items-center justify-center gap-2 rounded-lg bg-[#00FFAB] px-2 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.15)] sm:gap-6 sm:px-4 sm:py-4"
          }
        >
          {/* 狭い画面ではアイコンを小さくして1行に収める */}
          <ToolbarButton
            icon={<Pencil className="h-6 w-6 sm:h-8 sm:w-8" />}
          />
          <ToolbarButton
            icon={<Eraser className="h-6 w-6 sm:h-8 sm:w-8" />}
          />
          <ToolbarButton
            icon={<Layers className="h-6 w-6 sm:h-8 sm:w-8" />}
          />
          <ToolbarButton
            icon={<Undo2 className="h-6 w-6 sm:h-8 sm:w-8" />}
          />
          <ToolbarButton
            icon={<PaintBucket className="h-6 w-6 sm:h-8 sm:w-8" />}
          />
        </div>
      </div>
    </div>
  );
}

const ToolbarButton = ({ icon }) => (
  <button
    type="button"
    className="flex shrink-0 items-center justify-center rounded-md p-1.5 text-black transition-transform hover:bg-black/5 active:scale-90 sm:p-2"
  >
    {icon}
  </button>
);

export default App;
