/**
 * =============================================================================
 * 【新手導讀】Coupon／M 幣 前端 API 層
 * =============================================================================
 * 對應後端：
 *   GET  /api/member-coupon/benefits     → api-member-coupon.ts
 *   POST /api/member-coupon/redeem       → api-member-coupon.ts
 *   POST /api/payment-success-rewards    → api-payment-success-rewards.ts
 *         （success 頁進頁呼叫；M 幣＝當下剩餘 + 實付回饋）
 * =============================================================================
 */

// ---------- import ----------
// API_SERVER：next/config/api-path.ts → 後端 base URL
import { API_SERVER } from "@/config/api-path";

// 型別來自同資料夾 types.ts（只編譯用，執行時刪除）
import type { MemberBenefitsPayload, MemberCouponView } from "./types";

/**
 * 泛型包裝：後端統一 { success, message?, data? }
 * T 是 data 的型別，每個 API 不一樣
 */
type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

/**
 * =============================================================================
 * 【函式】fetchMemberBenefits
 * =============================================================================
 * 對應路由：GET /api/member-coupon/benefits
 * 後端檔：express/routes/api-member-coupon.ts → router.get("/benefits")
 * 誰用：member/coupon/page.tsx
 * 用途：一次拿 M 幣餘額、流水、我的券、可兌換券池
 *
 * async/await：非同步；Promise<MemberBenefitsPayload> 表示成功時回傳的型別
 * =============================================================================
 */
export async function fetchMemberBenefits(): Promise<MemberBenefitsPayload> {
  // fetch(網址, 選項物件)
  const response = await fetch(`${API_SERVER}/api/member-coupon/benefits`, {
    method: "GET",
    credentials: "include", // 帶登入 Cookie
    cache: "no-store", // 不要快取
  });

  // as 斷言：告訴 TS 解析後的 JSON 長這樣
  const result = (await response.json()) as ApiEnvelope<MemberBenefitsPayload>;

  // 短路：任一條件失敗就 throw
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "取得優惠資料失敗");
  }

  return result.data;
}

/**
 * =============================================================================
 * 【函式】redeemCouponCode
 * =============================================================================
 * 對應路由：POST /api/member-coupon/redeem
 * 後端檔：api-member-coupon.ts → router.post("/redeem")
 * 誰用：CouponPageClient → RedeemCouponForm 送出後
 * 用途：用代碼（如 "C1"）寫入 member_coupons 領券
 *
 * 參數 code: string → 使用者輸入
 * headers Content-Type：告訴後端 body 是 JSON
 * JSON.stringify：JS 物件 → JSON 字串（HTTP body 只能是字串）
 * =============================================================================
 */
export async function redeemCouponCode(
  code: string,
): Promise<MemberCouponView> {
  const response = await fetch(`${API_SERVER}/api/member-coupon/redeem`, {
    method: "POST", // 會改資料用 POST
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }), // body: { code: "C1" }
  });

  // data 裡是 { coupon: MemberCouponView }
  const result = (await response.json()) as ApiEnvelope<{
    coupon: MemberCouponView;
  }>;

  // ?. 可選鏈：result.data 可能 undefined，不會噴錯，整段變 undefined
  if (!response.ok || !result.success || !result.data?.coupon) {
    throw new Error(result.message || "兌換失敗");
  }

  return result.data.coupon;
}

/**
 * =============================================================================
 * 【函式】applyPaymentSuccessRewards
 * =============================================================================
 * 對應路由：POST /api/payment-success-rewards
 * 後端檔：express/routes/api-payment-success-rewards.ts → router.post("/")
 * 誰用：next/app/success/page.tsx（進成功頁 useEffect）
 *
 * 用途（本人後續，不改 order_status）：
 *   1) 核銷本單優惠券
 *   2) M 幣：當下剩餘 + 實付回饋（例 750+950=1700）
 *   3) total_spent / total_orders、member_level
 *
 * 參數 orderId?: string | null
 *   建議傳結帳回傳的 order_id；省略則後端抓最近一筆
 *
 * 語法：
 *   body: JSON.stringify(orderId ? { order_id: orderId } : {})
 *     → 有 id 才放進 JSON，否則空物件 {}
 *   credentials: "include" → 帶登入 Cookie
 * =============================================================================
 */
export async function applyPaymentSuccessRewards(orderId?: string | null) {
  const response = await fetch(`${API_SERVER}/api/payment-success-rewards`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderId ? { order_id: orderId } : {}),
  });

  const result = (await response.json()) as ApiEnvelope<{
    order_id: string;
    already_applied?: boolean;
    coupon: {
      applied: boolean;
      already_used: boolean;
      member_coupon_id: number | null;
      coupon_id: number | null;
    };
    m_coin: {
      granted: number;
      source: string;
      detail: string;
      balance_before?: number;
      balance_after: number;
      final_amount?: number;
    };
    member_progress?: unknown;
  }>;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "付款成功後處理失敗");
  }

  return result.data;
}
