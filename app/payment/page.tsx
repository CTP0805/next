"use client";

import { useState } from "react";
import { clearSelectedCoupon } from "@/app/member/coupon/utils";
import { getApiServer } from "@/config/api-path";

export default function PaymentPage() {
  // 管理選中的付款方式
  const [paymentMethod, setPaymentMethod] = useState<"ecpay" | "linepay">(
    "ecpay",
  );
  // 管理是否同意條款 (這才是真正的 checkbox)
  const [isAgreed, setIsAgreed] = useState(false);

  const handlePayment = async () => {
    if (!isAgreed) {
      alert("請先勾選同意服務條款與隱私權");
      return;
    }

    const amount = 923; // 畫面上的總計金額
    const items = "濟州島9.81 Park門票"; // 右欄的商品名稱

    // 🌟 狀況 A：如果使用者選 LINE Pay
    if (paymentMethod === "linepay") {
      try {
        // 先用 fetch 拿到 LINE Pay 的跳轉網址
        const response = await fetch(
          `http://localhost:3001/linepay/reserve?amount=${amount}&items=${encodeURIComponent(items)}`,
        );
        const result = await response.json();

        if (result.success && result.paymentUrl) {
          // 拿到網址，前端直接轉跳到 LINE Pay 付款畫面！
          window.location.href = result.paymentUrl;
        } else {
          alert("啟動 LINE Pay 失敗：" + result.message);
        }
      } catch (error) {
        alert("連線後端 LINE Pay 失敗");
      }
      return; // 結束執行
    }

    // 🌟 狀況 B：如果使用者選信用卡
    if (paymentMethod === "ecpay") {
      // 直接導向後端 Express 的 Port 3001 的 /ecpay 路由
      window.location.href = `http://localhost:3001/ecpay?amount=${amount}&items=${encodeURIComponent(items)}&method=${paymentMethod}`;
    }
  };

  return (
    <>
      {/* 最外層淺灰底容器 */}
      <div className="min-h-[calc(100vh-160px)] w-full bg-slate-50 py-10 text-gray-800">
        {/* 核心主容器：最大寬度 1280px，mx-auto 負責在大螢幕下置中 */}
        <div className="mx-auto w-full max-w-[1280px] px-4">
          {/* ==================== 1. 頂部步驟進度條 (DaisyUI Steps) ==================== */}
          <div className="mb-10 flex w-full justify-center">
            <ul className="steps grid w-full max-w-7xl grid-cols-3 text-sm">
              <li className="step step-accent">填寫資料</li>
              <li className="step step-accent">選擇付款</li>
              <li className="step">完成付款</li>
            </ul>
          </div>

          {/* ==================== 2. 主要兩欄式排版 ==================== */}
          <div className="flex flex-col items-start gap-8 lg:flex-row">
            {/* 【左欄：選擇付款方式與同意條款】 寬度佔 2/3 */}
            <div className="flex w-full flex-col gap-6 lg:flex-[2]">
              {/* 區塊 A：選擇付款方式卡片 */}
              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                  {/* 選項 1：信用卡/記帳卡 */}
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-transparent p-4 text-gray-800 transition hover:border-black hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      {/* 修正：type 改為 radio */}
                      <input
                        type="radio"
                        name="payment-method"
                        className="radio radio-error radio-sm"
                        checked={paymentMethod === "ecpay"}
                        onChange={() => setPaymentMethod("ecpay")}
                      />
                      <span className="text-sm font-medium">信用卡/記帳卡</span>
                    </div>
                  </label>

                  {/* 選項 2：LINE Pay */}
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-transparent p-4 text-gray-800 transition hover:border-black hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      {/* 修正：type 改為 radio */}
                      <input
                        type="radio"
                        name="payment-method"
                        className="radio radio-error radio-sm"
                        checked={paymentMethod === "linepay"}
                        onChange={() => setPaymentMethod("linepay")}
                      />
                      <span className="text-sm font-medium">LINE Pay</span>
                    </div>
                    <span className="rounded bg-[#00c300] px-2 py-1 text-[10px] font-bold text-white">
                      LINE Pay
                    </span>
                  </label>
                </div>
              </div>

              {/* 區塊 B：同意條款與確認付款大方塊 */}
              <div className="flex flex-col items-center justify-between gap-6 rounded-lg border border-gray-100 bg-white p-8 shadow-sm md:flex-row">
                {/* 左側：隱私權條款勾選說明 */}
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                  {/* 修正：條款同意應該是 checkbox 樣式，這裡改回 checkbox 確保勾選視覺 */}
                  <input
                    type="checkbox"
                    name="agreement"
                    className="checkbox checkbox-error checkbox-sm rounded"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                  />
                  <span>我了解並同意C旅服務條款與隱私權</span>
                </label>

                {/* 右側：金額顯示與確認付款按鈕 */}
                <div className="flex flex-col items-center gap-2 md:items-end">
                  <span className="text-xl font-bold text-cyan-500">
                    NT$ 923
                  </span>
                  <button
                    onClick={handlePayment}
                    className="btn border-none bg-[#45cad5] px-10 text-white hover:bg-[#36b3be]"
                  >
                    確認付款
                  </button>
                </div>
              </div>
            </div>

            {/* 【右欄：訂單明細摘要卡片】 寬度佔 1/3 */}
            <div className="sticky top-4 flex w-full flex-col gap-4 text-gray-800 lg:flex-[1]">
              {/* 📋 第一塊卡片：商品詳細內容明細 */}
              <div className="w-full rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-sm font-bold text-gray-800">
                  濟州島9.81 Park門票
                </h3>
                <p className="mb-4 text-xs text-gray-400">
                  【早鳥】2人賽車遊玩套票（1成人 + 1兒童）
                </p>

                {/* 詳細行程與小計 */}
                <div className="my-4 flex flex-col gap-2 border-t border-b py-4 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>日期</span>
                    <span>2026年7月1日 9:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>數量</span>
                    <span>1 × 2人（成人 + 兒童）</span>
                  </div>
                  <div className="mt-2 flex justify-between font-medium text-gray-700">
                    <span>小計</span>
                    <span>NT$ 923</span>
                  </div>
                </div>

                {/* 上卡片底部總價 */}
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>總價</span>
                  <span>NT$ 923</span>
                </div>
              </div>

              {/* 💰 第二塊卡片：金額總計與大傻幣回饋 (複製 Klook 獨立底色區塊結構) */}
              <div className="flex w-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                {/* 金額計算區 */}
                <div className="flex flex-col gap-2 p-6">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>小計</span>
                    <span>NT$ 923</span>
                  </div>
                  {/* 保留你原本的總計名稱與專屬 cyan 藍綠色大字體！ */}
                  <div className="mt-1 flex items-center justify-between border-t pt-4 text-lg font-bold text-cyan-500">
                    <span>總計</span>
                    <span>NT$ 923</span>
                  </div>
                </div>

                {/* 下半部：大傻幣提示框 (獨立出一條灰色底色背景區塊，更像官方 Klook 付款頁) */}
                <div className="mt-6 rounded-lg border border-cyan-100 bg-cyan-50/60 p-3 text-xs text-cyan-600 justify-center">
                  <p className="text-center">
                    你可獲得{" "}
                    <span className="font-bold text-orange-500">3</span> M幣
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
