"use client";

/**
 * 會員中心 — 我的訂單
 * 未評論：立即評論（向下展開）／已評論：查看評論
 * 評價表單含圖片上傳＋裁切（與我的評價共用 ReviewExpandPanel）
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import { cancelMemberOrder, fetchMemberOrders } from "./api";
import type { MemberOrder, OrderStatus } from "./types";
import {
  formatDateTime,
  formatMoney,
  orderDetailLines,
  resolveMediaUrl,
  statusBadgeClass,
} from "./utils";
import ReviewExpandPanel, {
  type ReviewExpandMode,
} from "./ReviewExpandPanel";

type StatusFilter = "all" | "paid" | "pending" | "cancelled";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "paid", label: "已確認" },
  { value: "pending", label: "待付款" },
  { value: "cancelled", label: "已取消" },
];

export default function OrderPage() {
  const { authInit, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<MemberOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [voucherOrder, setVoucherOrder] = useState<MemberOrder | null>(null);
  const [expandOrderId, setExpandOrderId] = useState<string | null>(null);
  const [expandMode, setExpandMode] = useState<ReviewExpandMode | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchMemberOrders();
      setOrders(Array.isArray(list) ? list : []);
    } catch (e) {
      setOrders([]);
      setError(e instanceof Error ? e.message : "載入訂單失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authInit) return;
    if (!isAuthenticated) {
      setLoading(false);
      setError("請先登入以查看訂單");
      return;
    }
    void load();
  }, [authInit, isAuthenticated, load]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      paid: orders.filter((o) => o.order_status === "paid").length,
      pending: orders.filter((o) => o.order_status === "pending").length,
      cancelled: orders.filter((o) => o.order_status === "cancelled").length,
    };
  }, [orders]);

  const list = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.order_status === filter);
  }, [orders, filter]);

  function toggleExpand(order: MemberOrder, mode: ReviewExpandMode) {
    if (expandOrderId === order.id && expandMode === mode) {
      setExpandOrderId(null);
      setExpandMode(null);
      return;
    }
    setExpandOrderId(order.id);
    setExpandMode(mode);
  }

  async function handleCancel(order: MemberOrder) {
    if (!order.can_cancel) {
      toast.error("此訂單無法取消");
      return;
    }
    const ok = window.confirm(
      `確定要取消訂單「${order.id}」嗎？取消後無法復原。`,
    );
    if (!ok) return;

    setCancellingId(order.id);
    try {
      const updated = await cancelMemberOrder(order.id);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      );
      toast.success("訂單已取消");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "取消失敗");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="w-full text-gray-800">
      <Toaster position="top-center" />

      {/* 標題列：樣式對齊會員資料分頁，無切換僅單項 */}
      <div className="border-b border-[#d9d9d9]">
        <div className="flex gap-8">
          <span className="border-b border-[#7fc4cf] px-3 pb-3 text-[18px] text-[#6fb8c4]">
            歷史訂單
          </span>
        </div>
      </div>

      <div className="mt-9 mb-5 flex flex-wrap gap-2">
        {FILTERS.map((opt) => {
          const active = filter === opt.value;
          const count = counts[opt.value];
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={`rounded-[12px] px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-gray-100 bg-gray-50"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
          {error}
          {isAuthenticated ? (
            <button
              type="button"
              className="mt-4 block w-full text-[#45cad5] underline"
              onClick={() => void load()}
            >
              重試
            </button>
          ) : null}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-medium text-gray-600">目前暫無訂單</p>
          <Link
            href="/experiences/search"
            className="mt-5 inline-flex rounded-[12px] bg-[#45cad5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#36b3be]"
          >
            瀏覽體驗
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {list.map((order) => {
            const details = orderDetailLines(order);
            const busy = cancellingId === order.id;
            const imageSrc = resolveMediaUrl(order.image_url);
            const status = order.order_status as OrderStatus;
            const expanded =
              expandOrderId === order.id && expandMode != null;

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex w-full flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-stretch">
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-gray-600">
                        🎟️ 體驗
                      </span>
                      <h4 className="text-base leading-snug font-bold text-gray-900">
                        {order.title}
                      </h4>
                    </div>
                    <div className="flex flex-col gap-1 border-l-2 border-gray-100 pl-2 text-xs text-gray-500">
                      {details.map((detail, idx) => (
                        <p key={idx}>
                          <span className="mr-1 font-medium text-gray-400">
                            {detail.label}：
                          </span>
                          {detail.value}
                        </p>
                      ))}
                      <p>
                        <span className="mr-1 font-medium text-gray-400">
                          下單時間：
                        </span>
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <div className="mt-2 text-sm font-bold text-gray-800">
                      實付金額：
                      <span className="text-base">
                        {formatMoney(order.final_amount)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">
                        訂單編號：{order.id}
                      </span>
                      <span
                        className={`rounded-md border px-2.5 py-1 text-xs font-bold ${statusBadgeClass(status)}`}
                      >
                        {order.status_label}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setVoucherOrder(order)}
                        className="btn btn-sm btn-outline rounded-lg border-gray-300 px-4 font-medium text-gray-700 hover:bg-gray-50"
                      >
                        訂單憑證
                      </button>
                      {order.can_cancel ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleCancel(order)}
                          className="btn btn-sm h-8 min-h-0 border-red-200 bg-white px-3 text-xs text-red-500 hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                        >
                          {busy ? "取消中…" : "取消"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex w-full flex-shrink-0 flex-col items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:w-40 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
                    <div className="flex h-24 w-full overflow-hidden rounded-lg border bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt={order.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/placeholder.jpg";
                        }}
                      />
                    </div>
                    {status === "paid" ? (
                      order.can_review ? (
                        <button
                          type="button"
                          onClick={() =>
                            toggleExpand(order, "review-form")
                          }
                          className="text-xs font-medium text-cyan-600 underline underline-offset-4"
                        >
                          {expandOrderId === order.id &&
                          expandMode === "review-form"
                            ? "收起評論"
                            : "立即評論"}
                        </button>
                      ) : order.has_review ? (
                        <button
                          type="button"
                          onClick={() =>
                            toggleExpand(order, "view-review")
                          }
                          className="text-xs font-medium text-gray-500 underline underline-offset-4"
                        >
                          {expandOrderId === order.id &&
                          expandMode === "view-review"
                            ? "收起評論"
                            : "查看評論"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                </div>

                {expanded && expandMode ? (
                  <ReviewExpandPanel
                    order={order}
                    mode={expandMode}
                    onClose={() => {
                      setExpandOrderId(null);
                      setExpandMode(null);
                    }}
                    onOrderUpdated={(updated) => {
                      setOrders((prev) =>
                        prev.map((o) =>
                          o.id === updated.id ? updated : o,
                        ),
                      );
                    }}
                    onSubmitted={(updated) => {
                      setExpandMode(
                        updated.can_review ? "review-form" : "view-review",
                      );
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {voucherOrder ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setVoucherOrder(null)}
        >
          <div
            className="w-full max-w-md rounded-[12px] bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">訂單憑證</h2>
            <p className="mt-1 text-sm text-gray-500">{voucherOrder.title}</p>
            <p className="mt-3 font-mono text-sm">{voucherOrder.id}</p>
            <p className="mt-1 text-sm">
              {formatMoney(voucherOrder.final_amount)} ·{" "}
              {voucherOrder.status_label}
            </p>
            <button
              type="button"
              className="mt-5 rounded-[12px] bg-[#45cad5] px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setVoucherOrder(null)}
            >
              關閉
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
