/**
 * 會員等級 — 前端 API 層（對應 Express /api/member-level）
 * 寫法參考 member/profile：credentials include + success/data 解析
 */
import { API_SERVER } from "@/config/api-path";

export type MemberLevel = "銅" | "銀" | "金";

export type LevelBenefitRow = {
  label: string;
  values: Record<MemberLevel, string>;
};

export type LevelFaq = { q: string; a: string };

export type MemberLevelPayload = {
  name: string;
  current_level: MemberLevel;
  next_level: MemberLevel | null;
  progress_percent: number;
  remaining_orders: number;
  remaining_spend: number;
  total_orders: number;
  total_spent: number;
  current_points: number;
  levels: MemberLevel[];
  benefit_rows: LevelBenefitRow[];
  thresholds: Record<MemberLevel, { minOrders: number; minSpent: number }>;
  faqs: LevelFaq[];
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

/** GET /api/member-level */
export async function fetchMemberLevel(): Promise<MemberLevelPayload> {
  const response = await fetch(`${API_SERVER}/api/member-level`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const result = (await response.json()) as ApiEnvelope<MemberLevelPayload>;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "取得會員等級失敗");
  }

  return result.data;
}
