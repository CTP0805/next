"use client";

import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
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
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
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
          onClick={() => setIsContactOpen(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F0F2F3] py-3 text-[12px] font-bold text-[#454B50] transition-colors md:hover:bg-[#E4E7E9]"
        >
          <HiOutlineChatAlt2 className="size-4 text-[#5B6267]" />
          傳訊息給 {hostName}
        </button>
      </div>
      {isContactOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsContactOpen(false);
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold">傳訊息給 {hostName}</h3>

              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                className="text-2xl text-[#7B8388]"
                aria-label="關閉"
              >
                ×
              </button>
            </div>

            <p className="mt-2 text-sm text-[#7B8388]">
              可詢問體驗內容、集合地點或其他預訂問題。
            </p>

            <textarea
              value={contactMessage}
              onChange={(event) => setContactMessage(event.target.value)}
              placeholder="請輸入想詢問主辦人的內容"
              className="mt-5 min-h-36 w-full resize-none rounded-xl border border-[#DDE3E5] p-4 outline-none focus:border-[#68BBC3]"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                className="button-white"
              >
                取消
              </button>

              <button
                type="button"
                disabled={!contactMessage.trim()}
                onClick={() => {
                  toast.success("訊息已送出");
                  setContactMessage("");
                  setIsContactOpen(false);
                }}
                className="button-main"
              >
                送出訊息
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
