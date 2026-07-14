"use client";
import Link from 'next/link';

import { useEffect } from "react";
import { clearSelectedCoupon } from "@/app/member/coupon/utils";

export default function SuccessPage() {
  // 訂單資料送出／付款完成後，取消優惠券選用狀態
  useEffect(() => {
    clearSelectedCoupon();
  }, []);

  return (
    <>
      {/* 最外層淺灰底容器 */}
      <div className="min-h-[calc(100vh-160px)] w-full bg-slate-50 py-10 text-gray-800">
        {/* 核心主容器：最大寬度 1280px，mx-auto 負責在大螢幕下置中 */}
        <div className="mx-auto w-full max-w-7xl px-4">
          {/* ==================== 1. 頂部步驟進度條 (DaisyUI Steps) ==================== */}
          <div className="w-full flex justify-center mb-10">
            <ul className="steps id-steps w-full max-w-7xl text-sm grid grid-cols-3">
              <li className="step step-accent">填寫資料</li>
              <li className="step step-accent">選擇付款</li>
              <li className="step step-accent">完成付款</li>
            </ul>
          </div>

          {/* ==================== 2. 主要內容卡片區 ==================== */}
          {/* 對照設計圖，內容區塊靠左對齊，但限制最大寬度，避免在 1920 螢幕下文字拉得太散 */}
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            {/* 訂單編號與複製按鈕 */}
            <div className="flex items-center gap-2 pl-2 text-sm text-gray-500">
              <span>訂單編號：5439229639</span>
              {/* 複製小圖示，暫時用網頁符號代替 */}
              <button className="transition hover:text-gray-700 active:scale-95">
                🗐
              </button>
            </div>

            {/* 核心狀態灰色大卡片 */}
            <div className="rounded-2xl border border-gray-200/50 bg-gray-100/70 p-6">
              {/* 使用 DaisyUI 的 Timeline 垂直時間軸元件 */}
              <ul className="timeline timeline-vertical timeline-compact">
                {/* 節點 1：付款完成 */}
                <li>
                  <div className="timeline-middle text-success">
                    {/* 綠色圓圈打勾 */}
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
                  <hr className="bg-success" /> {/* 連接線變綠色 */}
                </li>

                {/* 節點 2：訂單確認中 */}
                <li>
                  <hr className="bg-success" />
                  <div className="timeline-middle text-success">
                    {/* 綠色時鐘圖示 */}
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
                      Klook！訂單正在處理中，訂單確認後，將傳送訂單詳情及憑證至
                      <span className="ml-1 font-medium text-gray-700">
                        a55******@gmail.com
                      </span>
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* 查看訂單按鈕 */}
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
