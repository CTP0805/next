"use client";
import Image from "next/image";
import IconMenu from "@/components/IconMenu";
export default function HeroSection() {
  return (
    // 1. 容器層：使用 relative 讓內容可以絕對定位疊加
    <div className="relative mb-[100px] h-[362px] w-full md:h-[800px]">
      {/* 2. 背景層：使用 object-cover 確保圖片覆蓋且比例正確 */}
      <Image
        src="/images/carousel1.jpeg"
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
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-9xl text-white">
        PARIS
      </div>
      <div className="relative top-0 left-0 w-full md:-top-30">
        <IconMenu />
      </div>
    </div>
  );
}
