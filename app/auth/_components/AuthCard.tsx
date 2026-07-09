import Image from "next/image";
import type { ReactNode } from "react";

type AuthCardProps = {
  imageSide?: "left" | "right"; // 決定圖片區在左邊還是右邊
  
  imageSrc: string; // 圖片區的圖片
  imageTitle: string; // 圖片上方標題
  imageText: string; // 圖片下方文字
};

export default function AuthCard({
  imageSide = "right",
  
  imageSrc,
  imageTitle,
  imageText,
}: AuthCardProps) {
  return (
    <div
      className={`
        mx-auto flex w-full max-w-6xl overflow-hidden rounded-lg border border-white/70
        bg-black/35 text-white shadow-2xl backdrop-blur-sm
        flex-col
        ${imageSide === "left" ? "md:flex-row-reverse" : "md:flex-row"}
      `}
    >


      {/* 圖片區：手機版放上方或下方，桌機版佔一半寬度 */}
      <div className="relative min-h-[240px] w-full md:min-h-[620px] md:w-1/2">
        <Image
          src={imageSrc}
          alt={imageTitle}
          fill
          className="object-cover"
          priority
        />

        {/* 圖片上加一層暗色，讓白字看得清楚 */}
        <div className="absolute inset-0 bg-black/25" />

        {/* 圖片上的文字 */}
        <div className="absolute left-8 top-8 md:left-14 md:top-12">
          <h2 className="md:text-3xl">{imageTitle}</h2>
          <div className="mt-3 h-1 w-16 bg-lime-200" />
          <p className="mt-5 text-base md:text-lg">{imageText}</p>
        </div>
      </div>
    </div>
  );
}