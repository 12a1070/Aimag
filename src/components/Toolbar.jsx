import React, { useEffect, useState } from "react";
import { Circle, Eraser, Layers, Minus, PaintBucket, Pencil, Share2, Square, Undo2 } from "lucide-react";
import { PENCIL_GROUP } from "../constants/toolConfig";
import ToolbarButton from "./ToolbarButton";

function SubMenuButton({ icon, onClick, isActive }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95 ${
        isActive ? "scale-110 bg-[#00FFAB] shadow-md" : "hover:bg-black/10"
      }`}
    >
      {React.cloneElement(icon, { className: "h-5 w-5", strokeWidth: 2 })}
    </button>
  );
}

const Toolbar = React.memo(function Toolbar({
  toolMode,
  onSelectTool,
  onShare,
  isUploading,
  initialSubMenuOpen = false,
}) {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(initialSubMenuOpen);

  useEffect(() => {
    if (!PENCIL_GROUP.has(toolMode)) {
      setIsSubMenuOpen(false);
    }
  }, [toolMode]);

  const isPencilGroupActive = PENCIL_GROUP.has(toolMode);

  const handlePencilClick = () => {
    if (isPencilGroupActive) {
      setIsSubMenuOpen((prev) => !prev);
    } else {
      onSelectTool("pencil");
    }
  };

  const handleShapeSelect = (mode) => {
    onSelectTool(mode);
    setIsSubMenuOpen(false);
  };

  return (
    <aside className="relative flex h-24 w-full shrink-0 items-center justify-center bg-[#D1D1D1] px-2 py-1 landscape:h-full landscape:w-28 landscape:px-2 md:h-full md:w-32 md:px-4">

      {/* サブメニュー: overflow-hidden を突き抜けるため fixed で配置 */}
      {isSubMenuOpen && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 flex flex-row gap-1 rounded-2xl bg-white p-1.5 shadow-lg landscape:bottom-auto landscape:left-auto landscape:top-1/2 landscape:right-28 landscape:translate-x-0 landscape:-translate-y-1/2 landscape:flex-col md:bottom-auto md:left-auto md:top-1/2 md:right-32 md:translate-x-0 md:-translate-y-1/2 md:flex-col">
          <SubMenuButton
            icon={<Minus />}
            onClick={() => handleShapeSelect("line")}
            isActive={toolMode === "line"}
          />
          <SubMenuButton
            icon={<Square />}
            onClick={() => handleShapeSelect("rect")}
            isActive={toolMode === "rect"}
          />
          <SubMenuButton
            icon={<Circle />}
            onClick={() => handleShapeSelect("circle")}
            isActive={toolMode === "circle"}
          />
        </div>
      )}

      <div className="flex h-full w-full max-w-md items-center justify-around rounded-3xl bg-[#00FFAB] p-2 shadow-xl landscape:h-[90vh] landscape:flex-col landscape:justify-evenly md:h-[85vh] md:flex-col md:justify-evenly">
        <ToolbarButton
          icon={<Pencil />}
          onClick={handlePencilClick}
          isActive={isPencilGroupActive}
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
