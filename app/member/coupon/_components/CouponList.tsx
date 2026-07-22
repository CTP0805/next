"use client";

/**
 * 【新手】我的優惠券列表
 * items = 目前頁的券；onUse = 點「使用」時回傳給父層（存 localStorage 去結帳）
 */
import { useState } from "react";
import type { MemberCouponView } from "../types";
import {
  calcCouponDiscount,
  copyText,
  couponStatusLabel,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDiscount,
} from "../utils";

interface CouponListProps {
  items: MemberCouponView[];
  selectedMemberCouponId: number | null;
  onUse: (coupon: MemberCouponView) => void;
  /** 示範折抵計算用的訂單原價 */
  demoOrderAmount?: number;
}

export default function CouponList({
  items,
  selectedMemberCouponId,
  onUse,
  demoOrderAmount = 3000,
}: CouponListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="bg-white px-5 py-16 text-center text-sm text-gray-400">
        目前沒有符合條件的優惠券
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-white px-5 py-4">
      {items.map((coupon) => {
        const disabled = coupon.status !== "available";
        const isSelected = selectedMemberCouponId === coupon.member_coupon_id;
        const isExpanded = expandedId === coupon.member_coupon_id;
        const previewDiscount = calcCouponDiscount(coupon, demoOrderAmount);

        return (
          <article
            key={coupon.member_coupon_id}
            className={`overflow-hidden rounded-[12px] border shadow-sm transition ${
              isSelected
                ? "border-[#45cad5] ring-2 ring-[#45cad5]/30"
                : "border-gray-100"
            } ${disabled ? "opacity-60" : ""}`}
          >
            <div className="flex">
              <div
                className={`flex w-[5.5rem] shrink-0 flex-col items-center justify-center px-2 py-4 text-center text-white ${
                  coupon.status === "available"
                    ? "bg-[#00B4D8]"
                    : coupon.status === "scheduled"
                      ? "bg-indigo-300"
                      : coupon.status === "used"
                        ? "bg-gray-400"
                        : "bg-gray-300"
                }`}
              >
                <span className="text-lg font-bold leading-tight">
                  {formatDiscount(coupon)}
                </span>
                <span className="mt-1 text-[10px] opacity-90">折抵</span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-4">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {coupon.title}
                    </h3>
                    <span
                      className={`rounded-[12px] px-2 py-0.5 text-[10px] font-medium ${
                        coupon.status === "available"
                          ? "bg-emerald-50 text-emerald-600"
                          : coupon.status === "scheduled"
                            ? "bg-indigo-50 text-indigo-600"
                            : coupon.status === "used"
                              ? "bg-gray-100 text-gray-500"
                              : "bg-red-50 text-red-400"
                      }`}
                    >
                      {couponStatusLabel(coupon.status)}
                    </span>
                    {isSelected ? (
                      <span className="rounded-[12px] bg-cyan-50 px-2 py-0.5 text-[10px] font-medium text-cyan-700">
                        已選用
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs leading-relaxed text-gray-500">
                    {coupon.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-2 text-[11px] text-gray-400">
                  <div className="space-y-0.5">
                    <p>
                      代碼：
                      <span className="font-mono text-gray-600">
                        {coupon.code}
                      </span>
                    </p>
                    <p>
                      有效期限：{formatDate(coupon.starts_at)} ~{" "}
                      {formatDate(coupon.expires_at)}
                    </p>
                    <p>
                      低消 {formatCurrency(coupon.min_order_amount)} · 折抵{" "}
                      {formatCurrency(coupon.discount_value)}
                    </p>
                    {coupon.order_id ? (
                      <p>使用訂單：{coupon.order_id}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      className="min-h-10 rounded-[12px] border border-gray-200 bg-white px-3 py-2 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const ok = await copyText(coupon.code);
                        if (ok) {
                          const { default: toast } = await import(
                            "react-hot-toast"
                          );
                          toast.success(`已複製 ${coupon.code}`);
                        }
                      }}
                    >
                      複製代碼
                    </button>
                    <button
                      type="button"
                      className="min-h-10 rounded-[12px] border border-gray-200 bg-white px-3 py-2 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExpandedId(
                          isExpanded ? null : coupon.member_coupon_id,
                        );
                      }}
                    >
                      {isExpanded ? "收合" : "詳情"}
                    </button>
                    {coupon.status === "available" ? (
                      <button
                        type="button"
                        className={`min-h-10 rounded-[12px] px-3 py-2 text-xs font-semibold text-white transition ${
                          isSelected
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-[#45cad5] hover:bg-[#36b3be]"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onUse(coupon);
                        }}
                      >
                        {isSelected ? "取消選用" : "使用"}
                      </button>
                    ) : null}
                  </div>
                </div>

                {isExpanded ? (
                  <div className="mt-1 rounded-[12px] bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-gray-500">
                    <p>
                      領取時間：{formatDateTime(coupon.received_at)}
                    </p>
                    <p>
                      使用時間：
                      {coupon.used_at
                        ? formatDateTime(coupon.used_at)
                        : "尚未使用（結帳完成後寫入）"}
                    </p>
                    <p>
                      若訂單原價 {formatCurrency(demoOrderAmount)}，本券約可折{" "}
                      <span className="font-semibold text-orange-500">
                        {formatCurrency(previewDiscount)}
                      </span>
                      {previewDiscount === 0 && coupon.min_order_amount
                        ? `（未達低消 ${formatCurrency(coupon.min_order_amount)}）`
                        : ""}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
