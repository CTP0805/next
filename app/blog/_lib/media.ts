/**
 * =============================================================================
 * 【新手導讀】Blog 圖片網址怎麼拼
 * =============================================================================
 * DB 常存：/uploads/blog/xxx.jpg（相對路徑）
 * 瀏覽器要開圖：要接到 Express 網域 → http://localhost:3001/uploads/...
 * 本檔：resolveBlogMediaUrl、rewriteBlogContentMedia
 * =============================================================================
 */
import { getApiServer } from "@/config/api-path";

/** 專案實際檔名為 carousel1.jpeg（不是 .jpg） */
const PLACEHOLDER = "/images/carousel1.jpeg";

function apiBase(): string {
  return getApiServer();
}

/**
 * seed / 舊資料常見的不存在路徑（public 下沒有 /blog/ 目錄）
 * 這類路徑不要丟給 next/image，否則會噴 invalid image
 */
function isMissingSeedPath(value: string): boolean {
  if (value.startsWith("/blog/")) return true;
  // 常見錯誤副檔名
  if (value === "/images/carousel1.jpg") return true;
  return false;
}

/** 將 DB／表單的圖路徑轉成瀏覽器可載入的 URL */
export function resolveBlogMediaUrl(
  src: string | null | undefined,
  fallback: string = PLACEHOLDER,
): string {
  if (src == null) return fallback;
  const value = src.trim();
  if (!value) return fallback;

  if (isMissingSeedPath(value)) return fallback;

  // 舊資料可能仍是 base64
  if (value.startsWith("data:")) return value;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  // Express public 靜態路徑：/uploads/... 或 /Paris/Paris01.jpg 等城市圖庫
  if (
    value.startsWith("/uploads/") ||
    /^\/(Amsterdam|Barcelona|London|Munich|Paris|Venice)\//i.test(value)
  ) {
    return `${apiBase()}${value}`;
  }

  // Next public 靜態資源
  if (value.startsWith("/")) {
    return value;
  }

  return value;
}

/**
 * 顯示文章時：把內文 HTML 的 /uploads/... 改成 Express 完整網址
 * seed 的 /blog/... 無效路徑改為預設圖
 */
export function rewriteBlogContentMedia(html: string): string {
  if (!html) return html;
  const base = apiBase();
  return html
    .replace(
      /src\s*=\s*(["'])(\/blog\/[^"']+)\1/gi,
      (_full, quote: string) => `src=${quote}${PLACEHOLDER}${quote}`,
    )
    .replace(
      /src\s*=\s*(["'])(\/(?:uploads|Amsterdam|Barcelona|London|Munich|Paris|Venice)\/[^"']+)\1/gi,
      (_full, quote: string, path: string) =>
        `src=${quote}${base}${path}${quote}`,
    )
    .replace(
      /url\(\s*(["']?)(\/(?:uploads|Amsterdam|Barcelona|London|Munich|Paris|Venice)\/[^"')]+)\1\s*\)/gi,
      (_full, _q: string, path: string) => `url(${base}${path})`,
    );
}

/** 是否適合用 next/image 優化（僅信任本站 /images 已知路徑） */
export function shouldUseNextImage(src: string): boolean {
  if (!src || src.startsWith("data:")) return false;
  if (isMissingSeedPath(src)) return false;
  if (src.includes("/uploads/")) return false;
  if (src.startsWith("http://") || src.startsWith("https://")) return false;
  // 僅 /images/ 下的站內圖給 next/image
  return src.startsWith("/images/");
}

export { PLACEHOLDER as BLOG_IMAGE_PLACEHOLDER };
