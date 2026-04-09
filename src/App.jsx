import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Pencil,
  Eraser,
  Layers,
  Undo2,
  PaintBucket,
  Share2,
  Copy,
  X,
} from "lucide-react";

const TOOL_CONFIG = {
  pencil: { size: 16, composite: "source-over", strokeStyle: "#111827" },
  eraser: { size: 60, composite: "destination-out" },
};

async function uploadImage(blob) {
  const filename = `aimag-${Date.now()}.png`;

  const uploadToFileIo = async () => {
    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("expires", "3d");
    const response = await fetch("https://file.io", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok || !data?.success || !data?.link) {
      throw new Error(data?.message || "file.io upload failed");
    }
    return {
      url: data.link,
      expiresAt: data.expiry || data.expires || null,
      provider: "file.io",
    };
  };

  const uploadToTmpFiles = async () => {
    const formData = new FormData();
    formData.append("file", blob, filename);
    const response = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    const rawUrl = data?.data?.url;
    if (!response.ok || data?.status !== "success" || !rawUrl) {
      throw new Error("tmpfiles upload failed");
    }
    const url = rawUrl.replace(
      "https://tmpfiles.org/",
      "https://tmpfiles.org/dl/",
    );
    return {
      url,
      expiresAt: null,
      provider: "tmpfiles.org",
    };
  };

  const errors = [];
  for (const uploader of [uploadToFileIo, uploadToTmpFiles]) {
    try {
      const result = await uploader();
      console.log("[share] upload success", result);
      return result;
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "unknown upload error",
      );
    }
  }
  throw new Error(
    `画像アップロードに失敗しました。ネットワーク設定またはCORSを確認してください。(${errors.join(" / ")})`,
  );
}

