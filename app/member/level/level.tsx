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

interface MemberLevelRightPanelProps {
  onOpenDetail: () => void;
}

const MemberLevelRightPanel: React.FC<MemberLevelRightPanelProps> = ({
  onOpenDetail,
}) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "如何維持黃金會員資格？",
      answer:
        "會員資格有效期為一年。您只需要在一年內完成至少三次體驗預訂，或累積消費滿 NT$ 5,000，即可自動續期一年的黃金會員資格。",
    },
    {
      question: "晉升白金會員的具體條件是什麼？",
      answer:
        "目前為黃金會員，需再完成 3 筆訂單或累積消費 NT$ 12,000 即可升級為白金會員。",
    },
    {
      question: "黃金優惠碼可以與優惠券同時使用嗎？",
      answer: "可以！黃金會員的專屬優惠碼可與平台其他優惠券、折扣碼同時併用。",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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
            <h2 className="text-4xl font-bold tracking-tight">黃金會員</h2>
          </div>

          {/* 會員詳情按鈕：type=button + 足夠觸控區，避免被表單/外層攔截 */}
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

        {/* 進度 */}
        <div className="mt-8">
          <div className="mb-2 flex justify-between text-sm">
            <span>尚需進度</span>
            <span>
              下一級：<span className="font-semibold">白金會員</span>
            </span>
          </div>
          <div className="mb-3 h-2.5 overflow-hidden rounded-[12px] bg-white/30">
            <div
              className="h-full rounded-[12px] bg-white transition-all"
              style={{ width: "65%" }}
            />
          </div>
          <p className="text-sm text-white/90">
            再完成 <span className="font-semibold">3 筆訂單</span> 或消費{" "}
            <span className="font-semibold">NT$ 12,000</span> 即可升級。
          </p>
        </div>
      </div>

      {/* 黃金會員權益 */}
      <div className="mb-8">
        <h3 className="mb-5 text-xl font-bold text-gray-900">黃金會員權益</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[12px] border border-gray-200 p-5 transition-all hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-teal-100">
              <Gift className="h-5 w-5 text-teal-600" />
            </div>
            <h4 className="mb-1 font-semibold">黃金專屬優惠</h4>
            <p className="text-sm text-gray-600">
              精選體驗享自享額外 3% 折扣，不定期發送專屬折扣碼
            </p>
          </div>

          <div className="rounded-[12px] border border-gray-200 p-5 transition-all hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-amber-100">
              <Percent className="h-5 w-5 text-amber-600" />
            </div>
            <h4 className="mb-1 font-semibold">會員專屬優惠券</h4>
            <p className="text-sm text-gray-600">
              升等禮 $200 優惠券 + 每月專屬優惠券
            </p>
          </div>

          <div className="rounded-[12px] border border-gray-200 p-5 transition-all hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-purple-100">
              <Tag className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="mb-1 font-semibold">專屬會員折扣</h4>
            <p className="text-sm text-gray-600">
              獨享黃金會員價（95折）
              <br />
              多項熱門體驗享優先預訂權
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
