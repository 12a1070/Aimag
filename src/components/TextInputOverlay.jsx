import React, { useState } from "react";

const TextInputOverlay = React.memo(function TextInputOverlay({
  position,
  onSubmit,
  onCancel,
  defaultValue = "",
}) {
  const [text, setText] = useState(defaultValue);

  const handleKeyDown = (e) => {
    if (e.isComposing) return;
    if (e.key === "Escape") {
      onCancel();
    } else if (e.key === "Enter" && (e.shiftKey || e.metaKey)) {
      onSubmit(text);
    }
  };

  return (
    <div style={{ position: "fixed", left: position.x, top: position.y }} className="rounded-2xl bg-white p-3 shadow-lg">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[40px] min-w-[200px] rounded-xl border-2 border-gray-400 bg-white px-3 py-2 text-base focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onCancel()}
          className="rounded-xl bg-gray-100 px-4 py-1.5 text-sm text-gray-600"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={() => onSubmit(text)}
          className="rounded-xl bg-[#00FFAB] px-4 py-1.5 text-sm font-semibold text-black"
        >
          ✓ 確定
        </button>
      </div>
    </div>
  );
});

export default TextInputOverlay;
