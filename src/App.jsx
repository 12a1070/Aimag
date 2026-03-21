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
      {/* PC時のみ左のグレー余白 */}
      {!isMobile && <div className="w-[15%] shrink-0 bg-[#D1D1D1]" />}

      {/* 中央：白いキャンバス領域（描画ロジックは未実装・見た目のみ） */}
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

      {/* PC時は右ツールバー / スマホ時は下部ツールバー */}
      <div
        className={`flex shrink-0 justify-center bg-[#D1D1D1] ${
          isMobile ? "h-24 items-start px-4 pb-3 pt-3" : "w-[15%] items-center"
        }`}
      >
        <div
          className={`flex rounded-lg bg-[#00FFAB] shadow-[0_6px_20px_rgba(0,0,0,0.15)] ${
            isMobile
              ? "w-full max-w-[320px] items-center justify-between gap-5 px-[18px] py-3"
              : "flex-col items-center justify-center gap-8 px-4 py-6"
          }`}
        >
          <ToolbarButton icon={<Pencil size={28} />} label="ペン" />
          <ToolbarButton icon={<Eraser size={28} />} label="消しゴム" />
          <ToolbarButton icon={<Layers size={28} />} label="レイヤー" />
          <ToolbarButton icon={<Undo2 size={28} />} label="元に戻す" />
          <ToolbarButton icon={<PaintBucket size={28} />} label="塗りつぶし" />
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ icon, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex items-center justify-center rounded-md p-2 text-black transition-transform hover:bg-black/5 active:scale-90"
    >
      {icon}
    </button>
  );
}

export default App;
