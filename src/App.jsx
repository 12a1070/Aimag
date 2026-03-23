import React from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

function App() {
  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] landscape:flex-row">
      {/* 1. 左パネル */}
      <div className="hidden w-[8%] shrink-0 bg-[#D1D1D1] landscape:block landscape:shrink-0 md:w-[5%]" />

      {/* 2. キャンバスエリア */}
      <div className="flex min-h-0 flex-1 min-w-0 items-center justify-center overflow-hidden bg-[#BCBCBC] px-0 pt-0 landscape:p-0">
        <div className="relative h-full w-full bg-white shadow-none">
          <div className="h-full w-full bg-white" />
          <div className="pointer-events-none absolute inset-0 box-border border-4 border-black/5" />
        </div>
      </div>

      {/* 3. ツールバー外枠：
          - 縦向き時の高さを h-24 から h-32（128px）に引き上げ、存在感をアップ。 */}
      <div className="flex h-32 w-full shrink-0 items-center justify-center bg-[#D1D1D1] px-6 py-4 landscape:h-full landscape:w-[110px] landscape:shrink-0 landscape:px-2 md:landscape:w-[250px]">
        {/* 緑色のツールバー本体：
            - 縦向き時：px-8 py-4 に広げ、gap-8 でボタン間を確保。
            - 横向き時：スマホとPCでサイズを使い分ける。 */}
        <div className="flex w-full min-w-fit max-w-[500px] items-center justify-between rounded-2xl bg-[#00FFAB] px-8 py-4 shadow-2xl landscape:flex-col landscape:h-auto landscape:max-h-[90vh] landscape:w-full landscape:justify-center landscape:gap-4 landscape:py-6 md:landscape:w-[180px] md:landscape:gap-8 md:landscape:py-12">
          <ToolbarButton
            icon={
              <Pencil className="h-10 w-10 md:h-12 md:w-12 landscape:h-8 landscape:w-8 md:landscape:h-14 md:landscape:w-14" />
            }
            label="ペン"
          />
          <ToolbarButton
            icon={
              <Eraser className="h-10 w-10 md:h-12 md:w-12 landscape:h-8 landscape:w-8 md:landscape:h-14 md:landscape:w-14" />
            }
            label="消しゴム"
          />
          <ToolbarButton
            icon={
              <Layers className="h-10 w-10 md:h-12 md:w-12 landscape:h-8 landscape:w-8 md:landscape:h-14 md:landscape:w-14" />
            }
            label="レイヤー"
          />
          <ToolbarButton
            icon={
              <Undo2 className="h-10 w-10 md:h-12 md:w-12 landscape:h-8 landscape:w-8 md:landscape:h-14 md:landscape:w-14" />
            }
            label="元に戻す"
          />
          <ToolbarButton
            icon={
              <PaintBucket className="h-10 w-10 md:h-12 md:w-12 landscape:h-8 landscape:w-8 md:landscape:h-14 md:landscape:w-14" />
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
      className="flex items-center justify-center rounded-xl p-3 text-black transition-all hover:bg-black/10 active:scale-90 md:p-4"
    >
      {icon}
    </button>
  );
}

export default App;
