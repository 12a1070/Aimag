import { useRef } from "react";
import DrawingCanvas from "./DrawingCanvas";

export default {
  title: "Components/DrawingCanvas",
  component: DrawingCanvas,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    brushSize: { control: { type: "range", min: 1, max: 200, step: 1 } },
    cursorScale: { control: { type: "range", min: 0.1, max: 2, step: 0.05 } },
    isPointerInCanvas: { control: "boolean" },
  },
};

const Template = (args) => {
  const canvasRef = useRef(null);
  return <DrawingCanvas {...args} canvasRef={canvasRef} canvasHandlers={{}} />;
};

// カーソル非表示（マウスがキャンバス外にある状態）
export const Default = {
  render: Template,
  args: {
    isPointerInCanvas: false,
    cursorPos: { x: 0, y: 0 },
    cursorScale: 1,
    brushSize: 20,
  },
};

// 標準カーソル（20px、キャンバス中央付近）
export const WithCursor = {
  render: Template,
  args: {
    isPointerInCanvas: true,
    cursorPos: { x: 300, y: 180 },
    cursorScale: 1,
    brushSize: 20,
  },
};

// 極小カーソル（1px）: 視認できるか確認
export const CursorSmall = {
  render: Template,
  args: {
    isPointerInCanvas: true,
    cursorPos: { x: 300, y: 180 },
    cursorScale: 1,
    brushSize: 1,
  },
};

// 極大カーソル（200px）: キャンバスからはみ出さないか確認
export const CursorLarge = {
  render: Template,
  args: {
    isPointerInCanvas: true,
    cursorPos: { x: 300, y: 180 },
    cursorScale: 1,
    brushSize: 200,
  },
};

// スケール縮小（高解像度ディスプレイ相当）: brushSize × cursorScale の表示サイズ確認
export const ScaledDown = {
  render: Template,
  args: {
    isPointerInCanvas: true,
    cursorPos: { x: 300, y: 180 },
    cursorScale: 0.3,
    brushSize: 60,
  },
};
