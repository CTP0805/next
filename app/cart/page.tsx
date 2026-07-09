"use client";

import { useState } from "react";

//======定義前端假資料=============
const initialCartItems = [
  {
    id: 1,
    title: "澳洲島嶼海之旅(含午餐)",
    date: "2026年5月20日",
    spec: "成人",
    price: 8000,
    quantity: 1,
    image: "/images/experiences/bastille-market.jpg",
  },
  {
    id: 2,
    title: "濟州島9.81 Park門票",
    date: "2026年7月1日",
    spec: "2人賽車套票",
    price: 1131,
    quantity: 2,
    image: "/images/experiences/montmartre-art.jpg",
  },
];
export default function CartPage() {
  //===== 使用useState 管理購物車內容 ======//
  const [cartItems, setCartItems] = useState(initialCartItems);
  //計算總金額公式
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <>
      <div>header</div>

      {/* ======= 三元運算 判斷購物車有無商品====== */}
      {cartItems.length > 0 ? (
        /* 購物車有商品介面 */
        <div className="min-h-[calc(100vh-160px)] w-full bg-slate-300 py-10">
          {/* 限制最大寬度1280px */}
          <div className="mx-auto w-full max-w-7xl bg-white px-4">
            {/* 上方購物區 */}
            <div className="flex flex-col items-start gap-8 lg:flex-row">
              {/* 左側欄位 */}
              <div className="w-full rounded-lg bg-white p-6 shadow-sm lg:flex-[2]">
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="check checkbox-primary checkbox-sm"
                    />
                    <span>全選</span>
                  </label>
                  <button className="btn btn-outline btn-sm">
                    刪除選中活動
                  </button>
                </div>
                {/* 🚀 關鍵改動：使用 map 方法去循環 initialCartItems 假資料 */}
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b py-4 last:border-0"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                    />

                    {/* 這裡改成讀取真正的 item.image */}
                    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-200 text-xs text-gray-400">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "商品圖片"
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-800">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-gray-400">{item.date}</p>
                      <span className="badge badge-ghost badge-sm mt-2">
                        {item.spec}
                      </span>
                    </div>

                    {/* 數量按鈕 */}
                    <div className="flex items-center gap-2">
                      <button className="btn btn-xs btn-outline">-</button>
                      <span className="px-2 font-medium">{item.quantity}</span>
                      <button className="btn btn-xs btn-outline">+</button>
                    </div>

                    <div className="min-w-[80px] text-right font-bold text-gray-800">
                      {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* 右側欄位 */}
              <div className="w-full rounded-lg bg-white p-6 shadow-sm lg:flex-[1]">
                <p className="mb-1 text-xs text-gray-500">
                  {cartItems.length}件項目
                </p>
                <div className="mb-1 text-xl font-medium text-gray-700">
                  NT$ {totalAmount.toLocaleString()}
                </div>
                <button className="btn w-full border-none bg-[#45cad5] text-white hover:bg-[#36b3be]">
                  結帳
                </button>
                <p className="mt-2 text-center text-xs text-cyan-500">
                  你可獲得 10 積分
                </p>
              </div>
            </div>

            {/* 下方推薦商品區 */}
            <div className="mt-16">
              <h3 className="mb-6 border-l-4 border-red-500 pl-3 text-xl font-bold text-gray-800">
                其他旅人也買了...
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="overflow-hidden rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-2 h-40 rounded-md bg-gray-200"></div>
                <span className="text-xs text-gray-400">韓國 濟州</span>
                <h5 className="mt-1 text-sm font-bold text-gray-800">
                  濟州島9.81 Park門票
                </h5>
                <p className="mt-3 text-sm font-bold text-gray-800">
                  NT$ 714 起
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /*購物車空介面 */
        <div className="flex w-full flex-col items-center justify-center bg-white py-16">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center bg-white px-4">
            <div>
              <img
                src="/cat-cart.jpg"
                alt="購物車空空的"
                className="mx-auto h-auto w-48 object-contain"
              />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-700">
              購物車空空的
            </h3>
            <p className="mb-8 cursor-pointer text-base text-teal-500">
              馬上選購你喜歡的商品吧！
            </p>
          </div>
        </div>
      )}
      <div>footer</div>
    </>
  );
}
