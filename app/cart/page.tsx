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
      <div className="w-full bg-slate-300 min-h-[calc(100vh-160px)] py-10">
        {/* 限制最大寬度1280px */}
        <div className="w-full bg-white max-w-7xl mx-auto px-4 ">
          {/* 上方購物區 */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* 左側欄位 */}
            <div className="w-full lg:flex-[2] bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="check checkbox-primary checkbox-sm"
                  />
                  <span>全選</span>
                </label>
                <button className="btn btn-outline btn-sm">刪除選中活動</button>
              </div>
              {/* 單一商品項目 */}
              <div className="flex gap-4 py-4 border-b last:border-0 items-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                />

                {/* 假圖片方塊，你可以把它換成 <img src="..." /> */}
                <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                  商品圖片
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">
                    澳洲島嶼海之旅 (含午餐)
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">2026年5月20日</p>
                  <span className="badge badge-ghost badge-sm mt-2">成人</span>
                </div>

                {/* 數量按鈕 */}
                <div className="flex items-center gap-2">
                  <button className="btn btn-xs btn-outline">-</button>
                  <span className="px-2 font-medium">1</span>
                  <button className="btn btn-xs btn-outline">+</button>
                </div>

                <div className="text-right font-bold text-gray-800 min-w-[80px]">
                  NT$ 2,325
                </div>
              </div>
            </div>

            {/* 右側欄位 */}
            <div className="w-full lg:flex-[1] bg-white rounded-lg p-6 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">2件項目</p>
              <div className="text-gray-700 font-medium text-xl mb-1">
                NT$ 3,466
              </div>
              <button className="btn w-full text-white bg-[#45cad5] hover:bg-[#36b3be] border-none">
                結帳
              </button>
              <p className="text-xs text-cyan-500 mt-2 text-center">
                你可獲得 10 積分
              </p>
            </div>
          </div>

          {/* 下方推薦商品區 */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-red-500 pl-3">
              其他旅人也買了...
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-white rounded-lg overflow-hidden shadow-sm p-4">
              <div className="h-40 bg-gray-200 rounded-md mb-2"></div>
              <span className="text-xs text-gray-400">韓國 濟州</span>
              <h5 className="font-bold text-sm text-gray-800 mt-1">
                濟州島9.81 Park門票
              </h5>
              <p className="font-bold text-gray-800 mt-3 text-sm">NT$ 714 起</p>
            </div>

             <div className="bg-white rounded-lg overflow-hidden shadow-sm p-4">
              <div className="h-40 bg-gray-200 rounded-md mb-2"></div>
              <span className="text-xs text-gray-400">韓國 濟州</span>
              <h5 className="font-bold text-sm text-gray-800 mt-1">
                濟州島9.81 Park門票
              </h5>
              <p className="font-bold text-gray-800 mt-3 text-sm">NT$ 714 起</p>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm p-4">
              <div className="h-40 bg-gray-200 rounded-md mb-2"></div>
              <span className="text-xs text-gray-400">韓國 濟州</span>
              <h5 className="font-bold text-sm text-gray-800 mt-1">
                濟州島9.81 Park門票
              </h5>
              <p className="font-bold text-gray-800 mt-3 text-sm">NT$ 714 起</p>
            </div>

             <div className="bg-white rounded-lg overflow-hidden shadow-sm p-4">
              <div className="h-40 bg-gray-200 rounded-md mb-2"></div>
              <span className="text-xs text-gray-400">韓國 濟州</span>
              <h5 className="font-bold text-sm text-gray-800 mt-1">
                濟州島9.81 Park門票
              </h5>
              <p className="font-bold text-gray-800 mt-3 text-sm">NT$ 714 起</p>
            </div>

             <div className="bg-white rounded-lg overflow-hidden shadow-sm p-4">
              <div className="h-40 bg-gray-200 rounded-md mb-2"></div>
              <span className="text-xs text-gray-400">韓國 濟州</span>
              <h5 className="font-bold text-sm text-gray-800 mt-1">
                濟州島9.81 Park門票
              </h5>
              <p className="font-bold text-gray-800 mt-3 text-sm">NT$ 714 起</p>
            </div>

             <div className="bg-white rounded-lg overflow-hidden shadow-sm p-4">
              <div className="h-40 bg-gray-200 rounded-md mb-2"></div>
              <span className="text-xs text-gray-400">韓國 濟州</span>
              <h5 className="font-bold text-sm text-gray-800 mt-1">
                濟州島9.81 Park門票
              </h5>
              <p className="font-bold text-gray-800 mt-3 text-sm">NT$ 714 起</p>
            </div>

             <div className="bg-white rounded-lg overflow-hidden shadow-sm p-4">
              <div className="h-40 bg-gray-200 rounded-md mb-2"></div>
              <span className="text-xs text-gray-400">韓國 濟州</span>
              <h5 className="font-bold text-sm text-gray-800 mt-1">
                濟州島9.81 Park門票
              </h5>
              <p className="font-bold text-gray-800 mt-3 text-sm">NT$ 714 起</p>
            </div>

             <div className="bg-white rounded-lg overflow-hidden shadow-sm p-4">
              <div className="h-40 bg-gray-200 rounded-md mb-2"></div>
              <span className="text-xs text-gray-400">韓國 濟州</span>
              <h5 className="font-bold text-sm text-gray-800 mt-1">
                濟州島9.81 Park門票
              </h5>
              <p className="font-bold text-gray-800 mt-3 text-sm">NT$ 714 起</p>
            </div> 
          </div>
          
        </div>
      </div>

      <div>footer</div>
    </>
  );
}
