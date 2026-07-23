/**
 * 會員訂單 — 前端 API（對應 Express /api/member-order）
 * 寫法參考 member/profile：credentials include + success/data 解析
 */
import { API_SERVER } from "@/config/api-path";
import type { MemberOrder } from "./types";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

/** GET /api/member-order */
export async function fetchMemberOrders(params?: {
  status?: string;
}): Promise<MemberOrder[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString();

  const response = await fetch(
    `${API_SERVER}/api/member-order${query ? `?${query}` : ""}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  const result = (await response.json()) as ApiEnvelope<{
    orders: MemberOrder[];
  }>;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "取得訂單失敗");
  }

  return result.data.orders ?? [];
}

/** GET /api/member-order/:id */
export async function fetchMemberOrderById(
  orderId: string,
): Promise<MemberOrder> {
  const response = await fetch(
    `${API_SERVER}/api/member-order/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  const result = (await response.json()) as ApiEnvelope<{
    order: MemberOrder;
  }>;

  if (!response.ok || !result.success || !result.data?.order) {
    throw new Error(result.message || "找不到訂單");
  }

  return result.data.order;
}

/** POST /api/member-order/:id/cancel */
export async function cancelMemberOrder(
  orderId: string,
): Promise<MemberOrder> {
  const response = await fetch(
    `${API_SERVER}/api/member-order/${encodeURIComponent(orderId)}/cancel`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
  );

  const result = (await response.json()) as ApiEnvelope<{
    order: MemberOrder;
  }>;

  if (!response.ok || !result.success || !result.data?.order) {
    throw new Error(result.message || "取消訂單失敗");
  }

  return result.data.order;
}

/** POST /api/member-order/items/:itemId/review */
export async function submitOrderItemReview(
  itemId: number,
  payload: { rating: number; comment: string; image_url?: string | null },
): Promise<MemberOrder> {
  const response = await fetch(
    `${API_SERVER}/api/member-order/items/${itemId}/review`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const result = (await response.json()) as ApiEnvelope<{
    order: MemberOrder;
  }>;

  if (!response.ok || !result.success || !result.data?.order) {
    throw new Error(result.message || "送出評價失敗");
  }

  return result.data.order;
}
