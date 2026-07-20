"use client";

import React, { useState } from "react";
import {
  Crown,
  Gift,
  Percent,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { MemberLevelPayload } from "./api";

interface MemberLevelRightPanelProps {
  data: MemberLevelPayload;
  onOpenDetail: () => void;
}

const MemberLevelRightPanel: React.FC<MemberLevelRightPanelProps> = ({
  data,
  onOpenDetail,
}) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = data.faqs.slice(0, 3).map((f) => ({
    question: f.q,
    answer: f.a,
  }));

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const progress = Math.min(100, Math.max(0, data.progress_percent));
  const nextLabel = data.next_level ?? "已達最高等級";
  const remainingSpendText = `NT$ ${data.remaining_spend.toLocaleString("zh-TW")}`;

  return (
    <div className="w-full min-w-0">
      {/* ELITE STATUS 卡片 */}
      <div className="relative mb-8 rounded-[12px] bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-500 p-6 text-white sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Crown className="h-5 w-5" />
              <span className="text-sm font-medium tracking-[2px] opacity-90">
                ELITE STATUS
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              {data.current_level}級會員
            </h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenDetail();
            }}
            className="relative z-10 flex min-h-11 shrink-0 items-center gap-1.5 rounded-[12px] bg-white/20 px-4 py-2 text-sm transition-all hover:bg-white/30 active:bg-white/40 sm:px-5"
          >
            會員詳情 <span className="text-lg leading-none">→</span>
          </button>
        </div>

        <div className="mt-8">
          <div className="mb-2 flex justify-between text-sm">
            <span>尚需進度</span>
            <span>
              下一級：
              <span className="font-semibold">
                {data.next_level ? `${data.next_level}級會員` : nextLabel}
              </span>
            </span>
          </div>
          <div className="mb-3 h-2.5 overflow-hidden rounded-[12px] bg-white/30">
            <div
              className="h-full rounded-[12px] bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-white/90">
            {data.next_level ? (
              <>
                再完成{" "}
                <span className="font-semibold">
                  {data.remaining_orders} 筆訂單
                </span>{" "}
                或消費{" "}
                <span className="font-semibold">{remainingSpendText}</span>{" "}
                即可升級。
              </>
            ) : (
              <>您已達到最高等級，感謝支持。</>
            )}
          </p>
        </div>
      </div>

      {/* 權益摘要（維持三欄版面） */}
      <div className="mb-8">
        <h3 className="mb-5 text-xl font-bold text-gray-900">
          {data.current_level}級會員權益
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[12px] border border-gray-200 p-5 transition-all hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-teal-100">
              <Gift className="h-5 w-5 text-teal-600" />
            </div>
            <h4 className="mb-1 font-semibold">專屬回饋</h4>
            <p className="text-sm text-gray-600">
              {data.benefit_rows[0]?.values[data.current_level] ?? "會員回饋"}
            </p>
          </div>

          <div className="rounded-[12px] border border-gray-200 p-5 transition-all hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-amber-100">
              <Percent className="h-5 w-5 text-amber-600" />
            </div>
            <h4 className="mb-1 font-semibold">會員專屬優惠券</h4>
            <p className="text-sm text-gray-600">
              {data.benefit_rows[3]?.values[data.current_level] ??
                "升等禮優惠券"}
            </p>
          </div>

          <div className="rounded-[12px] border border-gray-200 p-5 transition-all hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-purple-100">
              <Tag className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="mb-1 font-semibold">專屬會員折扣</h4>
            <p className="text-sm text-gray-600">
              {data.benefit_rows[2]?.values[data.current_level] ?? "會員價"}
            </p>
          </div>
        </div>
      </div>

      {/* 常見問題 */}
      <div>
        <h3 className="mb-5 text-xl font-bold text-gray-900">常見問題</h3>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[12px] border border-gray-200"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="flex min-h-12 w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-50 sm:px-6"
              >
                <span className="pr-4 font-medium text-gray-800">
                  {faq.question}
                </span>
                {openFAQ === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {openFAQ === index && (
                <div className="border-t px-6 pt-4 pb-5 text-sm leading-relaxed text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberLevelRightPanel;
