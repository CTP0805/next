export default function Content() {
  return (
    <>
      {/* Banner - 已調整長寬與定位，支援您的底圖 */}
      <div className="relative h-[188px] w-full overflow-hidden rounded-t-3xl bg-[#00B4D8]">
        {/* 套用底圖時請加上：bg-[url('/your-banner.png')] bg-cover bg-center */}

        {/* 優幣詳情 - 右上角定位 */}
        <a
          href="../points"
          className="absolute top-4 right-6 text-sm font-medium text-white/90 transition-colors hover:text-white"
        >
          優幣詳情
        </a>

        {/* 置中內容區 */}
        <div className="flex h-full flex-col items-center justify-center text-white">
          <h1 className="text-[68px] leading-none font-bold tracking-[-1.5px]">
            0
          </h1>
          <p className="mt-2 max-w-[260px] text-center text-sm">
            累積10優幣，即可折抵下次消費金額
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white px-5 text-sm">
        <button className="border-b-[3px] border-emerald-500 px-5 py-3 font-medium text-emerald-600">
          全部
        </button>
        <button className="px-5 py-3 font-medium text-gray-500 hover:text-gray-700">
          已獲得
        </button>
        <button className="px-5 py-3 font-medium text-gray-500 hover:text-gray-700">
          已使用
        </button>
        <button className="px-5 py-3 font-medium text-gray-500 hover:text-gray-700">
          已過期
        </button>
      </div>

      {/* History List */}
      <div className="divide-y divide-gray-100 bg-white px-5 pb-2">
        <div className="flex justify-between py-4">
          <div className="space-y-0.5">
            <div className="text-xs text-gray-400">2023/08/17</div>
            <div className="text-sm font-medium text-gray-900">
              購買活動消費
            </div>
          </div>
          <span className="text-lg font-semibold text-red-500">-46</span>
        </div>

        <div className="flex justify-between py-4">
          <div className="space-y-0.5">
            <div className="text-xs text-gray-400">2023/08/16</div>
            <div className="text-sm font-medium text-gray-900">
              購買活動消費 No-show Refund
            </div>
            <div className="mt-1 text-[10px] text-gray-400">
              訂單編號:540051526
            </div>
          </div>
          <span className="text-lg font-semibold text-emerald-500">+14</span>
        </div>

        <div className="flex justify-between py-4">
          <div className="space-y-0.5">
            <div className="text-xs text-gray-400">2023/08/14</div>
            <div className="text-sm font-medium text-gray-900">
              購買活動消費 日本JR關西地區鐵路周遊券
            </div>
            <div className="mt-1 text-[10px] text-gray-400">
              訂單編號:540051234
            </div>
          </div>
          <span className="text-lg font-semibold text-emerald-500">+32</span>
        </div>
      </div>
    </>
  );
}
