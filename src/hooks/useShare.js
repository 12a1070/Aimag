import { useCallback, useMemo, useState } from "react";
import { uploadImage } from "../services/uploadService";

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("キャンバス画像の変換に失敗しました。"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

/** 消しゴムで透明になったピクセルを共有時は白に見せる（オフスクリーンで白背景と合成） */
function canvasToBlobWithWhiteBackground(sourceCanvas) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const composite = document.createElement("canvas");
  composite.width = width;
  composite.height = height;
  const ctx = composite.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(sourceCanvas, 0, 0);
  return canvasToBlob(composite);
}

export function useShare(canvasRef) {
  const [isUploading, setIsUploading] = useState(false);
  const [sharedUrl, setSharedUrl] = useState("");
  const [shareError, setShareError] = useState("");
  const [shareInfo, setShareInfo] = useState(null);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);

  const canUseNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const lineShareUrl = useMemo(
    () =>
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(sharedUrl)}`,
    [sharedUrl],
  );

  const slackShareUrl = useMemo(
    () =>
      `https://slack.com/share?url=${encodeURIComponent(sharedUrl)}&text=${encodeURIComponent("Aimagで描いた絵")}`,
    [sharedUrl],
  );

  const shareViaSystem = useCallback(
    async (url) => {
      if (!canUseNativeShare || !url) return false;
      try {
        await navigator.share({
          title: "Aimagで描いた絵",
          text: `Aimagで描いた絵 ${url}`,
          url,
        });
        return true;
      } catch {
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
      const blob = await canvasToBlobWithWhiteBackground(canvas);
      const payload = await uploadImage(blob);
      uploadCompleted = true;
      setIsUploading(false);
      setSharedUrl(payload.url);
      setShareInfo({
        mode: "link",
        createdAt: new Date().toISOString(),
        expiresAt: payload.expiresAt,
      });
      setIsSharePanelOpen(true);
      if (canUseNativeShare) {
        await shareViaSystem(payload.url);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "不明なエラーが発生しました。";
      setShareError(message);
      setIsSharePanelOpen(true);
    } finally {
      if (!uploadCompleted) setIsUploading(false);
    }
  }, [canvasRef, canUseNativeShare, isUploading, shareViaSystem]);

  const handleCopyUrl = useCallback(async () => {
    if (!sharedUrl) return;
    try {
      await navigator.clipboard.writeText(sharedUrl);
    } catch {
      // no-op: clipboard permission may be denied
    }
  }, [sharedUrl]);

  const handleSlackShare = useCallback(() => {
    if (!sharedUrl) return;
    window.open(slackShareUrl, "_blank", "noopener,noreferrer");
  }, [sharedUrl, slackShareUrl]);

  return {
    isUploading,
    sharedUrl,
    shareError,
    shareInfo,
    isSharePanelOpen,
    setIsSharePanelOpen,
    lineShareUrl,
    canUseNativeShare,
    handleShare,
    handleCopyUrl,
    handleSlackShare,
  };
}
