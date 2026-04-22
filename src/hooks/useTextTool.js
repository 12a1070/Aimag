import { useCallback, useMemo, useState } from "react";

export function useTextTool({ canvasRef, toolMode, canvasHandlers }) {
  const [textOverlay, setTextOverlay] = useState(null);

  const isText = toolMode === "text";

  const handleSubmit = useCallback(
    (text) => {
      if (!text.trim() || !textOverlay) {
        setTextOverlay(null);
        return;
      }
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (textOverlay.x - rect.left) * (canvas.width / rect.width);
      const y = (textOverlay.y - rect.top) * (canvas.height / rect.height);

      const fontSize = 24;
      const lineHeight = fontSize * 1.4;
      ctx.globalCompositeOperation = "source-over";
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = "#111827";
      text.split("\n").forEach((line, i) => {
        ctx.fillText(line, x, y + i * lineHeight);
      });

      setTextOverlay(null);
    },
    [canvasRef, textOverlay],
  );

  const handleCancel = useCallback(() => {
    setTextOverlay(null);
  }, []);

  const wrappedCanvasHandlers = useMemo(() => {
    if (!isText) return canvasHandlers;
    return {
      ...canvasHandlers,
      onPointerDown: (e) => {
        setTextOverlay({ x: e.clientX, y: e.clientY });
      },
    };
  }, [canvasHandlers, isText]);

  return { textOverlay, handleSubmit, handleCancel, wrappedCanvasHandlers };
}
