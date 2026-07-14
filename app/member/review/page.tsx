"use client";

export default function ReviewPage() {
  return (
    <div className="w-full text-gray-800">
      {/* 頁面大標題 */}
      <h3 className="mb-6 hidden pb-2 text-xl font-bold text-gray-700 md:flex">
        我的評價
      </h3>
      {/* ===== 上方未評論/已評論分頁標籤(DaisyUI) =====*/}
      <div className="tabs tabs-boxed mb-6 max-w-md bg-gray-100/80 p-1">
        <button className="tab tab-active flex-1 text-sm font-medium">
          未評論
        </button>
        <button className="tab flex-1 text-sm font-medium text-gray-400">
          已評論
        </button>
      </div>
      <p className="mb-6 pl-1 text-xs text-gray-400">
        請分享您的真實使用感受，幫助更多購物者做出選擇。
      </p>
      {/* ===== 主要評價核心區塊 ===== */}
      <div className="flex flex-col gap-6 rounded-xl border-gray-200 bg-white p-6 shadow-sm">
        {/* 商品小卡資訊 */}
        <div className="flex items-center justify-between rounded-xl border-gray-100 bg-gray-50/60 p-4">
          <div className="flex items-center gap-4">
            {/* 商品圖片 */}
            <div className="h-16 w-16 overflow-hidden rounded-lg border bg-gray-200">
              <img
                src="/images/experiences/bastille-market.jpg"
                alt="商品圖片"
                className="h-full w-full object-cover"
              />
            </div>

            {/* 商品文字 */}
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                澳洲島嶼海之旅(含午餐)
              </h4>
              <p className="mt-1 text-xs text-gray-400">
                訂單編號：#TW-20231084
              </p>
            </div>
          </div>

          {/* 已送達狀態小標籤 */}
          <span className="rounded bg-gray-200 px-2 py-0.5 text-[14px] font-medium text-gray-600">
            已送達
          </span>
        </div>

        {/* 商品評分(點擊星星評分) */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-gray-500">商品評分</span>
          <div className="flex items-center gap-3">
            <div className="rating rating-md gap-1">
              <input
                type="radio"
                name="rating-2"
                className="mask mask-star-2 bg-yellow-300"
              />
              <input
                type="radio"
                name="rating-2"
                className="mask mask-star-2 bg-yellow-300"
              />
              <input
                type="radio"
                name="rating-2"
                className="mask mask-star-2 bg-yellow-300"
              />
              <input
                type="radio"
                name="rating-2"
                className="mask mask-star-2 bg-yellow-300"
              />
              <input
                type="radio"
                name="rating-2"
                className="mask mask-star-2 bg-yellow-300"
              />
            </div>
          </div>
        </div>

        {/* 使用者心得輸入框 */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text text-xs font-bold text-gray-500">
              使用心得
            </span>
          </label>
          <textarea
            placeholder="分享您的使用心得，描述旅遊體驗過程..."
            className="textarea textarea-bordered focus:textarea-primary h-32 w-full bg-white text-sm text-gray-800 placeholder:text-gray-300"
          ></textarea>
        </div>

        {/* 上傳照片區 */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text text-xs font-bold text-gray-500">
              上傳照片
            </span>
          </label>
          <div className="mt-1 flex items-center gap-4">
            {/* 虛線夾帶上傳鈕 */}
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-400 transition hover:bg-gray-50">
              {/* 相機小圖示 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
              <span className="text-[11px]">上傳照片</span>
              <input type="file" className="hidden" accept="image/*" multiple />
            </label>
            {/* 上傳限制文字 */}
            <p className="text-[11px] leading-relaxed text-gray-400">
              最多可上傳 5 張圖片，支持 JPG、PNG 格式 (單張不超過 5MB)
            </p>
          </div>
        </div>

        {/* 區塊 E：右下角操作按鈕 */}
        <div className="mt-2 flex justify-end gap-3 border-t pt-4">
          <button className="btn btn-sm btn-outline rounded-lg border-gray-300 px-5 font-medium text-gray-600 hover:bg-gray-100">
            暫存草稿
          </button>
          <button className="btn btn-sm rounded-lg border-none bg-[#45cad5] px-5 font-medium text-white hover:bg-[#36b3be]">
            送出評價
          </button>
        </div>
      </div>

      {/* ==================== 3. 底部綠色提示說明條 ==================== */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-700 shadow-sm">
        {/* 綠色勾勾小圖示 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 flex-shrink-0 text-emerald-600"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
        <p className="leading-relaxed">
          <span className="font-bold">評價規範與獎勵：</span>
          撰寫超過 20 字並上傳商品照片的評價，審核通過後可獲得額外 100
          點會員積分獎勵。
        </p>
      </div>
    </div>
  );
}
