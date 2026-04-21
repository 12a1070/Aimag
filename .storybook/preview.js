import "../src/index.css";

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#D1D1D1" },
        { name: "dark", value: "#333333" },
        { name: "white", value: "#ffffff" },
      ],
    },
  },
};

export default preview;
