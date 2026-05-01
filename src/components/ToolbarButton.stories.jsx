import { Pencil, Eraser, Share2, Undo2 } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

export default {
  title: "Components/ToolbarButton",
  component: ToolbarButton,
  parameters: {
    layout: "centered",
    backgrounds: { default: "green" },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center rounded-3xl bg-[#00FFAB] p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onClick: { action: "clicked" },
    isActive: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export const Default = {
  args: {
    icon: <Pencil />,
    isActive: false,
    disabled: false,
  },
};

export const Active = {
  args: {
    icon: <Pencil />,
    isActive: true,
    disabled: false,
  },
};

export const Disabled = {
  args: {
    icon: <Share2 />,
    isActive: false,
    disabled: true,
  },
};

export const AllButtons = {
  render: () => (
    <div className="flex items-center justify-center gap-2 rounded-3xl bg-[#00FFAB] p-4">
      <ToolbarButton icon={<Pencil />} isActive={true} />
      <ToolbarButton icon={<Eraser />} />
      <ToolbarButton icon={<Undo2 />} />
      <ToolbarButton icon={<Share2 />} disabled={true} />
    </div>
  ),
};
