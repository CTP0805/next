"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, X, Crown } from "lucide-react";
import type { MemberLevel, MemberLevelPayload } from "./api";

interface MemberLevelDetailDrawerProps {
  data: MemberLevelPayload;
  isOpen: boolean;
  onClose: () => void;
}

const LEVEL_HEADER_CLASS: Record<MemberLevel, string> = {
  銅: "text-amber-700",
  銀: "text-slate-500",
  金: "text-yellow-600",
};

export default function MemberLevelDetailDrawer({
  data,
  isOpen,
  onClose,
}: MemberLevelDetailDrawerProps) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
  const remainingSpendText = `NT$ ${data.remaining_spend.toLocaleString("zh-TW")}`;

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
            <p className="text-sm text-gray-600">
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
                <>您已達到最高等級。</>
              )}
            </p>
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
                {data.next_level ? (
                  <>
                    ，需再完成{" "}
                    <span className="font-semibold text-gray-900">
                      {data.remaining_orders} 筆訂單
                    </span>{" "}
                    或累積消費{" "}
                    <span className="font-semibold text-gray-900">
                      {remainingSpendText}
                    </span>{" "}
                    即可升級為{data.next_level}級。
                  </>
                ) : (
                  <>，已達最高等級。</>
                )}
              </p>
              <p className="text-xs text-gray-500">
                *
                銅→銀：3 筆訂單或 NT$5,000；銀→金：6 筆訂單或
                NT$15,000。系統依 total_orders／total_spent 計算進度。
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
