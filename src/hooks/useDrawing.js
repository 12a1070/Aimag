import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SHAPE_TOOLS, TOOL_CONFIG } from "../constants/toolConfig";

const INITIAL_SIZES = Object.fromEntries(
  Object.entries(TOOL_CONFIG).map(([k, v]) => [k, v.size]),
);

export function useDrawing() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const lastMidPointRef = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef(null);
  const startPointRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const [toolMode, setToolMode] = useState("pencil");
  const [toolSizes, setToolSizes] = useState(INITIAL_SIZES);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isPointerInCanvas, setIsPointerInCanvas] = useState(false);
  const [cursorScale, setCursorScale] = useState(1);

  const setBrushSize = useCallback(
    (size) => {
      setToolSizes((prev) => ({ ...prev, [toolMode]: size }));
    },
    [toolMode],
  );

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
      context.lineWidth = toolSizes[toolMode] ?? tool.size;
      if (tool.strokeStyle) context.strokeStyle = tool.strokeStyle;
    },
    [toolMode, toolSizes],
  );

  const drawShape = useCallback(
    (context, start, end) => {
      context.beginPath();
      if (toolMode === "line") {
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
      } else if (toolMode === "rect") {
        context.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (toolMode === "circle") {
        const rx = Math.abs(end.x - start.x) / 2;
        const ry = Math.abs(end.y - start.y) / 2;
        const cx = (start.x + end.x) / 2;
        const cy = (start.y + end.y) / 2;
        context.ellipse(cx, cy, Math.max(rx, 0.5), Math.max(ry, 0.5), 0, 0, Math.PI * 2);
        context.stroke();
      }
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

      if (SHAPE_TOOLS.has(toolMode)) {
        startPointRef.current = point;
        snapshotRef.current = context.getImageData(0, 0, canvas.width, canvas.height);
      } else {
        lastPointRef.current = point;
        lastMidPointRef.current = point;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(point.x, point.y);
        context.stroke();
      }
    },
    [applyToolToContext, getPointFromEvent, toolMode],
  );

  const onPointerMove = useCallback(
    (event) => {
      const context = ctxRef.current;

      if (context && isDrawingRef.current) {
        if (SHAPE_TOOLS.has(toolMode)) {
          const point = getPointFromEvent(event);
          if (snapshotRef.current) {
            context.putImageData(snapshotRef.current, 0, 0);
          }
          drawShape(context, startPointRef.current, point);
        } else {
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
      }

      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateCursorPosition(event);
      });
    },
    [drawShape, getPointFromEvent, toolMode, updateCursorPosition],
  );

  const onPointerUp = useCallback(
    (event) => {
      if (canvasRef.current && event.pointerId !== undefined) {
        canvasRef.current.releasePointerCapture(event.pointerId);
      }

      if (isDrawingRef.current && SHAPE_TOOLS.has(toolMode)) {
        const context = ctxRef.current;
        const canvas = canvasRef.current;
        if (context && canvas && snapshotRef.current) {
          context.putImageData(snapshotRef.current, 0, 0);
          snapshotRef.current = null;
          drawShape(context, startPointRef.current, getPointFromEvent(event));
        }
      }

      isDrawingRef.current = false;
    },
    [drawShape, getPointFromEvent, toolMode],
  );

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
    brushSize: toolSizes[toolMode] ?? (TOOL_CONFIG[toolMode] ?? TOOL_CONFIG.pencil).size,
    setBrushSize,
    canvasHandlers,
  };
}
