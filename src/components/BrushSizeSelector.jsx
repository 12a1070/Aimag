import React, { useEffect, useState } from "react";

const PRESETS = [2, 5, 10, 20];
const MIN_SIZE = 1;
const MAX_SIZE = 500;
const MAX_PREVIEW_PX = 120;

const BrushSizeSelector = React.memo(function BrushSizeSelector({
  size,
  onSizeChange,
  toolMode = "pencil",
}) {
  const [inputValue, setInputValue] = useState(String(size));

  useEffect(() => {
    setInputValue(String(size));
  }, [size]);

  const commit = (raw) => {
    const n = parseInt(raw, 10);
    const clamped = isNaN(n) ? MIN_SIZE : Math.min(MAX_SIZE, Math.max(MIN_SIZE, n));
    setInputValue(String(clamped));
    onSizeChange(clamped);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    const n = parseInt(e.target.value, 10);
    if (!isNaN(n) && n >= MIN_SIZE && n <= MAX_SIZE) {
      onSizeChange(n);
    }
  };

  const previewDiameter = Math.max(2, Math.min(MAX_PREVIEW_PX, size));
  const isEraser = toolMode === "eraser";
  const isText = toolMode === "text";

  return (
    <div className="flex flex-row items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm landscape:flex-col landscape:px-3 landscape:py-4 md:flex-col md:px-3 md:py-4">
      {/* プリセットボタン: スマホ=横並び / PC=縦並び */}
      <div className="flex flex-row gap-1.5 landscape:flex-col md:flex-col">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onSizeChange(p)}
            className={`h-8 w-10 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              size === p
                ? "scale-105 bg-[#00FFAB] text-black shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 区切り: スマホ=縦線 / PC=横線 */}
      <div className="h-8 w-px shrink-0 bg-gray-200 landscape:h-px landscape:w-full md:h-px md:w-full" />

      <div className="flex items-center gap-1">
        <input
          type="number"
          min={MIN_SIZE}
          max={MAX_SIZE}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit(inputValue)}
          className="w-14 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-center text-sm font-medium focus:border-black focus:outline-none"
        />
        <span className="text-xs text-gray-400">px</span>
      </div>

      {/* 区切り: スマホ=縦線 / PC=横線 */}
      <div className="h-8 w-px shrink-0 bg-gray-200 landscape:h-px landscape:w-full md:h-px md:w-full" />

      <div className="flex h-[7.5rem] w-[7.5rem] shrink-0 items-center justify-center rounded-xl bg-gray-100">
        {isText ? (
          <span
            className="select-none font-bold leading-none text-gray-800"
            style={{ fontSize: Math.min(previewDiameter, 80) }}
          >
            A
          </span>
        ) : (
          <div
            className={`rounded-full transition-all ${
              isEraser ? "border-2 border-gray-300 bg-white" : "bg-gray-800"
            }`}
            style={{ width: previewDiameter, height: previewDiameter }}
          />
        )}
      </div>
    </div>
  );
});

export default BrushSizeSelector;
