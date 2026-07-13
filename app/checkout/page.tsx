"use client";
import Link from 'next/link';

export default function CheckPage() {
  return (
<>
      {/* 最外層淺灰底容器 */}
      <div className="w-full bg-slate-50 min-h-[calc(100vh-160px)] py-10">
        
        {/* 核心主容器：最大寬度 1280px，mx-auto 負責在大螢幕下置中 */}
        <div className="w-full max-w-[1280px] mx-auto px-4">
          
          {/* ==================== 1. 頂部步驟進度條 (DaisyUI Steps) ==================== */}
          <div className="w-full flex justify-center mb-10">
            <ul className="steps id-steps w-full max-w-7xl text-sm grid grid-cols-3">
              <li className="step step-accent">填寫資料</li>
              <li className="step">選擇付款</li>
              <li className="step">完成付款</li>
            </ul>
          </div>

          {/* ==================== 2. 主要兩欄式排版 ==================== */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* 【左欄：表單與預訂資料區】 寬度佔 2/3 */}
            <div className="w-full lg:flex-[2] flex flex-col gap-6">
              
              {/* 區塊 A：預訂資料摘要 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-teal-500 pl-2">預訂資料</h3>
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0">
                    {/* 這裡之後換成火車/膠囊列車圖片 */}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">釜山海雲台藍線公園 - 膠囊列車及海岸列車車票</h4>
                    <p className="text-xs text-gray-400 mt-1">天空膠囊列車 (青沙浦至尾浦) - 2人</p>
                  </div>
                </div>
              </div>

              {/* 區塊 B：聯絡資料 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2 border-l-4 border-teal-500 pl-2">聯絡資料</h3>
                <p className="text-xs text-gray-400 mb-4">如訂單有變動，我們將通知您</p>
                
                {/* 常用聯絡人快速按鈕 */}
                <div className="flex gap-2 flex-wrap mb-6">
                  <button className="btn btn-sm btn-primary text-white">楊博惟</button>
                </div>

                {/* 已有聯絡人資訊小卡 */}
                <div className="border rounded-lg p-4 mb-6 text-sm text-gray-700 flex justify-between items-start bg-gray-50/50">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    <div className="text-gray-400">姓</div><div>YANG</div>
                    <div className="text-gray-400">名</div><div>PO WEI</div>
                    <div className="text-gray-400">手機號碼</div><div></div>
                    <div className="text-gray-400">電子信箱</div><div>a55664668@gmail.com</div>
                  </div>
                  <button className="text-xs text-teal-500 font-medium hover:underline">編輯</button>
                </div>

                {/* 新增聯絡人表單輸入區 - 加上了 p-6 與 rounded-lg 讓內距更完美 */}
                <div className="bg-orange-50/60 rounded-lg p-6 border border-orange-100">
                  <h4 className="font-bold text-gray-800 text-sm mb-4">新增聯絡資料</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 姓氏 */}
                    <div className="form-control w-full">
                      <label className="label py-1"><span className="label-text font-medium text-gray-600">姓 <span className="text-error">*</span></span></label>
                      <input type="text" placeholder="請輸入英文 (例：WANG)" className="input input-bordered input-sm w-full bg-white text-gray-800" />
                    </div>
                    
                    {/* 名字 */}
                    <div className="form-control w-full">
                      <label className="label py-1"><span className="label-text font-medium text-gray-600">名 <span className="text-error">*</span></span></label>
                      <input type="text" placeholder="請輸入英文 (例：SIAOMING)" className="input input-bordered input-sm w-full bg-white text-gray-800" />
                    </div>

                    {/* 手機號碼 - 加上 items-center 確保下拉選單與輸入框完美平行 */}
                    <div className="form-control w-full md:col-span-2">
                      <label className="label py-1"><span className="label-text font-medium text-gray-600">手機號碼 <span className="text-error">*</span></span></label>
                      <div className="flex gap-2 items-center">
                        <select className="select select-bordered select-sm bg-white text-gray-800 min-w-[100px]">
                          <option>請選擇</option>
                          <option>+886</option>
                        </select>
                        <input type="text" placeholder="請輸入手機號碼" className="input input-bordered input-sm flex-1 bg-white text-gray-800" />
                      </div>
                    </div>

                    {/* 電子信箱 */}
                    <div className="form-control w-full md:col-span-2">
                      <label className="label py-1"><span className="label-text font-medium text-gray-600">電子信箱 <span className="text-error">*</span></span></label>
                      <input type="email" placeholder="請輸入電子信箱" className="input input-bordered input-sm w-full bg-white text-gray-800" />
                    </div>
                  </div>

                  {/* 按鈕操作 */}
                  <div className="flex justify-end gap-2 mt-6">
                    <button className="btn btn-sm btn-ghost text-gray-500">取消</button>
                    <button className="btn btn-sm bg-[#45cad5] hover:bg-[#36b3be] text-white border-none px-6">儲存</button>
                  </div>
                </div>
              </div>

              {/* 區塊 C：優惠折扣 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-teal-500 pl-2">優惠折扣</h3>
                <div className="flex flex-col gap-3 text-sm text-gray-500">
                  <div className="flex justify-between"><span>平台優惠碼</span><span>不適用</span></div>
                  <div className="flex justify-between"><span>付款優惠</span><span>不適用</span></div>
                  <div className="flex justify-between"><span>酷幣使用</span><span>不適用</span></div>
                </div>
                <p className="text-xs text-gray-400 mt-4">此訂單無法適用優惠碼</p>
              </div>

              {/* 底部提示文字與主要按鈕 */}
              <div className="bg-orange-50 text-orange-600 p-4 rounded-lg text-xs font-medium border border-orange-100">
                請確認資料填寫無誤，訂單送出後可能無法變更
              </div>
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border lg:bg-transparent lg:shadow-none lg:border-none lg:p-0">
                <span className="text-xs text-gray-500 lg:w-2/3">前往付款後，訂單即送出，請於下一步選擇付款方式</span>
                <Link href="/payment/">
                <button className="btn bg-[#45cad5] hover:bg-[#36b3be] text-white border-none px-10">
                  前往付款
                </button>
                </Link>
              </div>

            </div>

            {/* 【右欄：訂單明細摘要卡片】 加上了 sticky top-4 固頂效果 */}
            <div className="w-full lg:flex-[1] bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-4 text-gray-800">
              <h3 className="font-bold text-sm mb-2">釜山海雲台藍線公園 - 膠囊列車及海岸列車車票</h3>
              <p className="text-xs text-gray-400 mb-4">天空膠囊列車 (青沙浦至尾浦) - 2人</p>
              
              <div className="border-t border-b py-4 my-4 text-xs flex flex-col gap-2 text-gray-600">
                <div className="flex justify-between"><span>日期</span><span>2026年7月21日</span></div>
                <div className="flex justify-between"><span>數量</span><span>10:30 - 11:00 × 1</span></div>
              </div>

              <div className="flex justify-between items-center text-sm font-bold mb-2">
                <span>總價</span>
                <span>NT$ 1,034</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-orange-500 border-t pt-4">
                <span>付款金額</span>
                <span>NT$ 1,034</span>
              </div>

              {/* 酷幣回饋提示 */}
              <div className="mt-6 bg-cyan-50/60 p-3 rounded-lg text-xs text-cyan-600 border border-cyan-100">
                <span className="font-bold">Klook 酷幣</span>
                <p className="mt-1">享以下額度折扣回饋：</p>
                <div className="mt-2">
                  <span className="badge badge-info text-white badge-sm">≈ NT$ 1</span> 
                  <span className="text-gray-400 ml-1">(3 Klook 酷幣)</span>
                </div>
                <p className="text-gray-400 text-[10px] mt-2">下次消費使用酷幣輕鬆折抵！</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
