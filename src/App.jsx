import React from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

function App() {
  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] landscape:flex-row">
      {/* 左パネル：横向き時のみ表示 */}
      <aside className="hidden shrink-0 bg-[#D1D1D1] landscape:block landscape:w-16 md:landscape:w-20" />

      {/* キャンバスエリア */}
      <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#BCBCBC] p-3 landscape:p-2">
        <div className="relative h-full w-full bg-white">
          <div className="h-full w-full bg-white" />
          <div className="pointer-events-none absolute inset-0 box-border border-4 border-black/5" />
        </div>
      </main>

      {/* ツールバー外枠 */}
      <div className="flex h-24 w-full shrink-0 items-center justify-center bg-[#D1D1D1] px-3 py-2 landscape:h-full landscape:w-[84px] landscape:px-1 md:landscape:w-[96px]">
        <div className="grid h-full w-full max-w-[560px] grid-cols-5 items-center justify-items-center rounded-2xl bg-[#00FFAB] px-3 py-2 shadow-2xl landscape:h-auto landscape:max-h-[88vh] landscape:w-full landscape:grid-cols-1 landscape:gap-1 landscape:px-1 landscape:py-2 md:landscape:gap-2 md:landscape:px-2 md:landscape:py-3">
          <ToolbarButton
            icon={
              <Pencil className="h-8 w-8 landscape:h-6 landscape:w-6 md:landscape:h-7 md:landscape:w-7" />
            }
            label="ペン"
          />
          <ToolbarButton
            icon={
              <Eraser className="h-8 w-8 landscape:h-6 landscape:w-6 md:landscape:h-7 md:landscape:w-7" />
            }
            label="消しゴム"
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

function ToolbarButton({ icon, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-black transition-all hover:bg-black/10 active:scale-90 landscape:h-8 landscape:w-8 md:landscape:h-10 md:landscape:w-10"
    >
      {icon}
    </button>
  );
}

export default App;
