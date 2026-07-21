/**
 * 會員優惠／M幣 — 前端 API 層（對應 Express /api/member-coupon）
 * 寫法參考 member/profile：credentials include + success/data 解析
 */
import { API_SERVER } from "@/config/api-path";
import type { MemberBenefitsPayload, MemberCouponView } from "./types";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

/** GET /api/member-coupon/benefits */
export async function fetchMemberBenefits(): Promise<MemberBenefitsPayload> {
  const response = await fetch(`${API_SERVER}/api/member-coupon/benefits`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const result = (await response.json()) as ApiEnvelope<MemberBenefitsPayload>;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "取得優惠資料失敗");
  }

  return result.data;
}

/** POST /api/member-coupon/redeem */
export async function redeemCouponCode(
  code: string,
): Promise<MemberCouponView> {
  const response = await fetch(`${API_SERVER}/api/member-coupon/redeem`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  const result = (await response.json()) as ApiEnvelope<{
    coupon: MemberCouponView;
  }>;

  if (!response.ok || !result.success || !result.data?.coupon) {
    throw new Error(result.message || "兌換失敗");
  }

  return result.data.coupon;
}
