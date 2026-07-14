"use client";

//==========訂單假資料==============//
const initialOrders = [
  {
    id: "order-001",
    type: "ticket",
    title: "法國巴黎鐵塔一日遊",
    details: [
      { label: "方案", value: "快速野餐美食饗宴" },
      { label: "日期", value: "2026-09-10" },
      { label: "數量", value: "每人 x 2 " },
    ],
    price: 11849,
    status: "訂單已確認",
    image: "/images/experiences/bastille-market.jpg",
  },
  {
    id: "order-002",
    type: "ticket",
    title: "挪威看哈蘭德踢球",
    details: [
      { label: "方案", value: "去看魔人普烏踢球" },
      { label: "日期", value: "2026-09-15" },
      { label: "數量", value: "每人 x 2 " },
    ],
    price: 8888,
    status: "訂單已確認",
    image: "/images/experiences/montmartre-art.jpg",
  },
];

export default function OrderPage() {
  return (
    <>
      {/* 訂單無商品介面 */}
      {/* <div className="w-full text-gray-800">
            <h3 className="texl-xl font-bold mb-4">我的訂單</h3>
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text=gray-400 text-sm">目前暫無訂單</p>
            </div>
          </div> */}

      {/* 訂單有商品 */}
      <div className="w-full text-gray-800">
        {/* 頁面大標題 */}
        <h3 className="mb-6 hidden border-b pb-3 text-lg font-bold text-gray-700 md:flex">
          歷史訂單
        </h3>
        {/* 訂單列表容器 */}
        <div className="flex flex-col gap-6">
          {/* =========== 使用map渲染訂單 ===========*/}
          {initialOrders.map((order) => (
            <div
              key={order.id}
              className="flex w-full flex-col items-start justify-between gap-6 rounded-xl border border-dashed border-gray-300 bg-white p-6 shadow-sm transition hover:shadow-md sm:flex-row sm:items-stretch"
            >
              {/* 【左側資訊區】：佔據主要空間 (flex-1) */}
              <div className="flex flex-1 flex-col gap-3">
                {/* 產品標題與小標誌 */}
                <div className="flex items-center gap-2">
                  {/* 根據型態顯示不同的小 icon，這裡先簡單用文字符號或顏色區分，你可以換成 React Icons */}
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-gray-600">
                    {order.type === "ticket" ? "🎟️ 景點" : order.type}
                  </span>
                  <h4 className="text-base leading-snug font-bold text-gray-900">
                    {order.title}
                  </h4>
                </div>

                {/* 詳細細節列表 */}
                <div className="flex flex-col gap-1 border-l-2 border-gray-100 pl-2 text-xs text-gray-500">
                  {order.details.map((detail, idx) => (
                    <p key={idx}>
                      <span className="mr-1 font-medium text-gray-400">
                        {detail.label}：
                      </span>
                      {detail.value}
                    </p>
                  ))}
                </div>

                {/* 金額顯示 */}
                <div className="mt-2 text-sm font-bold text-gray-800">
                  <span>實付金額：</span>
                  <span className="text-base text-gray-900">
                    NT$ {order.price.toLocaleString()}
                  </span>
                </div>

                {/* 綠色狀態標籤 */}
                <div className="mt-1">
                  <span className="mr-2 text-sm font-bold text-gray-800">
                    {" "}
                    訂單編號：{order.id}
                  </span>

                  <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                    {order.status}
                  </span>
                </div>

                {/* 查看憑證按鈕 (DaisyUI btn-outline) */}
                <div className="mt-3">
                  <button className="btn btn-sm btn-outline rounded-lg border-gray-300 px-4 font-medium text-gray-700 hover:bg-gray-50">
                    訂單憑證
                  </button>
                </div>
              </div>

              {/* 【右側右方區塊】：固定寬度，放圖片與評價按鈕 */}
              <div className="flex w-full flex-shrink-0 flex-col items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:w-40 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
                {/* 商品主圖 */}
                <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border bg-gray-100 text-xs text-gray-400">
                  {order.image ? (
                    <img
                      src={order.image}
                      alt="商品圖片"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "無圖片"
                  )}
                </div>

                {/* 立即評價連結按鈕 */}
                <button className="cursor-pointer text-xs font-medium text-gray-400 underline underline-offset-4 transition hover:text-cyan-500">
                  立即評價
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
