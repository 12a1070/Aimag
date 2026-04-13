import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TOOL_CONFIG } from "../constants/toolConfig";

export function useDrawing() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const lastMidPointRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const [toolMode, setToolMode] = useState("pencil");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isPointerInCanvas, setIsPointerInCanvas] = useState(false);
  const [cursorScale, setCursorScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    ctxRef.current = context;

    if (canvas.width !== 1618 || canvas.height !== 1000) {
      canvas.width = 1618;
      canvas.height = 1000;
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
      lastMidPointRef.current = point;

      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    },
    [applyToolToContext, getPointFromEvent],
  );

  const onPointerMove = useCallback(
    (event) => {
      const context = ctxRef.current;

      if (context && isDrawingRef.current) {
        const events = event.getCoalescedEvents?.() ?? [event];
        for (const e of events) {
          const point = getPointFromEvent(e);
          const lastPoint = lastPointRef.current;
          const midPoint = {
            x: (lastPoint.x + point.x) / 2,
            y: (lastPoint.y + point.y) / 2,
          };
          context.beginPath();
          context.moveTo(lastMidPointRef.current.x, lastMidPointRef.current.y);
          context.quadraticCurveTo(lastPoint.x, lastPoint.y, midPoint.x, midPoint.y);
          context.stroke();
          lastMidPointRef.current = midPoint;
          lastPointRef.current = point;
        }
      }

      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateCursorPosition(event);
      });
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
