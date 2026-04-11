import React from "react";
import { Copy, X } from "lucide-react";

const SharePanel = React.memo(function SharePanel({
  sharedUrl,
  shareError,
  shareInfo,
  isOpen,
  onClose,
  onCopyUrl,
  onSlackShare,
  lineShareUrl,
}) {
  if (!(sharedUrl || shareError) || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 landscape:items-end md:items-center"
      onClick={onClose}
    >
      <div
        className="w-[min(92vw,560px)] rounded-2xl bg-white/95 p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#111827]">共有結果</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[#111827] hover:bg-black/10"
            aria-label="共有結果を閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sharedUrl && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#111827]">共有URL：{sharedUrl}</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={sharedUrl}
                className="min-w-0 flex-1 rounded-md border border-black/20 bg-white px-3 py-2 text-xs text-[#111827]"
              />
              <button
                type="button"
                onClick={onCopyUrl}
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
                href={lineShareUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-[#06c755] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                LINEで共有
              </a>
              <button
                type="button"
                onClick={onSlackShare}
                className="rounded-md bg-[#4a154b] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                Slackで共有
              </button>
            </div>
          </div>
        )}

        {shareError && <p className="text-xs font-medium text-red-600">{shareError}</p>}

        {shareInfo && (
          <div className="mt-2 space-y-1 text-[11px] text-[#374151]">
            <p>共有方式: {shareInfo.mode === "link" ? "一時URL" : "端末共有"}</p>
            <p>共有時刻: {new Date(shareInfo.createdAt).toLocaleString()}</p>
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
  );
});

export default SharePanel;
