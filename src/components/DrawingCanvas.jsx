import React from "react";

const DrawingCanvas = React.memo(function DrawingCanvas({
  canvasRef,
  canvasHandlers,
  isPointerInCanvas,
  cursorPos,
  cursorScale,
  brushSize,
}) {
  return (
    <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#777777] p-2 sm:p-6">
      <div className="relative aspect-video max-h-full max-w-full bg-white shadow-2xl">
        <canvas
          ref={canvasRef}
          className="block h-full w-full cursor-none touch-none bg-white"
          {...canvasHandlers}
        />
        {isPointerInCanvas && (
          <div
            className="pointer-events-none absolute rounded-full border-2 border-black/60 bg-gray-400/30"
            style={{
              width: `${brushSize * cursorScale}px`,
              height: `${brushSize * cursorScale}px`,
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </div>
    </main>
  );
});

export default DrawingCanvas;
