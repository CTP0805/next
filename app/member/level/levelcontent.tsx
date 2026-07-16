"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, X, Crown } from "lucide-react";

interface MemberLevelDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type LevelKey = "navigator" | "gold" | "platinum";

interface MemberStatus {
  currentLabel: string;
  nextLabel: string;
  progressPercent: number;
  remainingOrders: number;
  remainingSpend: string;
}

interface BenefitRow {
  label: string;
  values: Record<LevelKey, string>;
}

interface FaqItem {
  q: string;
  a: string;
}

const LEVELS: { key: LevelKey; label: string; headerClass: string }[] = [
  { key: "navigator", label: "領航員", headerClass: "text-gray-600" },
  { key: "gold", label: "黃金會員", headerClass: "text-amber-600" },
  { key: "platinum", label: "白金會員", headerClass: "text-purple-600" },
];

const MEMBER_STATUS: MemberStatus = {
  currentLabel: "黃金會員",
  nextLabel: "白金會員",
  progressPercent: 65,
  remainingOrders: 3,
  remainingSpend: "NT$ 12,000",
};

const BENEFIT_ROWS: BenefitRow[] = [
  {
    label: "大使權益",
    values: {
      navigator: "1倍 (最高回饋1%)",
      gold: "3倍 (最高回饋3%)",
      platinum: "5倍 (最高回饋5%)",
    },
  },
  {
    label: "會員日",
    values: {
      navigator: "TWD 50 基礎會員日",
      gold: "TWD 150 進階會員日",
      platinum: "TWD 300 尊榮會員日",
    },
  },
  {
    label: "會員價",
    values: {
      navigator: "-",
      gold: "Gold價",
      platinum: "Platinum價",
    },
  },
  {
    label: "升等禮",
    values: {
      navigator: "-",
      gold: "TWD 200 升等禮",
      platinum: "TWD 500 升等禮",
    },
  },
  {
    label: "續會禮",
    values: {
      navigator: "-",
      gold: "TWD 200 續會禮",
      platinum: "TWD 500 續會禮",
    },
  },
];

const FAQS: FaqItem[] = [
  {
    q: "C級會員是什麼？",
    a: "C級會員為本平台會員分級制度，包含領航員（基礎）、黃金會員、白金會員三個等級，依消費與活動參與度給予不同權益。",
  },
  {
    q: "如何加入會員權益？",
    a: "註冊帳號後自動成為領航員。累積消費或完成體驗預訂即可自動升等，無需額外申請。",
  },
  {
    q: "有哪些優惠？我該如何升等？",
    a: "請參考上方「C 級 會員權益」表格。升等條件為年度內完成指定訂單數或消費金額，詳見升級辦法說明。",
  },
  {
    q: "哪裡可以查詢會員資格？",
    a: "於個人檔案 > 會員等級 頁面，即可查看當前等級、進度條與剩餘升等條件。",
  },
];

const CURRENT_LEVEL_KEY: LevelKey = "gold";

