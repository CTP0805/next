"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { applyPaymentSuccessRewards } from "@/app/member/coupon/api";
import { clearSelectedCoupon } from "@/app/member/coupon/utils";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const ranRef = useRef(false);

  useEffect(() => {
    clearSelectedCoupon();

    if (ranRef.current) return;
    ranRef.current = true;

    const orderId =
      searchParams.get("order_id") ||
      searchParams.get("orderId") ||
      searchParams.get("MerchantTradeNo") ||
      "";

    const guardKey = `payment-success-rewards:${orderId || "latest"}`;
    try {
      if (typeof sessionStorage !== "undefined") {
        if (sessionStorage.getItem(guardKey) === "1") return;
        sessionStorage.setItem(guardKey, "1");
      }
    } catch {
      /* ignore */
    }

    void applyPaymentSuccessRewards(orderId || null).catch((err) => {
      console.error("[success] payment-success-rewards", err);
      try {
        sessionStorage.removeItem(guardKey);
      } catch {
        /* ignore */
      }
    });
  }, [searchParams]);

  return (
    <>
      <div className="min-h-[calc(100vh-160px)] w-full bg-slate-50 py-10 text-gray-800">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="mb-10 flex w-full justify-center">
            <ul className="steps id-steps grid w-full max-w-7xl grid-cols-3 text-sm">
              <li className="step step-accent">填寫資料</li>
              <li className="step step-accent">選擇付款</li>
              <li className="step step-accent">完成付款</li>
            </ul>
          </div>

          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <div className="flex items-center gap-2 pl-2 text-sm text-gray-500">
              <span>訂單編號：5439229639</span>
              <button className="transition hover:text-gray-700 active:scale-95">
                🗐
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200/50 bg-gray-100/70 p-6">
              <ul className="timeline timeline-vertical timeline-compact">
                <li>
                  <div className="timeline-middle text-success">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="timeline-end mb-4 pl-3">
                    <h4 className="text-sm font-bold text-gray-800">
                      付款完成！
                    </h4>
                  </div>
                  <hr className="bg-success" />
                </li>

                <li>
                  <hr className="bg-success" />
                  <div className="timeline-middle text-success">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="timeline-end pl-3">
                    <h4 className="text-sm font-bold text-gray-800">
                      訂單確認中
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      感謝使用
                      MeetLocals！訂單正在處理中，訂單確認後，將傳送訂單詳情及憑證至
                      <span className="ml-1 font-medium text-gray-700">
                        a55******@gmail.com
                      </span>
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-4">
              <Link href="/member/order">
                <button className="btn btn-outline rounded-xl border-gray-400 px-8 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-800">
                  查看訂單
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