function App() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const [toolMode, setToolMode] = useState("pencil");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isPointerInCanvas, setIsPointerInCanvas] = useState(false);
  const [cursorScale, setCursorScale] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [sharedUrl, setSharedUrl] = useState("");
  const [shareError, setShareError] = useState("");
  const [shareInfo, setShareInfo] = useState(null);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const canUseNativeShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  // 初回マウント時にキャンバスを初期化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    ctxRef.current = context;

    // 修正ポイント: 3000x2000 (3:2) ではなく、16:9 の比率にする
    // 例: 横3200px なら 縦は 1800px
    if (canvas.width !== 3200) {
      canvas.width = 3200;
      canvas.height = 1800;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // 座標とスケーリングの計算
  const updateCursorPosition = useCallback((event) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (rect && canvas) {
      const nextScale = rect.width / canvas.width;
      // 極端な精度の差がない限りステート更新を抑える（CI/パフォーマンス対策）
      setCursorScale((prev) =>
        Math.abs(prev - nextScale) < 0.001 ? prev : nextScale,
      );
      setCursorPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  }, []);

  const getPointFromEvent = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }, []);

  const applyToolToContext = useCallback(
    (context) => {
      const tool = TOOL_CONFIG[toolMode] ?? TOOL_CONFIG.pencil;
      context.globalCompositeOperation = tool.composite;
      context.lineWidth = tool.size;
      if (tool.strokeStyle) context.strokeStyle = tool.strokeStyle;
    },
    [toolMode],
  );

  // 描画アクション
  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const context = ctxRef.current;
    if (!context || !canvas) return;

    canvas.setPointerCapture(event.pointerId);
    applyToolToContext(context);
    isDrawingRef.current = true;
    const point = getPointFromEvent(event);
    lastPointRef.current = point;

    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const draw = (event) => {
    const context = ctxRef.current;
    if (!context || !isDrawingRef.current) return;
    const point = getPointFromEvent(event);
    const lastPoint = lastPointRef.current;

    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPointRef.current = point;
  };

  const stopDrawing = (event) => {
    if (canvasRef.current && event.pointerId !== undefined) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
    isDrawingRef.current = false;
  };

  const shareViaSystem = useCallback(
    async (url, source = "manual") => {
      if (!canUseNativeShare || !url) return false;

      try {
        await navigator.share({
          title: "Aimagで描いた絵",
          text: `Aimagで描いた絵 ${url}`,
          url,
        });
        console.log("[share] native share success", { source, url });
        return true;
      } catch (error) {
        console.log("[share] native share skipped or failed", {
          source,
          error,
        });
        return false;
      }
    },
    [canUseNativeShare],
  );

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || isUploading) return;

    setShareError("");
    setSharedUrl("");
    setShareInfo(null);
    setIsSharePanelOpen(false);
    setIsUploading(true);
    let uploadCompleted = false;

    try {
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((nextBlob) => {
          if (!nextBlob) {
            reject(new Error("キャンバス画像の変換に失敗しました。"));
            return;
          }
          resolve(nextBlob);
        }, "image/png");
      });

      const sharePayload = await uploadImage(blob);
      // アップロード完了後は即時にローディング解除する
      setIsUploading(false);
      uploadCompleted = true;
      setSharedUrl(sharePayload.url);
      setShareInfo({
        mode: "link",
        createdAt: new Date().toISOString(),
        expiresAt: sharePayload.expiresAt,
      });
      setIsSharePanelOpen(true);
      await shareViaSystem(sharePayload.url, "auto-after-upload");
      console.log("[share] upload success", {
        url: sharePayload.url,
        provider: sharePayload.provider,
      });
    } catch (error) {
      console.log("[share] upload failed", { error });
      const message =
        error instanceof Error ? error.message : "不明なエラーが発生しました。";
      setShareError(message);
      setIsSharePanelOpen(true);
    } finally {
      if (!uploadCompleted) {
        setIsUploading(false);
      }
    }
  }, [isUploading, shareViaSystem]);

  const handleCopyUrl = useCallback(async () => {
    if (!sharedUrl) return;
    try {
      await navigator.clipboard.writeText(sharedUrl);
      console.log("[share] copied url", { url: sharedUrl });
    } catch (error) {
      console.log("[share] copy failed", { error });
    }
  }, [sharedUrl]);

  const handleSlackShare = useCallback(async () => {
    if (!sharedUrl) return;
    const shared = await shareViaSystem(sharedUrl, "slack-button");
    if (!shared) {
      window.open(
        `https://slack.com/share?text=${encodeURIComponent(`Aimagで描いた絵 ${sharedUrl}`)}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  }, [shareViaSystem, sharedUrl]);

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#E5E5E5] md:flex-row landscape:flex-row">
      <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#777777] p-2 sm:p-6">
        {/* 修正ポイント: 縦横問わず aspect-video (16:9) を指定し、親要素からはみ出さないように設定 */}
        <div
          ref={containerRef}
          className="relative aspect-video max-w-full max-h-full bg-white shadow-2xl"
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full cursor-none touch-none bg-white"
            onPointerDown={startDrawing}
            onPointerMove={(e) => {
              updateCursorPosition(e);
              draw(e);
            }}
            onPointerUp={stopDrawing}
            onPointerEnter={(e) => {
              setIsPointerInCanvas(true);
              updateCursorPosition(e);
            }}
            onPointerLeave={() => setIsPointerInCanvas(false)}
            onPointerCancel={stopDrawing}
          />

          {/* カーソル表示 */}
          {isPointerInCanvas && (
            <div
              className="pointer-events-none absolute rounded-full border-2 border-black/40 bg-white/20 mix-blend-difference"
              style={{
                width: `${TOOL_CONFIG[toolMode].size * cursorScale}px`,
                height: `${TOOL_CONFIG[toolMode].size * cursorScale}px`,
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </div>
      </main>

      {isUploading && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/35">
          <div className="rounded-xl bg-white px-6 py-4 text-base font-semibold text-[#111827] shadow-xl">
            共有URLを発行中...
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-center bg-[#D1D1D1] h-24 w-full px-2 py-1 landscape:h-full landscape:w-28 landscape:px-2 md:h-full md:w-32 md:px-4">
        <div className="flex h-full w-full max-w-md items-center justify-around rounded-3xl bg-[#00FFAB] p-2 shadow-xl landscape:h-[90vh] landscape:flex-col landscape:justify-evenly md:h-[85vh] md:flex-col md:justify-evenly">
          <ToolbarButton
            icon={<Pencil />}
            onClick={() => setToolMode("pencil")}
            isActive={toolMode === "pencil"}
          />
          <ToolbarButton
            icon={<Eraser />}
            onClick={() => setToolMode("eraser")}
            isActive={toolMode === "eraser"}
          />
          <ToolbarButton icon={<Layers />} onClick={() => {}} />
          <ToolbarButton icon={<Undo2 />} onClick={() => {}} />
          <ToolbarButton icon={<PaintBucket />} onClick={() => {}} />
          <ToolbarButton
            icon={<Share2 />}
            onClick={handleShare}
            disabled={isUploading}
          />
        </div>
      </div>

      {(sharedUrl || shareError) && isSharePanelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 landscape:items-end md:items-center"
          onClick={() => setIsSharePanelOpen(false)}
        >
          <div
            className="w-[min(92vw,560px)] rounded-2xl bg-white/95 p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#111827]">共有結果</p>
              <button
                type="button"
                onClick={() => setIsSharePanelOpen(false)}
                className="rounded-md p-1 text-[#111827] hover:bg-black/10"
                aria-label="共有結果を閉じる"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {sharedUrl && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#111827]">
                  共有URL：{sharedUrl}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={sharedUrl}
                    className="min-w-0 flex-1 rounded-md border border-black/20 bg-white px-3 py-2 text-xs text-[#111827]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1 rounded-md bg-[#111827] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1f2937]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    URLをコピー
                  </button>
                </div>
                <p className="text-xs text-[#374151]">
                  このURLをコピーしてSlackやLINEに貼り付けてください。
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(sharedUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-[#06c755] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                  >
                    LINEで共有
                  </a>
                  {canUseNativeShare ? (
                    <button
                      type="button"
                      onClick={handleSlackShare}
                      className="rounded-md bg-[#4a154b] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Slackで共有
                    </button>
                  ) : (
                    <a
                      href={`https://slack.com/share?text=${encodeURIComponent(`Aimagで描いた絵 ${sharedUrl}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md bg-[#4a154b] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Slackで共有
                    </a>
                  )}
                </div>
              </div>
            )}
            {shareError && (
              <p className="text-xs font-medium text-red-600">{shareError}</p>
            )}
            {shareInfo && (
              <div className="mt-2 space-y-1 text-[11px] text-[#374151]">
                <p>
                  共有方式: {shareInfo.mode === "link" ? "一時URL" : "端末共有"}
                </p>
                <p>
                  共有時刻: {new Date(shareInfo.createdAt).toLocaleString()}
                </p>
                <p>
                  有効期限:{" "}
                  {shareInfo.expiresAt
                    ? new Date(shareInfo.expiresAt).toLocaleString()
                    : "URL共有なし（受信側アプリ管理）"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
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
      className={`flex items-center justify-center transition-all active:scale-95 h-12 w-12 rounded-xl landscape:h-[12vh] landscape:max-h-[56px] landscape:w-14 md:h-16 md:w-16 md:rounded-2xl
        ${
          isActive
            ? "bg-black/35 shadow-lg scale-110 ring-2 ring-black/10"
            : "hover:bg-black/10"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      {React.cloneElement(icon, {
        className: "h-6 w-6 md:h-8 md:w-8 landscape:h-[45%] landscape:w-auto",
        strokeWidth: 2.5,
      })}
    </button>
  );
}

export default App;
