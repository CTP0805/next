"use client";

/**
 * 會員中心 — 我的評價
 * 標題列樣式對齊會員資料（基本資料／修改密碼）
 * 分頁：未評論 ｜ 已評論
 * 展開評論框與訂單頁共用 ReviewExpandPanel
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import { fetchMemberOrders } from "@/app/member/order/api";
import type { MemberOrder } from "@/app/member/order/types";
import {
  formatDateTime,
  formatMoney,
  resolveMediaUrl,
} from "@/app/member/order/utils";
import ReviewExpandPanel, {
  type ReviewExpandMode,
} from "@/app/member/order/ReviewExpandPanel";

type Tab = "pending" | "done";

export default function ReviewPage() {
  const { authInit, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<MemberOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [expandOrderId, setExpandOrderId] = useState<string | null>(null);
  const [expandMode, setExpandMode] = useState<ReviewExpandMode | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchMemberOrders({ status: "paid" });
      setOrders(Array.isArray(list) ? list : []);
    } catch (e) {
      setOrders([]);
      setError(e instanceof Error ? e.message : "載入失敗");
      toast.error(e instanceof Error ? e.message : "載入失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authInit) return;
    if (!isAuthenticated) {
      setLoading(false);
      setError("請先登入");
      return;
    }
    void load();
  }, [authInit, isAuthenticated, load]);

  /** 未評論：尚有可評價項目 */
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.can_review),
    [orders],
  );
  /** 已評論：至少有一則評價 */
  const doneOrders = useMemo(
    () => orders.filter((o) => o.has_review),
    [orders],
  );
  const display = tab === "pending" ? pendingOrders : doneOrders;

  function setActiveTab(next: Tab) {
    setTab(next);
    setExpandOrderId(null);
    setExpandMode(null);
  }

  function toggleExpand(order: MemberOrder, mode: ReviewExpandMode) {
    if (expandOrderId === order.id && expandMode === mode) {
      setExpandOrderId(null);
      setExpandMode(null);
      return;
    }
    setExpandOrderId(order.id);
    setExpandMode(mode);
  }

  return (
    <section className="w-full min-w-0">
      <Toaster position="top-center" />

      <div className="w-full">
        {/* 與會員資料相同的底線分頁樣式 */}
        <div className="border-b border-[#d9d9d9]">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`px-3 pb-3 text-[18px] ${
                tab === "pending"
                  ? "border-b border-[#7fc4cf] text-[#6fb8c4]"
                  : "text-[#d4d4d4]"
              }`}
            >
              未評論
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("done")}
              className={`px-3 pb-3 text-[18px] ${
                tab === "done"
                  ? "border-b border-[#7fc4cf] text-[#6fb8c4]"
                  : "text-[#d4d4d4]"
              }`}
            >
              已評論
            </button>
          </div>
        </div>

        <div className="mt-9">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
              {error}
              <button
                type="button"
                className="mt-3 block w-full text-[#45cad5] underline"
                onClick={() => void load()}
              >
                重試
              </button>
            </div>
          ) : display.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-6 py-14 text-center">
              <p className="font-medium text-gray-600">
                {tab === "pending"
                  ? "目前沒有待評價的訂單"
                  : "目前還沒有評價紀錄"}
              </p>
              <Link
                href="/member/order"
                className="mt-4 inline-flex text-sm font-medium text-[#6fb8c4] hover:underline"
              >
                前往歷史訂單
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {display.map((order) => {
                const expanded =
                  expandOrderId === order.id && expandMode != null;
                const firstReview = order.items.find((it) => it.has_review);

                return (
                  <li
                    key={order.id}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveMediaUrl(order.image_url)}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/placeholder.jpg";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold text-gray-900">
                            {order.title}
                          </h4>
                          <p className="mt-1 text-xs text-gray-400">
                            訂單編號：{order.id}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            實付 {formatMoney(order.final_amount)} ·{" "}
                            {formatDateTime(order.created_at)}
                          </p>
                          {tab === "done" && firstReview?.review ? (
                            <p className="mt-1 text-xs text-amber-500">
                              {"★".repeat(firstReview.review.rating)}
                              {"☆".repeat(
                                Math.max(0, 5 - firstReview.review.rating),
                              )}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {order.status_label}
                        </span>
                        {tab === "pending" ? (
                          <button
                            type="button"
                            onClick={() =>
                              toggleExpand(order, "review-form")
                            }
                            className="text-xs font-medium text-[#6fb8c4] underline underline-offset-2"
                          >
                            {expandOrderId === order.id &&
                            expandMode === "review-form"
                              ? "收起評論"
                              : "立即評論"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              toggleExpand(order, "view-review")
                            }
                            className="text-xs font-medium text-gray-500 underline underline-offset-2"
                          >
                            {expandOrderId === order.id &&
                            expandMode === "view-review"
                              ? "收起評論"
                              : "查看評論"}
                          </button>
                        )}
                      </div>
                    </div>

                    {tab === "done" &&
                    firstReview?.review?.comment &&
                    !expanded ? (
                      <p className="mx-4 mb-3 line-clamp-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                        {firstReview.review.comment}
                      </p>
                    ) : null}

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
                          if (!updated.can_review && updated.has_review) {
                            setTab("done");
                            setExpandMode("view-review");
                          } else {
                            setExpandMode(
                              updated.can_review
                                ? "review-form"
                                : "view-review",
                            );
                          }
                        }}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
