"use client";
// 客戶端元件：有摺疊 FAQ 的 useState

/**
 * =============================================================================
 * 【新手導讀＋語法】等級右側主面板  level.tsx
 * =============================================================================
 * 誰引入：page.tsx → import MemberLevelRightPanel from "./level"
 * 資料來源：props.data（來自 GET /api/member-level，不是本檔 fetch）
 * onOpenDetail：父元件傳進來的函式，點「會員詳情」時呼叫 → 開抽屜
 * =============================================================================
 */

// React：預設命名空間；useState 做 FAQ 開合
import React, { useState } from "react";

// lucide-react：圖示元件庫（每個名字是一個 SVG 元件）
import {
  Crown, // 皇冠
  Gift, // 禮物
  Percent, // 百分比
  Tag, // 標籤
  ChevronDown, // 向下箭頭
  ChevronUp, // 向上箭頭
} from "lucide-react";

// 型別：./api 的 MemberLevelPayload（與後端 data 對齊）
import type { MemberLevelPayload } from "./api";

/**
 * interface：定義「這個元件需要哪些 props」
 *   data：等級資料
 *   onOpenDetail: () => void  → 無參數、無回傳的函式型別
 */
interface MemberLevelRightPanelProps {
  data: MemberLevelPayload;
  onOpenDetail: () => void;
}


/**
 * 【主要元件】MemberLevelRightPanel
 * React.FC<Props>：Function Component，props 型別是 Props
 * 解構 ({ data, onOpenDetail })：直接取出 props 欄位當區域變數
 */
const MemberLevelRightPanel: React.FC<MemberLevelRightPanelProps> = ({
  data,
  onOpenDetail,
}) => {
  // 目前展開的 FAQ 索引；null = 全部收合
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // .slice(0, 3)：取前 3 題
  // .map(f => (...))：把每題轉成 { question, answer } 方便畫 UI
  const faqs = data.faqs.slice(0, 3).map((f) => ({
    question: f.q,
    answer: f.a,
  }));

  /** 點某一題：同一題再點就關，否則開那一題 */
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // 進度夾在 0~100（後端：訂單進度、消費進度取較高 → 符合「完成其一」）
  const progress = Math.min(100, Math.max(0, data.progress_percent));
  // ??：左邊是 null/undefined 才用右邊（空字串不會觸發）
  const nextLabel = data.next_level ?? "已達最高等級";

  // 下一級門檻：優先用 API 的 goal_*；否則從 thresholds 推
  const goalOrders =
    data.goal_orders ??
    (data.next_level ? data.thresholds[data.next_level]?.minOrders : null);
  const goalSpent =
    data.goal_spent ??
    (data.next_level ? data.thresholds[data.next_level]?.minSpent : null);

  // 顯示「已完成 0/3 筆訂單」「已消費 0/5,000」（分子不超過分母）
  const doneOrders =
    goalOrders != null ? Math.min(data.total_orders, goalOrders) : data.total_orders;
  const doneSpent =
    goalSpent != null ? Math.min(data.total_spent, goalSpent) : data.total_spent;
  const goalOrdersText =
    goalOrders != null ? goalOrders.toLocaleString("zh-TW") : "—";
  const goalSpentText =
    goalSpent != null ? goalSpent.toLocaleString("zh-TW") : "—";
  const doneSpentText = doneSpent.toLocaleString("zh-TW");

  return (
    <div className="w-full min-w-0">
      {/* ELITE STATUS 卡片 */}
      <div
        className="relative mb-8 rounded-[12px] p-6 text-slate-900 shadow-lg transition-[background-image] duration-500 sm:p-8"
        style={{
          backgroundImage: `linear-gradient(110deg, ${data.card_theme.start} 0%, ${data.card_theme.middle} 52%, ${data.card_theme.end} 100%)`,
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Crown className="h-5 w-5" />
              <span className="text-sm font-medium tracking-[2px] opacity-90">
                ELITE STATUS
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              {data.member_level}
            </h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenDetail();
            }}
            className="relative z-10 flex min-h-11 shrink-0 items-center gap-1.5 rounded-[12px] bg-white/35 px-4 py-2 text-sm transition-all hover:bg-white/50 active:bg-white/60 sm:px-5"
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
                {data.next_level ? `${data.next_level}` : nextLabel}
              </span>
            </span>
          </div>
          <div className="mb-3 h-2.5 overflow-hidden rounded-[12px] bg-slate-900/15">
            <div
              className="h-full rounded-[12px] bg-slate-900/75 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="space-y-1 text-sm text-slate-900/85">
            {data.next_level && goalOrders != null && goalSpent != null ? (
              <>
                <p>
                  已完成{" "}
                  <span className="font-semibold">
                    {doneOrders}/{goalOrdersText}
                  </span>{" "}
                  筆訂單
                </p>
                <p>
                  已消費{" "}
                  <span className="font-semibold">
                    {doneSpentText}/{goalSpentText}
                  </span>
                </p>
                <p className="text-slate-900/75">
                  完成<span className="font-semibold">其一</span>
                  條件即可升級為{data.next_level}級。
                </p>
              </>
            ) : (
              <p>您已達到最高等級，感謝支持。</p>
            )}
          </div>
        </div>
      </div>

      {/* 權益摘要（維持三欄版面） */}
      <div className="mb-8">
        <h3 className="mb-5 text-xl font-bold text-gray-900">
          {data.member_level}權益
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[12px] border border-gray-200 p-5 transition-all hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-teal-100">
              <Gift className="h-5 w-5 text-teal-600" />
            </div>
            <h4 className="mb-1 font-semibold">專屬回饋</h4>
            <p className="text-sm text-gray-600">
              {data.benefit_rows[0]?.values[data.member_level] ?? "會員回饋"}
            </p>
          </div>

          <div className="rounded-[12px] border border-gray-200 p-5 transition-all hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-amber-100">
              <Percent className="h-5 w-5 text-amber-600" />
            </div>
            <h4 className="mb-1 font-semibold">會員專屬優惠券</h4>
            <p className="text-sm text-gray-600">
              {data.benefit_rows[3]?.values[data.member_level] ??
                "升等禮優惠券"}
            </p>
          </div>

          <div className="rounded-[12px] border border-gray-200 p-5 transition-all hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-purple-100">
              <Tag className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="mb-1 font-semibold">專屬會員折扣</h4>
            <p className="text-sm text-gray-600">
              {data.benefit_rows[2]?.values[data.member_level] ?? "會員價"}
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
