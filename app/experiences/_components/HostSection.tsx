"use client";

import Image from "next/image";
import { HiOutlineChatAlt2 } from "react-icons/hi";

type HostSectionProps = {
  hostName: string;
  hostRole: string | null;
  hostBio: string | null;
  hostAvatar: string | null;
  city: string;
};

export default function HostSection({
  hostName,
  hostRole,
  hostBio,
  hostAvatar,
  city,
}: HostSectionProps) {
  return (
    <section
      id="host"
      className="scroll-mt-20 border-b border-[#ECEFF0] pt-14 pb-6"
    >
      <h4 className="tracking-tight text-[#292E33]">在地嚮導</h4>

      {/* 💡 網格佈局：左右平分各 50%，強迫絕對等寬對稱 */}
      <div className="mt-6 grid grid-cols-2 items-stretch gap-8 max-md:grid-cols-1 max-md:gap-6">
        {/* 左側：精緻圓角嚮導名片卡（維持放大版比例） */}
        <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-[#ECEFF0] bg-white p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.10)] max-md:py-10">
          {/* 大頭貼放大到 size-28 */}
          <div className="relative size-28 overflow-hidden rounded-full border border-gray-100 shadow-sm">
            <Image
              src={hostAvatar ?? "/images/experiences/tzu.jpg"} // 💡 記得換成你的 Camille 照片路徑
              alt={hostName}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>

          {/* 名字放大 */}
          <p className="mt-4 text-[22px] leading-tight font-extrabold text-[#2E3338]">
            {hostName}
          </p>
          {/* 標籤放大 */}
          <p className="mt-1.5 rounded-full bg-[#68BBC3]/10 px-3 py-1 text-[12px] font-bold text-[#68BBC3]">
            {hostRole ?? `${city}在地嚮導`}
          </p>
        </div>

        {/* 右側：精緻縮小版自我介紹區 */}
        <div className="flex flex-col justify-center pr-6 pl-4 max-sm:px-1">
          {/* 💡 調整：引言標題縮小並減輕字體重量 */}
          <p className="p-text-14 mt-4 leading-7 text-[#687076]">
            {hostBio ?? "這位嚮導尚未提供自我介紹。"}
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
          傳訊息給 {hostName}
        </button>
      </div>
    </section>
  );
}
