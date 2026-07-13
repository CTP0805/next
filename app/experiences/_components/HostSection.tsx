"use client";
import Image from "next/image";
import { HiOutlineChatAlt2 } from "react-icons/hi";

export default function HostSection() {
  return (
    <section
      id="host"
      className="scroll-mt-36 border-b border-[#ECEFF0] pt-12 pb-6"
    >
      <h4 className="tracking-tight text-[#292E33]">在地嚮導</h4>

      {/* 💡 網格佈局：左右平分各 50%，強迫絕對等寬對稱 */}
      <div className="mt-6 grid grid-cols-2 items-stretch gap-8 max-md:grid-cols-1 max-md:gap-6">
        {/* 左側：精緻圓角嚮導名片卡（維持放大版比例） */}
        <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-[#ECEFF0] bg-white p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.10)] max-md:py-10">
          {/* 大頭貼放大到 size-28 */}
          <div className="relative size-28 overflow-hidden rounded-full border border-gray-100 shadow-sm">
            <Image
              src="/images/experiences/tzu.jpg" // 💡 記得換成你的 Camille 照片路徑
              alt="Camille"
              fill
              className="object-cover"
            />
          </div>

          {/* 名字放大 */}
          <p className="mt-4 text-[22px] leading-tight font-extrabold text-[#2E3338]">
            Camille
          </p>
          {/* 標籤放大 */}
          <p className="mt-1.5 rounded-full bg-[#68BBC3]/10 px-3 py-1 text-[12px] font-bold text-[#68BBC3]">
            巴黎在地嚮導
          </p>
        </div>

        {/* 右側：精緻縮小版自我介紹區 */}
        <div className="flex flex-col justify-center pr-6 pl-4 max-sm:px-1">
          {/* 💡 調整：引言標題縮小並減輕字體重量 */}
          <p className="p-text-14 mt-4 leading-7 text-[#687076]">
            哈囉！我是 Camille。帶你用巴黎人的視角，閱讀這座城市的優雅日常。
            我在巴黎生活了將近 8
            年，深深迷戀這座城市隱藏在巷弄間的歷史細節。比起走馬看花的熱門景點，我更喜歡帶朋友們走進左岸的獨立書店，或是坐在塞納河畔分享乳酪與紅酒。
          </p>
        </div>
      </div>

      {/* 下方長條灰色按鈕區 */}
      <div className="mt-10 mb-5 w-full">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F0F2F3] py-3 text-[12px] font-bold text-[#454B50] transition-colors md:hover:bg-[#E4E7E9]"
        >
          <HiOutlineChatAlt2 className="size-4 text-[#5B6267]" />
          傳訊息給 Camille
        </button>
      </div>
    </section>
  );
}
