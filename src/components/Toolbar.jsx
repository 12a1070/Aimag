import React, { useState } from "react";
import { Circle, Eraser, Layers, Minus, PaintBucket, Pencil, Share2, Square, Type, Undo2 } from "lucide-react";
import { PENCIL_GROUP } from "../constants/toolConfig";
import ToolbarButton from "./ToolbarButton";

const PENCIL_GROUP_ICONS = {
  pencil: <Pencil />,
  line:   <Minus />,
  rect:   <Square />,
  circle: <Circle />,
};

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

  const isPencilGroupActive = PENCIL_GROUP.has(toolMode);
  const effectiveSubMenuOpen = isPencilGroupActive && isSubMenuOpen;

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
    <aside className="flex h-24 w-full shrink-0 items-center justify-center bg-[#D1D1D1] px-2 py-1 landscape:h-full landscape:w-28 landscape:px-2 md:h-full md:w-32 md:px-4">
      <div className="flex h-full w-full max-w-md items-center justify-around rounded-3xl bg-[#00FFAB] p-2 shadow-xl landscape:h-[90vh] landscape:flex-col landscape:justify-evenly md:h-[85vh] md:flex-col md:justify-evenly">

        {/* ペンボタン基点のサブメニュー */}
        <div className="relative">
          <ToolbarButton
            icon={PENCIL_GROUP_ICONS[toolMode] ?? <Pencil />}
            onClick={handlePencilClick}
            isActive={isPencilGroupActive}
          />
          {effectiveSubMenuOpen && (
            <div className="absolute bottom-full left-0 z-10 mb-1 flex flex-row gap-1 rounded-2xl bg-white p-1.5 shadow-lg landscape:bottom-auto landscape:left-auto landscape:right-full landscape:top-1/2 landscape:mb-0 landscape:mr-1 landscape:-translate-y-1/2 landscape:flex-col md:bottom-auto md:left-auto md:right-full md:top-1/2 md:mb-0 md:mr-1 md:-translate-y-1/2 md:flex-col">
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
        </div>

        <ToolbarButton
          icon={<Eraser />}
          onClick={() => onSelectTool("eraser")}
          isActive={toolMode === "eraser"}
        />
        <ToolbarButton
          icon={<Type />}
          onClick={() => onSelectTool("text")}
          isActive={toolMode === "text"}
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
