"use client";

import { use } from "react";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 🚀 動態路由：解開網址上的 id 變數
  const { id } = use(params);

  return (
    <div className="w-full text-gray-800">
      {/* 頁面小麵包屑 */}
      <h3 className="mb-6 pl-1 text-sm font-medium text-gray-400">
        歷史訂單 / <span className="font-bold text-gray-700">訂單明細</span>
      </h3>

      {/* ======== 白色大卡片 ========= */}
      <div className="flex w-full flex-col items-stretch justify-between gap-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm xl:flex-row">
        {/* 【第一欄：狀態、金額與商品名稱】 */}
        <div className="flex flex-1 flex-col justify-between gap-6">
          <div>
            {/* 綠色狀態 */}
            <div className="mb-1 text-base font-bold text-emerald-500">
              訂單已確認
            </div>
            {/* 金額 */}
            <div className="mb-6 text-xl font-black text-gray-900">
              NT$ 1,394
            </div>

            {/* 商品主標題 */}
            <h4 className="text-sm leading-snug font-bold text-gray-900">
              濟州島9.81 Park門票
            </h4>
            <p className="mt-0.5 text-[11px] text-gray-400">
              【優惠】單人賽車 & 遊玩
            </p>
          </div>

          {/* 下方水平並排的時間與數量區塊 */}
          <div className="mt-4 flex items-center gap-2">
            <div className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-medium text-gray-600">
              2026-08-15 09:00:00 （當地時間）
            </div>
            <div className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-medium text-gray-600">
              2 x 每人
            </div>
          </div>
        </div>

        {/* 【第二欄：中間商品小縮圖】 */}
        <div className="flex items-start justify-center pt-2 xl:justify-start">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            <img
              src="/images/experiences/montmartre-art.jpg"
              alt="商品縮圖"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* 【第三欄：右側訂單基本資料卡】 */}
        <div className="flex w-full flex-shrink-0 flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-5 xl:w-72">
          <div className="mb-1 text-center text-xs font-bold text-gray-700">
            訂單基本資料
          </div>

          <div className="flex flex-col gap-2 text-[11px] text-gray-600">
            {/* 訂單編號 */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400">訂單編號</span>
              <div className="flex items-center gap-1 font-mono font-medium text-gray-800">
                <span>{id}</span>
                <button className="text-gray-400 transition hover:text-gray-600 active:scale-95">
                  🗐
                </button>
              </div>
            </div>
            {/* 下單日期 */}
            <div className="flex justify-between">
              <span className="text-gray-400">下單日期</span>
              <span className="font-medium text-gray-700">
                2026-07-04 18:34:24
              </span>
            </div>
            {/* 付款日期 */}
            <div className="flex justify-between">
              <span className="text-gray-400">付款日期</span>
              <span className="font-medium text-gray-700">
                2026-07-04 18:37:22
              </span>
            </div>
            {/* 酷幣回饋 */}
            <div className="mt-1 flex items-center justify-between border-t border-gray-200/60 pt-2">
              <span className="text-gray-400">
                酷幣回饋{" "}
                <span className="text-[9px] text-gray-300">
                  (需完成參加活動)
                </span>
              </span>
              <span className="font-bold text-gray-800">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
