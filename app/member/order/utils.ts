import { API_SERVER } from "@/config/api-path";
import type { MemberOrder, OrderStatus } from "./types";

export function formatMoney(amount: number): string {
  return `NT$ ${amount.toLocaleString("zh-TW")}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateOnly(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function resolveMediaUrl(src: string | null | undefined): string {
  if (!src || !src.trim()) return "/images/placeholder.jpg";
  const value = src.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/uploads/") || value.startsWith("/images/")) {
    // experience 圖多在 express public 或 next public
    if (value.startsWith("/images/experiences")) {
      return value;
    }
    if (value.startsWith("/uploads/")) {
      return `${API_SERVER}${value}`;
    }
    return value;
  }
  if (value.startsWith("/")) {
    return `${API_SERVER}${value}`;
  }
  return value;
}

export function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-600";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "cancelled":
      return "border-gray-200 bg-gray-50 text-gray-500";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

export function orderDetailLines(order: MemberOrder): {
  label: string;
  value: string;
}[] {
  const first = order.items[0];
  const lines: { label: string; value: string }[] = [];
  if (first?.city) {
    lines.push({ label: "地點", value: first.city });
  }
  if (first?.session_start) {
    lines.push({
      label: "體驗日期",
      value: formatDateTime(first.session_start),
    });
  }
  const totalQty = order.items.reduce((sum, it) => sum + it.quantity, 0);
  lines.push({
    label: "數量",
    value: totalQty > 0 ? `共 ${totalQty} 項` : "—",
  });
  lines.push({ label: "付款方式", value: order.payment_label });
  if (order.points_redeemed > 0) {
    lines.push({
      label: "M幣折抵",
      value: `${order.points_redeemed} 點`,
    });
  }
  if (order.coupon_discount > 0) {
    lines.push({
      label: "優惠券",
      value: formatMoney(order.coupon_discount),
    });
  }
  return lines;
}
