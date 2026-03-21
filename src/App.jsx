import React, { useEffect, useState } from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`flex h-[100dvh] w-screen overflow-hidden bg-[#E5E5E5] ${
        isMobile ? "flex-col" : "flex-row"
      }`}
    >
      {!isMobile && <div className="w-[15%] shrink-0 bg-[#D1D1D1]" />}

      <div
        className={`flex min-h-0 items-center justify-center overflow-hidden bg-[#BCBCBC] ${
          isMobile
            ? "flex-1 px-3 pb-0 pt-3"
            : "min-w-0 flex-[0_0_70%] px-5 py-10"
        }`}
      >
        <div className="relative h-full min-h-0 w-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <canvas
            className="block h-full w-full cursor-crosshair bg-white"
            aria-label="描画キャンバス（プレースホルダー）"
          />
          <div
            className="pointer-events-none absolute inset-0 box-border border-[20px] border-black/[0.03]"
            aria-hidden="true"
          />
        </div>
      </div>

      <div
        className={`flex shrink-0 justify-center bg-[#D1D1D1] ${
          isMobile ? "h-24 items-start px-4 pb-3 pt-3" : "w-[15%] items-center"
        }`}
      >
        <div
          className={`flex rounded-xl bg-[#00FFAB] shadow-[0_6px_20px_rgba(0,0,0,0.15)] ${
            isMobile
              ? "w-full max-w-[320px] items-center justify-between gap-5 px-[18px] py-3"
              : "w-[112px] flex-col items-center justify-center gap-7 px-4 py-8"
          }`}
        >
          <ToolbarButton
            icon={
              <Pencil className={isMobile ? "h-7 w-7" : "h-[46px] w-[46px]"} />
            }
            label="ペン"
            isMobile={isMobile}
          />
          <ToolbarButton
            icon={
              <Eraser className={isMobile ? "h-7 w-7" : "h-[46px] w-[46px]"} />
            }
            label="消しゴム"
            isMobile={isMobile}
          />
          <ToolbarButton
            icon={
              <Layers className={isMobile ? "h-7 w-7" : "h-[46px] w-[46px]"} />
            }
            label="レイヤー"
            isMobile={isMobile}
          />
          <ToolbarButton
            icon={
              <Undo2 className={isMobile ? "h-7 w-7" : "h-[46px] w-[46px]"} />
            }
            label="元に戻す"
            isMobile={isMobile}
          />
          <ToolbarButton
            icon={
              <PaintBucket
                className={isMobile ? "h-7 w-7" : "h-[46px] w-[46px]"}
              />
            }
            label="塗りつぶし"
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ icon, label, isMobile }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`flex items-center justify-center rounded-lg text-black transition-transform hover:bg-black/5 active:scale-90 ${
        isMobile ? "p-2" : "h-16 w-16"
      }`}
    >
      {icon}
    </button>
  );
}

export default App;
