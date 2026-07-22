/**
 * =============================================================================
 * 【新手導讀】送出文章前：內文 base64 圖先上傳
 * =============================================================================
 * CKEditor 貼圖常變成 data:image;base64,...（超長）
 * 若整包 JSON 丟後端會 413 過大。
 * 流程：掃 HTML → 每張圖 uploadBlogImage → src 改成 /uploads/blog/xxx
 * 誰呼叫：BlogPostForm 儲存前
 * =============================================================================
 */
import { uploadBlogImage } from "./api";

const DATA_IMG_SRC =
  /src\s*=\s*(["'])(data:image\/[a-zA-Z0-9.+-]+;base64,[\s\S]*?)\1/gi;

function dataUrlToFile(dataUrl: string, index: number): File | null {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/i.exec(
    dataUrl.trim(),
  );
  if (!m) return null;

  const mime = m[1].toLowerCase();
  const b64 = m[2].replace(/\s/g, "");
  const ext =
    mime === "image/png"
      ? "png"
      : mime === "image/webp"
        ? "webp"
        : mime === "image/gif"
          ? "gif"
          : mime === "image/avif"
            ? "avif"
            : "jpg";

  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    if (bytes.length > 5 * 1024 * 1024) return null;
    return new File([bytes], `content-${index}.${ext}`, { type: mime });
  } catch {
    return null;
  }
}

/**
 * 將 HTML 中所有 data:image base64 上傳並替換成 /uploads/blog/...
 * 同一 dataUrl 只上傳一次。
 */
export async function persistContentImagesInHtml(
  html: string,
  onProgress?: (done: number, total: number) => void,
): Promise<string> {
  if (!html || !html.includes("data:image")) return html;

  const found: string[] = [];
  const re = new RegExp(DATA_IMG_SRC.source, DATA_IMG_SRC.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const dataUrl = m[2];
    if (dataUrl && !found.includes(dataUrl)) found.push(dataUrl);
  }

  if (found.length === 0) return html;

  const map = new Map<string, string>();
  let done = 0;
  for (let i = 0; i < found.length; i += 1) {
    const dataUrl = found[i];
    const file = dataUrlToFile(dataUrl, i);
    if (!file) {
      done += 1;
      onProgress?.(done, found.length);
      continue;
    }
    const path = await uploadBlogImage(file);
    map.set(dataUrl, path);
    done += 1;
    onProgress?.(done, found.length);
  }

  return html.replace(
    new RegExp(DATA_IMG_SRC.source, DATA_IMG_SRC.flags),
    (full, quote: string, dataUrl: string) => {
      const path = map.get(dataUrl);
      if (!path) return full;
      return `src=${quote}${path}${quote}`;
    },
  );
}
