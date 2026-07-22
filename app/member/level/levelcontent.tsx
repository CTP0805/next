"use client";

/**
 * =============================================================================
 * 【新手導讀＋語法】會員詳情抽屜  levelcontent.tsx
 * =============================================================================
 * 誰引入：page.tsx → import MemberLevelDetailDrawer from "./levelcontent"
 * props：data（等級資料）、isOpen（開/關）、onClose（關閉回呼）
 * =============================================================================
 */

// useEffect：開關時鎖 body 捲動、聽 Esc
// useId：產生唯一 id 給 aria-labelledby（無障礙）
// useRef：抓住 DOM 節點（關閉鈕、面板）
// useState：是否已在瀏覽器掛載（portal 需要 document）
import { useEffect, useId, useRef, useState } from "react";

// createPortal(jsx, DOM節點)：把 JSX 渲染到指定節點（通常 document.body）
//   用途：抽屜脫離父層 stacking context，才蓋住全畫面
import { createPortal } from "react-dom";

// 圖示
import { ArrowLeft, X, Crown } from "lucide-react";

// 型別來自 ./api（前端 API 層定義，對齊 GET /api/member-level）
import type { MemberLevel, MemberLevelPayload } from "./api";

/** props 介面 */
interface MemberLevelDetailDrawerProps {
  data: MemberLevelPayload;
  isOpen: boolean;
  onClose: () => void;
}

// 各等級標題顏色 class（Tailwind）
const LEVEL_HEADER_CLASS: Record<MemberLevel, string> = {
  銅: "text-amber-700",
  銀: "text-slate-500",
  金: "text-yellow-600",
};

/**
 * 【主要元件】MemberLevelDetailDrawer
 * export default：page 用預設 import 引入
 * 參數用解構＋型別註記（等價 React.FC）
 */
export default function MemberLevelDetailDrawer({
  data,
  isOpen,
  onClose,
}: MemberLevelDetailDrawerProps) {
  // useId()：SSR/CSR 一致的唯一字串 id
  const titleId = useId();
  // useRef<HTMLButtonElement>：ref 綁在 <button> 上
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // mounted：避免 SSR 時存取 document 報錯；client 掛上後才 portal
  const [mounted, setMounted] = useState(false);

  // 空依賴 []：只在「第一次掛載」跑一次
  useEffect(() => {
    setMounted(true);
  }, []);

  // 抽屜打開時：鎖捲動、聚焦關閉鈕、Esc 關閉
  // return () => {...}：cleanup，元件卸載或依賴變前執行（還原 overflow、清 timer）
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // 鎖背景捲動
    // setTimeout：延遲聚焦，等動畫/DOM 就緒
    // ?.：closeBtnRef.current 可能 null
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

  const progressWidth = Math.min(100, Math.max(0, data.progress_percent));

  // 下一級目標：已完成 X/3 筆、已消費 Y/5,000（完成其一即可）
  const goalOrders =
    data.goal_orders ??
    (data.next_level ? data.thresholds[data.next_level]?.minOrders : null);
  const goalSpent =
    data.goal_spent ??
    (data.next_level ? data.thresholds[data.next_level]?.minSpent : null);
  const doneOrders =
    goalOrders != null ? Math.min(data.total_orders, goalOrders) : data.total_orders;
  const doneSpent =
    goalSpent != null ? Math.min(data.total_spent, goalSpent) : data.total_spent;
  const goalOrdersText =
    goalOrders != null ? goalOrders.toLocaleString("zh-TW") : "—";
  const goalSpentText =
    goalSpent != null ? goalSpent.toLocaleString("zh-TW") : "—";
  const doneSpentText = doneSpent.toLocaleString("zh-TW");

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[200] bg-black/50 transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

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

        <div className="flex-1 space-y-10 overflow-y-auto overscroll-contain px-4 py-6 text-gray-800 sm:px-6 sm:py-8">
          <section>
            <div className="mb-2 flex items-center gap-2 text-teal-600">
              <Crown className="h-5 w-5" aria-hidden />
              <span className="text-xs font-semibold tracking-[2px]">
                ELITE STATUS
              </span>
            </div>
            <h2 id={titleId} className="mb-4 text-3xl font-bold tracking-tight">
              {data.current_level}級會員
            </h2>

            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-500">尚需進度</span>
              <span>
                下一級：
                <span className="font-semibold text-teal-600">
                  {data.next_level
                    ? `${data.next_level}級會員`
                    : "已達最高等級"}
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
            <div className="space-y-1 text-sm text-gray-600">
              {data.next_level && goalOrders != null && goalSpent != null ? (
                <>
                  <p>
                    已完成{" "}
                    <span className="font-semibold text-gray-900">
                      {doneOrders}/{goalOrdersText}
                    </span>{" "}
                    筆訂單
                  </p>
                  <p>
                    已消費{" "}
                    <span className="font-semibold text-gray-900">
                      {doneSpentText}/{goalSpentText}
                    </span>
                  </p>
                  <p className="text-gray-500">
                    完成<span className="font-semibold text-gray-700">其一</span>
                    條件即可升級為{data.next_level}級。
                  </p>
                </>
              ) : (
                <p>您已達到最高等級。</p>
              )}
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-2xl font-bold">銅銀金 會員權益</h3>
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
                    {data.levels.map((level) => (
                      <th
                        key={level}
                        className={`px-3 py-3 text-center font-semibold ${LEVEL_HEADER_CLASS[level]} ${
                          level === data.current_level ? "bg-amber-50" : ""
                        }`}
                      >
                        {level}
                        {level === data.current_level ? (
                          <span className="mt-0.5 block text-[10px] font-medium text-amber-500">
                            目前等級
                          </span>
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-center">
                  {data.benefit_rows.map((row, index) => (
                    <tr
                      key={row.label}
                      className={index % 2 === 1 ? "bg-gray-50/50" : undefined}
                    >
                      <td className="px-3 py-3 text-left font-medium">
                        {row.label}
                      </td>
                      {data.levels.map((level) => {
                        const value = row.values[level];
                        const isEmpty = value === "-";
                        const isCurrent = level === data.current_level;
                        return (
                          <td
                            key={level}
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

          <section>
            <h3 className="mb-4 text-2xl font-bold">會員升級辦法</h3>
            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
              <p>會員等級資格以「完成參加訂單活動」為準計算。</p>
              <p>
                目前為{data.current_level}級會員
                {data.next_level && goalOrders != null && goalSpent != null ? (
                  <>
                    。升級進度：已完成{" "}
                    <span className="font-semibold text-gray-900">
                      {doneOrders}/{goalOrdersText}
                    </span>{" "}
                    筆訂單、已消費{" "}
                    <span className="font-semibold text-gray-900">
                      {doneSpentText}/{goalSpentText}
                    </span>
                    。
                    <span className="font-semibold text-gray-900">
                      完成其一條件
                    </span>
                    即可升級為{data.next_level}級。
                  </>
                ) : (
                  <>，已達最高等級。</>
                )}
              </p>
              <p className="text-xs text-gray-500">
                *
                銅→銀：已完成 3 筆訂單或已消費 NT$5,000（其一即可）；銀→金：6
                筆或 NT$15,000。數字來自 member.total_orders／total_spent（付款成功頁會累加）。
              </p>
            </div>
          </section>

          <section id="level-faq">
            <h3 className="mb-4 text-2xl font-bold">常見問題</h3>
            <div className="space-y-3">
              {data.faqs.map((item) => (
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
            會員常見問題中心
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
