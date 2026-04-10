import React from "react";

const UploadOverlay = React.memo(function UploadOverlay({ isUploading }) {
  if (!isUploading) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/35">
      <div className="rounded-xl bg-white px-6 py-4 text-base font-semibold text-[#111827] shadow-xl">
        共有URLを発行中...
      </div>
    </div>
  );
});

export default UploadOverlay;
