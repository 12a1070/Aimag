import React from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

function App() {
  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#E5E5E5] flex-col md:flex-row">
      <div className="hidden md:block md:w-[12%] md:shrink-0 md:bg-[#D1D1D1]" />

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#BCBCBC] px-3 pt-3 md:flex-[0_0_63%] md:px-5 md:py-10">
        <div className="relative h-full min-h-0 w-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <div className="h-full w-full bg-white" />
          <div className="pointer-events-none absolute inset-0 box-border border-[20px] border-black/[0.03]" />
        </div>
      </div>

      <div className="flex shrink-0 justify-center bg-[#D1D1D1] h-24 items-start px-4 pb-3 pt-3 md:h-auto md:w-[25%] md:items-center">
        <div className="flex w-full max-w-[320px] items-center justify-between gap-5 rounded-xl bg-[#00FFAB] px-[18px] py-3 shadow-[0_6px_20px_rgba(0,0,0,0.15)] md:w-[168px] md:max-w-none md:flex-col md:gap-7 md:px-6 md:py-9">
          <ToolbarButton
            icon={<Pencil className="h-7 w-7 md:h-[52px] md:w-[52px]" />}
            label="ペン"
          />
          <ToolbarButton
            icon={<Eraser className="h-7 w-7 md:h-[52px] md:w-[52px]" />}
            label="消しゴム"
          />
          <ToolbarButton
            icon={<Layers className="h-7 w-7 md:h-[52px] md:w-[52px]" />}
            label="レイヤー"
          />
          <ToolbarButton
            icon={<Undo2 className="h-7 w-7 md:h-[52px] md:w-[52px]" />}
            label="元に戻す"
          />
          <ToolbarButton
            icon={<PaintBucket className="h-7 w-7 md:h-[52px] md:w-[52px]" />}
            label="塗りつぶし"
          />
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
      className="flex items-center justify-center rounded-lg text-black transition-transform hover:bg-black/5 active:scale-90 p-2 md:h-[84px] md:w-[84px]"
    >
      {icon}
    </button>
  );
}

export default App;
