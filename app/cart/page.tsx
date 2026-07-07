"use client";

export default function Page() {
  return (
    <>
      <div>header</div>
      {/*購物車空介面
      <div className="w-full bg-white flex flex-col justify-center items-center py-16">
        <div className="w-full bg-white max-w-7xl mx-auto px-4 flex flex-col justify-center items-center">
          <div>
            <img
              src="/cat-cart.jpg"
              alt="購物車空空的"
              className="w-48 h-auto object-contain mx-auto"
            />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            購物車空空的
          </h3>
          <p className="text-base text-teal-500 mb-8 cursor-pointer">
            馬上選購你喜歡的商品吧！
          </p>
        </div>
      </div>
       */}

      {/* 購物車有商品介面 */}
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
                <button className="btn btn-outline btn-sm">刪除選中活動</button>
              </div>
              {/* 單一商品項目 */}
              <div className="flex items-center gap-4 border-b py-4 last:border-0">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                />

                {/* 假圖片方塊，你可以把它換成 <img src="..." /> */}
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-md bg-gray-200 text-xs text-gray-400">
                  商品圖片
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800">
                    澳洲島嶼海之旅 (含午餐)
                  </h4>
                  <p className="mt-1 text-xs text-gray-400">2026年5月20日</p>
                  <span className="badge badge-ghost badge-sm mt-2">成人</span>
                </div>

                {/* 數量按鈕 */}
                <div className="flex items-center gap-2">
                  <button className="btn btn-xs btn-outline">-</button>
                  <span className="px-2 font-medium">1</span>
                  <button className="btn btn-xs btn-outline">+</button>
                </div>

                <div className="min-w-[80px] text-right font-bold text-gray-800">
                  NT$ 2,325
                </div>
              </div>
            </div>

            {/* 右側欄位 */}
            <div className="w-full rounded-lg bg-white p-6 shadow-sm lg:flex-[1]">
              <p className="mb-1 text-xs text-gray-500">2件項目</p>
              <div className="mb-1 text-xl font-medium text-gray-700">
                NT$ 3,466
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
              <p className="mt-3 text-sm font-bold text-gray-800">NT$ 714 起</p>
            </div>
          </div>
        </div>
      </div>

      <div>footer</div>
    </>
  );
}
