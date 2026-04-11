import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TOOL_CONFIG } from "../constants/toolConfig";

export function useDrawing() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const [toolMode, setToolMode] = useState("pencil");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isPointerInCanvas, setIsPointerInCanvas] = useState(false);
  const [cursorScale, setCursorScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    ctxRef.current = context;

    if (canvas.width !== 3200 || canvas.height !== 1800) {
      canvas.width = 3200;
      canvas.height = 1800;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const getPointFromEvent = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }, []);

  const updateCursorPosition = useCallback((event) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !canvas) return;

    const nextScale = rect.width / canvas.width;
    setCursorScale((prev) => (Math.abs(prev - nextScale) < 0.001 ? prev : nextScale));
    setCursorPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, []);

  const applyToolToContext = useCallback(
    (context) => {
      const tool = TOOL_CONFIG[toolMode] ?? TOOL_CONFIG.pencil;
      context.globalCompositeOperation = tool.composite;
      context.lineWidth = tool.size;
      if (tool.strokeStyle) context.strokeStyle = tool.strokeStyle;
    },
    [toolMode],
  );

  const onPointerDown = useCallback(
    (event) => {
      const canvas = canvasRef.current;
      const context = ctxRef.current;
      if (!canvas || !context) return;

      canvas.setPointerCapture(event.pointerId);
      applyToolToContext(context);
      isDrawingRef.current = true;

      const point = getPointFromEvent(event);
      lastPointRef.current = point;

      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    },
    [applyToolToContext, getPointFromEvent],
  );

  const onPointerMove = useCallback(
    (event) => {
      updateCursorPosition(event);
      const context = ctxRef.current;
      if (!context || !isDrawingRef.current) return;

      const point = getPointFromEvent(event);
      const lastPoint = lastPointRef.current;
      context.beginPath();
      context.moveTo(lastPoint.x, lastPoint.y);
      context.lineTo(point.x, point.y);
      context.stroke();
      lastPointRef.current = point;
    },
    [getPointFromEvent, updateCursorPosition],
  );

  const onPointerUp = useCallback((event) => {
    if (canvasRef.current && event.pointerId !== undefined) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
    isDrawingRef.current = false;
  }, []);

  const onPointerEnter = useCallback(
    (event) => {
      setIsPointerInCanvas(true);
      updateCursorPosition(event);
    },
    [updateCursorPosition],
  );

  const onPointerLeave = useCallback(() => {
    setIsPointerInCanvas(false);
  }, []);

  const canvasHandlers = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerEnter,
      onPointerLeave,
      onPointerCancel: onPointerUp,
    }),
    [onPointerDown, onPointerMove, onPointerUp, onPointerEnter, onPointerLeave],
  );

  return {
    canvasRef,
    toolMode,
    setToolMode,
    cursorPos,
    cursorScale,
    isPointerInCanvas,
    brushSize: (TOOL_CONFIG[toolMode] ?? TOOL_CONFIG.pencil).size,
    canvasHandlers,
  };
}
