/**
 * =============================================================================
 * 【新手導讀】Level 前端 API 層
 * =============================================================================
 * 對應後端路由：express/routes/api-member-level.ts
 * 掛載網址：GET http://localhost:3001/api/member-level
 * 誰呼叫：next/app/member/level/page.tsx 的 load()
 * =============================================================================
 */

// ---------- import 說明 ----------
// API_SERVER：來自 next/config/api-path.ts
//   用途：組出後端網址（例如 http://localhost:3001），避免寫死 port
import { API_SERVER } from "@/config/api-path";

// ---------- 型別（type）語法說明 ----------
// export type A = "x" | "y"
//   → 聯合型別（Union）：變數只能是列出的字串之一
//   對應 DB：member.member_level enum('銅','銀','金')
export type MemberLevel = "銅" | "銀" | "金";

// type 物件形狀：{ 欄位名: 型別 }
// Record<K, V>：鍵是 K、值是 V 的物件
//   例：Record<MemberLevel, string> = { 銅: string, 銀: string, 金: string }
export type LevelBenefitRow = {
  label: string; // 權益列標題，例如「大使權益」
  values: Record<MemberLevel, string>; // 三個等級各顯示什麼字
};

// FAQ 一題：q=問題、a=答案
export type LevelFaq = { q: string; a: string };

/**
 * 後端 res.json({ data: ... }) 裡 data 的完整形狀
 * 前端 page / level.tsx / levelcontent.tsx 都吃這個
 */
export type MemberLevelPayload = {
  name: string; // 會員姓名
  current_level: MemberLevel; // 目前等級
  next_level: MemberLevel | null; // 下一級；已是金則 null（| null = 可以是空）
  progress_percent: number; // 進度 0~100（訂單進度、消費進度取較高）
  remaining_orders: number; // 離下一級還差幾單
  remaining_spend: number; // 離下一級還差多少消費
  total_orders: number; // 累積訂單數（DB member.total_orders）
  total_spent: number; // 累積消費（DB member.total_spent）
  /** 下一級目標訂單數，例銅→銀=3；已最高等則 null */
  goal_orders: number | null;
  /** 下一級目標消費，例銅→銀=5000；已最高等則 null */
  goal_spent: number | null;
  /** either = 訂單或消費達其一即可升級 */
  upgrade_rule: "either";
  current_points: number; // 目前 M 幣
  levels: MemberLevel[]; // ["銅","銀","金"] 陣列
  benefit_rows: LevelBenefitRow[]; // 權益表
  thresholds: Record<MemberLevel, { minOrders: number; minSpent: number }>;
  faqs: LevelFaq[];
};

/**
 * 後端統一包裝：{ success, message?, data? }
 * <T> 是泛型（Generic）：呼叫時再指定 data 裡面是什麼型別
 *   例：ApiEnvelope<MemberLevelPayload>
 */
type ApiEnvelope<T> = {
  success: boolean;
  message?: string; // ? = 可有可無的屬性（optional）
  data?: T;
};

/**
 * =============================================================================
 * 【主要函式】fetchMemberLevel
 * =============================================================================
 * 對應後端路由：GET /api/member-level
 * 後端檔案：express/routes/api-member-level.ts → router.get("/")
 * 用途：向伺服器要「目前登入會員」的等級與進度資料
 *
 * 語法：
 *   export     → 其他檔案可以 import { fetchMemberLevel }
 *   async      → 函式裡可用 await，回傳一定是 Promise
 *   Promise<T> → 非同步結束後得到 T
 *   await      → 等 Promise 完成再往下跑（不會卡住整個瀏覽器，只暫停此函式）
 * =============================================================================
 */
export async function fetchMemberLevel(): Promise<MemberLevelPayload> {
  // fetch = 瀏覽器內建的 HTTP 請求函式
  // 模板字串 `...${變數}...` = 把變數嵌進字串
  const response = await fetch(`${API_SERVER}/api/member-level`, {
    method: "GET", // HTTP 方法：讀取資料用 GET
    // credentials: "include"
    //   跨網域（3000→3001）時把 Cookie 一併送出（登入 token 在 Cookie「Kenny」）
    credentials: "include",
    // cache: "no-store" → 不要用快取，每次都打真的後端
    cache: "no-store",
  });

  // response.json()：把回應 body 從 JSON 字串解析成 JS 物件
  // as ApiEnvelope<...>：TypeScript 斷言「我當它是這個型別」（編譯期檢查用）
  const result = (await response.json()) as ApiEnvelope<MemberLevelPayload>;

  // response.ok：HTTP 狀態 200~299 為 true
  // ||：邏輯或，左邊為假才看右邊
  if (!response.ok || !result.success || !result.data) {
    // throw new Error：丟出錯誤，呼叫端用 try/catch 接
    throw new Error(result.message || "取得會員等級失敗");
  }

  // 只回傳 data，頁面不用每次都拆 result.success
  return result.data;
}
