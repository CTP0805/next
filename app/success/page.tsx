"use client";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const { auth } = useAuth();

  // 綠界回傳的單號參數叫 MerchantTradeNo，我們自己的叫 order_id
  const orderId =
    searchParams.get("order_id") ||
    searchParams.get("MerchantTradeNo") ||
    "";

   // 精準判斷：預設一律為信用卡 credit_card，只有明確含有 line 或 transactionId 才是 LINE Pay
  const rawPaymentParam = searchParams.get("payment_method") || "";
  const transactionId = searchParams.get("transactionId"); // LINE Pay 特有參數
  const paymentMethod = 
    rawPaymentParam.toLowerCase().includes("line") || transactionId
      ? "line_pay"
      : "credit_card";

    const [contactEmail, setContactEmail] = useState<string>("");
  
    useEffect(() => {
    if (orderId) {
      // 進入成功頁時，通知後端把訂單改為 paid 並發放 M 幣
      fetch(`http://localhost:3001/api/checkout/pay-success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_id: orderId , payment_method: paymentMethod}),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.email) {
            setContactEmail(result.email);
          }
        })
        .catch((err) => console.error("更新訂單付款狀態失敗:", err));
    }
  }, [orderId]);

  // 複製訂單編號功能
  const handleCopy = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      toast.success("已複製訂單編號！");
    } else {
      toast.error("尚無可複製的訂單編號");
    }
  };


  return (
    <>
      {/* 最外層淺灰底容器 */}
      <div className="min-h-[calc(100vh-160px)] w-full py-10 text-gray-800">
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
              <span>訂單編號：{orderId || "載入中..."}</span>
              {/* 複製小圖示，暫時用網頁符號代替 */}
              <button onClick={handleCopy}
                className="transition hover:text-gray-700 active:scale-95"
                title="複製訂單編號">   
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
                      感謝使用 MeetLocals！訂單正在處理中，訂單確認後，將傳送訂單詳情及憑證至
                      <span className="ml-1 font-medium text-gray-700">
                        {contactEmail || auth.email || "您的電子信箱"}
                      </span>
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* 查看訂單按鈕 */}
            <div className="mt-4">
            <Link href="/member/order">
              <button className="button-white text-sm px-6 py-2">
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
