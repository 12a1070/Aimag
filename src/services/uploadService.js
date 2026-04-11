async function uploadToFileIo(blob, filename) {
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
}

async function uploadToTmpFiles(blob, filename) {
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

  return {
    url: rawUrl.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/"),
    expiresAt: null,
    provider: "tmpfiles.org",
  };
}

export async function uploadImage(blob) {
  const filename = `aimag-${Date.now()}.png`;
  const errors = [];

  for (const uploader of [uploadToFileIo, uploadToTmpFiles]) {
    try {
      return await uploader(blob, filename);
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
