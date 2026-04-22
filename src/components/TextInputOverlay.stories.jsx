import TextInputOverlay from "./TextInputOverlay";

export default {
  title: "Components/TextInputOverlay",
  component: TextInputOverlay,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onSubmit: { action: "submitted" },
    onCancel: { action: "cancelled" },
  },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", width: "100%", height: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

export const Default = {
  args: {
    position: { x: 100, y: 100 },
  },
};

export const InputFocus = {
  args: {
    position: { x: 100, y: 100 },
  },
};

export const Overflow = {
  args: {
    position: { x: 100, y: 100 },
    defaultValue:
      "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんアイウエオカキクケコサシスセソ",
  },
};

export const DarkBackground = {
  args: {
    position: { x: 100, y: 100 },
  },
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#333333" }],
    },
  },
};
