import DrawingCanvas from "./components/DrawingCanvas";
import SharePanel from "./components/SharePanel";
import Toolbar from "./components/Toolbar";
import UploadOverlay from "./components/UploadOverlay";
import { useDrawing } from "./hooks/useDrawing";
import { useShare } from "./hooks/useShare";

function App() {
  const drawing = useDrawing();
  const share = useShare(drawing.canvasRef);

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] md:flex-row landscape:flex-row">
      <DrawingCanvas
        canvasRef={drawing.canvasRef}
        canvasHandlers={drawing.canvasHandlers}
        isPointerInCanvas={drawing.isPointerInCanvas}
        cursorPos={drawing.cursorPos}
        cursorScale={drawing.cursorScale}
        brushSize={drawing.brushSize}
      />
      <Toolbar
        toolMode={drawing.toolMode}
        onSelectTool={drawing.setToolMode}
        onShare={share.handleShare}
        isUploading={share.isUploading}
      />
      <UploadOverlay isUploading={share.isUploading} />
      <SharePanel
        sharedUrl={share.sharedUrl}
        shareError={share.shareError}
        shareInfo={share.shareInfo}
        isOpen={share.isSharePanelOpen}
        onClose={() => share.setIsSharePanelOpen(false)}
        onCopyUrl={share.handleCopyUrl}
        onSlackShare={share.handleSlackShare}
        lineShareUrl={share.lineShareUrl}
      />
    </div>
  );
}

export default App;
