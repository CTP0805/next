"use client";
import Image from "next/image";
import IconMenu from "@/components/IconMenu";
export default function HeroSection() {
  return (
    // 1. 容器層：使用 relative 讓內容可以絕對定位疊加
    <div className="relative h-[1020px] w-full">
      {/* 2. 背景層：使用 object-cover 確保圖片覆蓋且比例正確 */}
      <Image
        src="/images/carousel1.jpg"
        alt="Hero Background"
        className="absolute inset-0 h-full w-full object-cover"
        fill
      />
      {/* 遮罩層 (Overlay)：增加對比度，讓文字更好閱讀 */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"
        aria-hidden="true"
      />
      {/* 3. 內容層：使用 flex 置中對齊內容 */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-white">
        <span className="font-besley mb-6 text-4xl font-bold text-white/60 md:text-[128px]">
          E U R O P E
        </span>
      </div>
      <div className="absolute -bottom-25 left-0 w-full">
        <IconMenu />
      </div>
    </div>
  );
}
