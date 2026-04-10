import React from "react";
import { Eraser, Layers, PaintBucket, Pencil, Share2, Undo2 } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

const Toolbar = React.memo(function Toolbar({
  toolMode,
  onSelectTool,
  onShare,
  isUploading,
}) {
  return (
    <aside className="flex h-24 w-full shrink-0 items-center justify-center bg-[#D1D1D1] px-2 py-1 landscape:h-full landscape:w-28 landscape:px-2 md:h-full md:w-32 md:px-4">
      <div className="flex h-full w-full max-w-md items-center justify-around rounded-3xl bg-[#00FFAB] p-2 shadow-xl landscape:h-[90vh] landscape:flex-col landscape:justify-evenly md:h-[85vh] md:flex-col md:justify-evenly">
        <ToolbarButton
          icon={<Pencil />}
          onClick={() => onSelectTool("pencil")}
          isActive={toolMode === "pencil"}
        />
        <ToolbarButton
          icon={<Eraser />}
          onClick={() => onSelectTool("eraser")}
          isActive={toolMode === "eraser"}
        />
        <ToolbarButton icon={<Layers />} onClick={() => {}} />
        <ToolbarButton icon={<Undo2 />} onClick={() => {}} />
        <ToolbarButton icon={<PaintBucket />} onClick={() => {}} />
        <ToolbarButton icon={<Share2 />} onClick={onShare} disabled={isUploading} />
      </div>
    </aside>
  );
});

export default Toolbar;
