"use client";

import Link from "next/link";
import { useState } from "react";
import type { NavLink } from "@/types/navbar";

type NavLinksProps = {
  links: NavLink[];
};

const features = [
  {
    name: "古蹟巡禮",
    icon: "🌙",
    color: "bg-[#EFF6FF]",
    href: "/experiences/search?category_ids=1",
  },
  {
    name: "藝文導覽",
    icon: "🎨",
    color: "bg-[#E0F2F1]",
    href: "/experiences/search?category_ids=2",
  },
  {
    name: "美饌饗宴",
    icon: "🍴",
    color: "bg-[#FEE2E2]",
    href: "/experiences/search?category_ids=3",
  },
  {
    name: "戶外探索",
    icon: "⛰️",
    color: "bg-[#FFEDD5]",
    href: "/experiences/search?category_ids=4",
  },
  {
    name: "專人攝影",
    icon: "📷",
    color: "bg-[#F3F4F6]",
    href: "/experiences/search?category_ids=5",
  },
  {
    name: "娛樂與夜生活",
    icon: "🎭",
    color: "bg-[#FAF5FF]",
    href: "/experiences/search?category_ids=6",
  },
];

const destinations = [
  {
    name: "倫敦",
    image: "/images/carousel1.jpeg",
    href: "/experiences/search?city=倫敦",
  },
  {
    name: "巴黎",
    image: "/images/carousel1.jpeg",
    href: "/experiences/search?city=巴黎",
  },
  {
    name: "慕尼黑",
    image: "/images/carousel1.jpeg",
    href: "/experiences/search?city=慕尼黑",
  },
  {
    name: "阿姆斯特丹",
    image: "/images/carousel1.jpeg",
    href: "/experiences/search?city=阿姆斯特丹",
  },
  {
    name: "威尼斯",
    image: "/images/carousel1.jpeg",
    href: "/experiences/search?city=威尼斯",
  },
  {
    name: "巴賽隆納",
    image: "/images/carousel1.jpeg",
    href: "/experiences/search?city=巴賽隆納",
  },
];

export default function NavLinks({ links }: NavLinksProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 點擊任一連結後關閉選單
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="hidden items-center md:flex">
      <div
        className="relative px-3 py-4"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* 觸發按鈕 */}
        <div
          tabIndex={0}
          role="button"
          className={`m-1 cursor-pointer select-none ${isOpen &&"text-gray-300"}`}
        >
          所有體驗
        </div>

        {/* 下拉內容：用 isOpen 控制顯示 */}
        {isOpen && (
          <div className="rounded-box bg-base-100 absolute top-full -left-26 z-50 flex w-96 p-2 shadow-sm">
            {/* 透明橋接區，避免滑鼠移到中間空隙時關閉 */}
            <div className="absolute -top-2 left-0 h-2 w-full bg-transparent" />

            <ul className="menu w-1/2 p-0">
              <li className="menu-title">體驗分類</li>
              {features.map((v) => (
                <li key={v.name}>
                  <Link
                    href={v.href}
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 rounded-lg px-4 py-2 text-[#ACACAC] hover:bg-zinc-50"
                  >
                    {v.name}
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="menu w-1/2 p-0">
              <li className="menu-title">熱門地區</li>
              {destinations.map((v) => (
                <li key={v.name}>
                  <Link
                    href={v.href}
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 rounded-lg px-4 py-2 text-[#ACACAC] hover:bg-zinc-50"
                  >
                    {v.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 其他導航連結 */}
      {links.map((link) => (
        <div
          key={link.name}
          className="flex items-center border-r px-5 last:border-0"
        >
          <Link href={link.href} className="hover:text-gray-300">
            {link.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
