import React from "react";

const ToolbarButton = React.memo(function ToolbarButton({
  icon,
  onClick = () => {},
  isActive = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all active:scale-95 landscape:h-[12vh] landscape:max-h-[56px] landscape:w-14 md:h-16 md:w-16 md:rounded-2xl ${
        isActive
          ? "scale-110 bg-black/35 shadow-lg ring-2 ring-black/10"
          : "hover:bg-black/10"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      {React.cloneElement(icon, {
        className: "h-6 w-6 landscape:h-[45%] landscape:w-auto md:h-8 md:w-8",
        strokeWidth: 2.5,
      })}
    </button>
  );
});

export default ToolbarButton;
