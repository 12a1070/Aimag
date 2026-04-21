import { useArgs } from "storybook/preview-api";
import BrushSizeSelector from "./BrushSizeSelector";

export default {
  title: "Components/BrushSizeSelector",
  component: BrushSizeSelector,
  parameters: {
    layout: "centered",
    backgrounds: { default: "canvas" },
  },
  argTypes: {
    size: { control: { type: "range", min: 1, max: 500, step: 1 } },
    toolMode: { control: "radio", options: ["pencil", "eraser"] },
    onSizeChange: { action: "sizeChanged" },
  },
};

// Default: 初期サイズ（5px）での表示
export const Default = {
  args: {
    size: 5,
    toolMode: "pencil",
  },
};

// DynamicSize: Controls で 1px〜500px 変更時に円が伸縮すること
export const DynamicSize = {
  render: (args) => {
    const [, updateArgs] = useArgs();
    return (
      <BrushSizeSelector
        {...args}
        onSizeChange={(s) => {
          updateArgs({ size: s });
          args.onSizeChange?.(s);
        }}
      />
    );
  },
  args: {
    size: 30,
    toolMode: "pencil",
  },
};

// ActiveState: プリセット選択時に強調表示されること
export const ActiveState = {
  render: (args) => {
    const [, updateArgs] = useArgs();
    return (
      <BrushSizeSelector
        {...args}
        onSizeChange={(s) => {
          updateArgs({ size: s });
          args.onSizeChange?.(s);
        }}
      />
    );
  },
  args: {
    size: 10,
    toolMode: "pencil",
  },
  parameters: {
    docs: {
      description: {
        story: "プリセットボタン（10px）が強調表示された状態。別のプリセットを押すと強調が移動する。",
      },
    },
  },
};

// Eraser: 消しゴムモードでの表示（白抜き円）
export const Eraser = {
  render: (args) => {
    const [, updateArgs] = useArgs();
    return (
      <BrushSizeSelector
        {...args}
        onSizeChange={(s) => {
          updateArgs({ size: s });
          args.onSizeChange?.(s);
        }}
      />
    );
  },
  args: {
    size: 60,
    toolMode: "eraser",
  },
};
