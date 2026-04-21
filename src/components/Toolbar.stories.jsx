import Toolbar from "./Toolbar";

export default {
  title: "Components/Toolbar",
  component: Toolbar,
  parameters: {
    layout: "centered",
    backgrounds: { default: "canvas" },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "600px", display: "flex", alignItems: "stretch" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    toolMode: {
      control: "select",
      options: ["pencil", "eraser", "line", "rect", "circle"],
    },
    onSelectTool: { action: "selectTool" },
    onShare: { action: "share" },
  },
};

// Collapsed: ペンアイコンのみ（サブメニュー非表示）
export const Collapsed = {
  args: {
    toolMode: "pencil",
    isUploading: false,
    initialSubMenuOpen: false,
  },
};

// Expanded: サブメニュー展開（直線・四角形・円形が表示）
export const Expanded = {
  args: {
    toolMode: "pencil",
    isUploading: false,
    initialSubMenuOpen: true,
  },
};

// ExpandedWithActive: 四角形が選択中の展開状態
export const ExpandedWithActive = {
  args: {
    toolMode: "rect",
    isUploading: false,
    initialSubMenuOpen: true,
  },
};
