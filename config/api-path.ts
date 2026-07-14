/**
 * API base URL
 * - 瀏覽器：跟目前連線的 hostname（localhost 或 192.168.x.x）走同機:3001
 * - SSR：優先讀環境變數，否則 localhost
 *
 * 覆寫：NEXT_PUBLIC_API_SERVER=http://192.168.33.85:3001
 */
function resolveApiServer(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_SERVER?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    // 前端頁面在 3000，後端預設 3001
    return `${protocol}//${hostname}:3001`;
  }

  return "http://localhost:3001";
}

export const API_SERVER: string = resolveApiServer();

/** 動態取得（client 導頁後 hostname 可能不同時用） */
export function getApiServer(): string {
  return resolveApiServer();
}
