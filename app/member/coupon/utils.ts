import type {
  Coupon,
  CouponFilter,
  MemberCoupon,
  MemberCouponStatus,
  MemberCouponView,
  PointFilter,
  PointTransaction,
  SelectedCouponPayload,
} from "./types";
import { SELECTED_COUPON_STORAGE_KEY } from "./types";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAmount(amount: number): string {
  return amount > 0 ? `+${amount}` : `${amount}`;
}

export function formatCurrency(amount: number): string {
  return `NT$ ${amount.toLocaleString("zh-TW")}`;
}

export function filterTransactions(
  list: PointTransaction[],
  filter: PointFilter,
): PointTransaction[] {
  if (filter === "all") return list;
  return list.filter((item) => item.status === filter);
}

export function filterCoupons(
  list: MemberCouponView[],
  filter: CouponFilter,
): MemberCouponView[] {
  if (filter === "all") return list;
  return list.filter((item) => item.status === filter);
}

export function formatDiscount(
  coupon: Pick<Coupon, "discount_type" | "discount_value">,
): string {
  return `$${coupon.discount_value}`;
}

export function couponStatusLabel(status: MemberCouponStatus): string {
  switch (status) {
    case "available":
      return "可使用";
    case "scheduled":
      return "尚未生效";
    case "used":
      return "已使用";
    case "expired":
      return "已過期";
  }
}

/** 固定金額折抵（對齊 DB discount_amount） */
export function calcCouponDiscount(
  coupon: Pick<Coupon, "discount_value" | "min_order_amount">,
  originalAmount: number,
): number {
  if (originalAmount <= 0) return 0;
  if (
    coupon.min_order_amount != null &&
    originalAmount < coupon.min_order_amount
  ) {
    return 0;
  }
  return Math.min(coupon.discount_value, originalAmount);
}

export function calcFinalAmount(
  originalAmount: number,
  couponDiscount: number,
  pointsRedeemed: number,
): number {
  return Math.max(0, originalAmount - couponDiscount - pointsRedeemed);
}

export function toSelectedCouponPayload(
  coupon: MemberCouponView,
): SelectedCouponPayload {
  return {
    member_coupon_id: coupon.member_coupon_id,
    coupon_id: coupon.coupon_id,
    code: coupon.code,
    title: coupon.title,
    discount_type: "fixed",
    discount_value: coupon.discount_value,
    max_discount: coupon.max_discount,
    min_order_amount: coupon.min_order_amount,
    selected_at: new Date().toISOString(),
  };
}

export function saveSelectedCoupon(coupon: MemberCouponView): void {
  if (typeof window === "undefined") return;
  const payload = toSelectedCouponPayload(coupon);
  window.localStorage.setItem(
    SELECTED_COUPON_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

export function readSelectedCoupon(): SelectedCouponPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SELECTED_COUPON_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SelectedCouponPayload;
  } catch {
    return null;
  }
}

export function clearSelectedCoupon(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SELECTED_COUPON_STORAGE_KEY);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function normalizeRedeemCode(code: string): string {
  return code.trim().toUpperCase();
}

export const LIST_PAGE_SIZE = 10;

export function getTotalPages(
  totalItems: number,
  pageSize = LIST_PAGE_SIZE,
): number {
  if (totalItems <= 0) return 1;
  return Math.ceil(totalItems / pageSize);
}

export function paginateList<T>(
  list: T[],
  page: number,
  pageSize = LIST_PAGE_SIZE,
): T[] {
  const totalPages = getTotalPages(list.length, pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return list.slice(start, start + pageSize);
}

/** 由 is_used + starts_at + expires_at 推導列表狀態 */
export function deriveCouponStatus(
  row: Pick<MemberCoupon, "is_used">,
  coupon: Pick<Coupon, "starts_at" | "expires_at">,
  now: Date = new Date(),
): MemberCouponStatus {
  if (row.is_used) return "used";
  const nowMs = now.getTime();
  if (new Date(coupon.expires_at).getTime() < nowMs) return "expired";
  if (new Date(coupon.starts_at).getTime() > nowMs) return "scheduled";
  return "available";
}
