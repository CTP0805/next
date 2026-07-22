"use client";
// "use client"：此頁在瀏覽器執行（才能用 useEffect、useSearchParams、sessionStorage）

/**
 * =============================================================================
 * 【新手導讀】付款成功頁 `/success`（接線本人 rewards）
 * =============================================================================
 * 檔案：next/app/success/page.tsx
 * 畫面／導流多半是組員流程；本檔「本人邏輯」只在 useEffect：
 *
 *   進頁 → clearSelectedCoupon（清結帳暫存選券）
 *        → applyPaymentSuccessRewards（POST /api/payment-success-rewards）
 *
 * M 幣流程對照：
 *   結帳 submit 已扣折抵 → 餘額例 750
 *   本 API 依實付加回饋 → 例 +950 → 餘額 1700
 *
 * 建議網址：/success?order_id=建單回傳的編號
 * （沒帶 order_id 時後端抓「最近一筆」，可能抓錯）
 * =============================================================================
 */

// ---------- import：來源與用途 ----------

// next/link：客戶端導頁（比 <a> 全頁重載更順）
import Link from "next/link";

// react
//   useEffect：render 之後做副作用（打 API）
//   useRef：存「跨 render 還在、改了不重畫」的值（防 effect 跑兩次）
import { useEffect, useRef } from "react";

// next/navigation
//   useSearchParams：讀 ?order_id=xxx 查詢字串
import { useSearchParams } from "next/navigation";

// 本人 coupon API：POST /api/payment-success-rewards
//   對應後端：express/routes/api-payment-success-rewards.ts
import { applyPaymentSuccessRewards } from "@/app/member/coupon/api";

// 本人 coupon 工具：清 localStorage 結帳選券
import { clearSelectedCoupon } from "@/app/member/coupon/utils";

/**
 * =============================================================================
 * 【主要元件】SuccessPage
 * export default：Next App Router 把此元件當 /success 頁面
 * =============================================================================
 */
export default function SuccessPage() {
  // 類似 URLSearchParams：.get("key") 沒有則 null
  const searchParams = useSearchParams();

  // ranRef.current：同一輪掛載只跑業務一次（Strict Mode 會雙調 effect）
  const ranRef = useRef(false);

  /**
   * 【副作用】進頁打本人 rewards API
   * 依賴 [searchParams]：query 變了會再跑
   *
   * 語法補充：
   *   || ：左邊假值（""、null…）就用右邊
   *   void promise：呼叫 Promise 不 await（fire-and-forget）
   *   .catch(fn)：Promise 失敗時執行
   *   try/catch：sessionStorage 在隱私模式可能丟錯
   */
  useEffect(() => {
    // 1) 清前端「選用中優惠券」暫存
    clearSelectedCoupon();

    // 2) 同一 mount 只跑一次
    if (ranRef.current) return;
    ranRef.current = true;

    // 3) 訂單編號（建議結帳導向時帶上）
    //    MerchantTradeNo：綠界有時用的參數名
    const orderId =
      searchParams.get("order_id") ||
      searchParams.get("orderId") ||
      searchParams.get("MerchantTradeNo") ||
      "";

    // 4) sessionStorage 防重整重複打 API（後端另有 log 表防重）
    //    鍵：payment-success-rewards:訂單號
    const guardKey = `payment-success-rewards:${orderId || "latest"}`;
    try {
      // SSR 沒有 sessionStorage，要先 typeof 檢查
      if (typeof sessionStorage !== "undefined") {
        if (sessionStorage.getItem(guardKey) === "1") return;
        sessionStorage.setItem(guardKey, "1");
      }
    } catch {
      // 存取被拒時略過，仍打 API
    }

    // 5) 打後端：有 orderId 放 body；沒有則 {}（後端取最近一筆）
    //    成功時後端會：餘額 += 實付回饋、累積消費／等級、核銷券
    void applyPaymentSuccessRewards(orderId || null).catch((err) => {
      console.error("[success] payment-success-rewards", err);
      // 失敗拿掉旗標，允許重試
      try {
        sessionStorage.removeItem(guardKey);
      } catch {
        /* ignore */
      }
    });
  }, [searchParams]);

  /**
   * return JSX：成功頁靜態 UI（示意文案；訂單編號可之後改接真資料）
   *   className：Tailwind / DaisyUI
   *   <Link href>：去會員訂單
   */
  return (
    <>
      <div className="min-h-[calc(100vh-160px)] w-full bg-slate-50 py-10 text-gray-800">
        <div className="mx-auto w-full max-w-7xl px-4">
          {/* 步驟進度條 */}
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
