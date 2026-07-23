"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

type OrderDetail = {
  id: string;
  final_amount: number;
  original_amount: number;
  points_earned: number;
  items_summary: string;
};

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  // 管理選中的付款方式
  const [paymentMethod, setPaymentMethod] = useState<"ecpay" | "linepay">(
    "ecpay",
  );
  // 管理是否同意條款 (這才是真正的 checkbox)
  const [isAgreed, setIsAgreed] = useState(false);
  // 載入與訂單資料 State
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetail | null>(null);

  // 🚀 關鍵：根據 URL 的 order_id 向後端撈取真實金額與商品名稱
  useEffect(() => {
    if (!orderId) {
      toast.error("找不到訂單編號，請重新進行結帳！");
      router.push("/cart");
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/checkout/order/${orderId}`,
          { credentials: "include" },
        );
        const result = await response.json();

        if (result.success) {
          setOrder(result.order);
        } else {
          toast.error("讀取訂單資料失敗！");
        }
      } catch (error) {
        console.error("取得訂單失敗:", error);
        toast.error("無法連線至伺服器！");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handlePayment = async () => {
    if (!isAgreed) {
      toast.error("請先勾選同意服務條款與隱私權");
      return;
    }

    if (!order) {
      toast.error("訂單資料異常，無法進行付款");
      return;
    }

    // 🚀 動態拿到後端真實訂單金額與商品名稱
    const amount = order.final_amount;
    const items = order.items_summary || "行程體驗商品";

    // 🌟 狀況 A：如果使用者選 LINE Pay
    if (paymentMethod === "linepay") {
      try {
        // 先用 fetch 拿到 LINE Pay 的跳轉網址
        const response = await fetch(
          `http://localhost:3001/linepay/reserve?amount=${amount}&items=${encodeURIComponent(items)}&order_id=${order.id}`
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
      window.location.href = `http://localhost:3001/ecpay?amount=${amount}&items=${encodeURIComponent(items)}&order_id=${order.id}&method=${paymentMethod}`;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4">
        <span className="loading loading-spinner loading-lg text-secondary"></span>
        <p className="animate-pulse font-medium text-gray-500">
          正在準備您的付款訂單...
        </p>
      </div>
    );
  }

  const finalAmount = order?.final_amount || 0;
  const earnedMCoins = order?.points_earned || 0;

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
                  <span>我了解並同意 MeetLocals 服務條款與隱私權</span>
                </label>

                {/* 右側：金額顯示與確認付款按鈕 */}
                <div className="flex flex-col items-center gap-2 md:items-end">
                  <span className="text-xl font-bold text-cyan-500">
                    NT$ {finalAmount.toLocaleString()}
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
                  訂單編號：{order?.id || "載入中..."}
                </h3>
                <p className="mb-4 text-xs text-gray-400">
                  {order?.items_summary || "精選行程預訂"}
                </p>

                {/* 明細清單 */}
                <div className="my-4 flex flex-col gap-2 border-t border-b py-4 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>訂單狀態</span>
                    <span className="font-bold text-emerald-600">待付款</span>
                  </div>
                  <div className="flex justify-between">
                    <span>商品原始總額</span>
                    <span>
                      NT${" "}
                      {(order?.original_amount || finalAmount).toLocaleString()}
                    </span>
                  </div>

                  {/* 顯示總折抵金額 */}
                  {order?.original_amount &&
                    order.original_amount > finalAmount && (
                      <div className="flex justify-between font-medium text-emerald-600">
                        <span>專屬優惠折抵</span>
                        <span>
                          -NT${" "}
                          {(
                            order.original_amount - finalAmount
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}

                  <div className="mt-2 flex justify-between border-t pt-2 font-bold text-gray-800">
                    <span>應付總額</span>
                    <span>NT$ {finalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>實付總價</span>
                  <span className="text-sm font-black text-cyan-600">
                    NT$ {finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 💰 第二塊卡片：最終付款與 M 幣回饋 */}
              <div className="flex w-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-2 p-6">
                  <div className="flex items-center justify-between text-lg font-bold text-cyan-500">
                    <span>總計付款</span>
                    <span>NT$ {finalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* 下半部：M 幣提示框 */}
                <div className="m-4 mt-0 justify-center rounded-lg border border-cyan-100 bg-cyan-50/60 p-3 text-xs text-cyan-600">
                  <p className="text-center">
                    付款完成可獲得{" "}
                    <span className="font-bold text-orange-500">
                      {order?.points_earned ?? Math.round(finalAmount * 0.01)}
                    </span>{" "}
                    M幣
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
