export const TOOL_CONFIG = {
  pencil: { size: 16, composite: "source-over", strokeStyle: "#111827" },
  eraser: { size: 60, composite: "destination-out" },
  line:   { size: 4,  composite: "source-over", strokeStyle: "#111827" },
  rect:   { size: 4,  composite: "source-over", strokeStyle: "#111827" },
  circle: { size: 4,  composite: "source-over", strokeStyle: "#111827" },
};

export const SHAPE_TOOLS = new Set(["line", "rect", "circle"]);
export const PENCIL_GROUP = new Set(["pencil", "line", "rect", "circle"]);