export default function MemberLevelDetailDrawer({
  isOpen,
  onClose,
}: MemberLevelDetailDrawerProps) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Portal 需等 client mount，避免 SSR/水合差異
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // 延遲 focus，避免部分行動瀏覽器搶焦失敗
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const progressWidth = Math.min(100, Math.max(0, MEMBER_STATUS.progressPercent));

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop：關閉時完全不接收點擊，避免蓋住主頁按鈕 */}
      <div
        className={`fixed inset-0 z-[200] bg-black/50 transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Panel：portal 到 body，不受 member layout 層級／overflow 影響 */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={isOpen}
        aria-labelledby={titleId}
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-[210] flex h-[100dvh] w-full max-w-[min(480px,100vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen
            ? "pointer-events-auto translate-x-0"
            : "pointer-events-none translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 items-center gap-2 px-1 text-gray-700 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            <span className="font-medium">返回</span>
          </button>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="關閉會員詳情"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-[12px] p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-10 overflow-y-auto overscroll-contain px-4 py-6 text-gray-800 sm:px-6 sm:py-8">
          {/* ELITE STATUS */}
          <section>
            <div className="mb-2 flex items-center gap-2 text-teal-600">
              <Crown className="h-5 w-5" aria-hidden />
              <span className="text-xs font-semibold tracking-[2px]">
                ELITE STATUS
              </span>
            </div>
            <h2 id={titleId} className="mb-4 text-3xl font-bold tracking-tight">
              {MEMBER_STATUS.currentLabel}
            </h2>

            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-500">尚需進度</span>
              <span>
                下一級：
                <span className="font-semibold text-teal-600">
                  {MEMBER_STATUS.nextLabel}
                </span>
              </span>
            </div>
            <div
              className="mb-2 h-2.5 overflow-hidden rounded-[12px] bg-gray-200"
              role="progressbar"
              aria-valuenow={progressWidth}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="升等進度"
            >
              <div
                className="h-full rounded-[12px] bg-gradient-to-r from-teal-400 to-cyan-500 transition-all duration-500"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              再完成{" "}
              <span className="font-semibold">
                {MEMBER_STATUS.remainingOrders} 筆訂單
              </span>{" "}
              或消費{" "}
              <span className="font-semibold">
                {MEMBER_STATUS.remainingSpend}
              </span>{" "}
              即可升級。
            </p>
          </section>

          {/* C 級 會員權益 */}
          <section>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-2xl font-bold">C 級 會員權益</h3>
              <span className="rounded-[12px] bg-gray-100 px-3 py-1 text-xs text-gray-500">
                會員分級權益懶人包
              </span>
            </div>

            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">
                      等級/權益
                    </th>
                    {LEVELS.map((level) => (
                      <th
                        key={level.key}
                        className={`px-3 py-3 text-center font-semibold ${level.headerClass} ${
                          level.key === CURRENT_LEVEL_KEY ? "bg-amber-50" : ""
                        }`}
                      >
                        {level.label}
                        {level.key === CURRENT_LEVEL_KEY ? (
                          <span className="mt-0.5 block text-[10px] font-medium text-amber-500">
                            目前等級
                          </span>
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-center">
                  {BENEFIT_ROWS.map((row, index) => (
                    <tr
                      key={row.label}
                      className={index % 2 === 1 ? "bg-gray-50/50" : undefined}
                    >
                      <td className="px-3 py-3 text-left font-medium">
                        {row.label}
                      </td>
                      {LEVELS.map((level) => {
                        const value = row.values[level.key];
                        const isEmpty = value === "-";
                        const isCurrent = level.key === CURRENT_LEVEL_KEY;
                        return (
                          <td
                            key={level.key}
                            className={`px-3 py-3 ${
                              isEmpty ? "text-gray-400" : ""
                            } ${isCurrent ? "bg-amber-50/70 font-medium" : ""}`}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 會員升級辦法 */}
          <section>
            <h3 className="mb-4 text-2xl font-bold">會員升級辦法</h3>
            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
              <p>會員等級資格以「完成參加訂單活動」為準計算。</p>
              <p>
                升級條件：目前為{MEMBER_STATUS.currentLabel}，需再完成{" "}
                <span className="font-semibold text-gray-900">
                  {MEMBER_STATUS.remainingOrders} 筆訂單
                </span>{" "}
                或累積消費{" "}
                <span className="font-semibold text-gray-900">
                  {MEMBER_STATUS.remainingSpend}
                </span>{" "}
                即可升級為{MEMBER_STATUS.nextLabel}。
              </p>
              <p className="text-xs text-gray-500">
                *
                會員資格有效期為一年，系統將依據年度消費與訂單活動自動審核升降等。
              </p>
            </div>
          </section>

          {/* 常見問題 */}
          <section id="level-faq">
            <h3 className="mb-4 text-2xl font-bold">常見問題</h3>
            <div className="space-y-3">
              {FAQS.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-[12px] border border-gray-200 px-5 py-4"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-800 group-open:mb-3">
                    {item.q}
                    <span
                      className="text-gray-400 transition-transform group-open:rotate-180"
                      aria-hidden
                    >
                      ⌄
                    </span>
                  </summary>
                  <p className="pr-6 text-sm text-gray-600">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 gap-4 border-t border-gray-100 px-4 py-4 text-xs text-gray-400 sm:px-6">
          <a href="#" className="hover:text-gray-600">
            隱私權政策
          </a>
          <button
            type="button"
            onClick={() => {
              panelRef.current
                ?.querySelector<HTMLElement>("#level-faq")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="hover:text-gray-600"
          >
            C級常見問題中心
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
