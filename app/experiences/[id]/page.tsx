"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  HiStar,
  HiOutlineHeart,
  HiChevronLeft,
  HiOutlineShoppingCart,
  HiChevronUp,
} from "react-icons/hi";
import { FaImages } from "react-icons/fa";

import HostSection from "@/app/experiences/_components/HostSection";
import LocationSection from "@/app/experiences/_components/LocationSection";
import ReviewsSection from "@/app/experiences/_components/ReviewsSection";
import NotesSection from "@/app/experiences/_components/NotesSection";
import BookingCard from "@/app/experiences/_components/BookingCard";

type Experience = {
  id: number;
  title: string;
  location: string;
  rating: string;
  reviews: string;
  price: string;
  image: string;
};

const gallery = [
  {
    src: "/images/experiences/seine-picnic.jpg",
    alt: "朋友在塞納河畔野餐",
  },
  {
    src: "/images/experiences/paris-market.jpg",
    alt: "巴黎在地市場",
  },
  {
    src: "/images/experiences/paris-cafe.jpg",
    alt: "巴黎露天咖啡館",
  },
  {
    src: "/images/experiences/paris-car.jpg",
    alt: "巴黎街區散步",
  },
  {
    src: "/images/experiences/paris-arcade.jpg",
    alt: "巴黎鐵塔街景",
  },
] as const;

const highlights = [
  "10 年在巴黎生活的在地嚮導，帶你避開觀光人潮，從日常視角認識城市。",
  "每團最多 8 人的小團體驗，保留充分交流與彈性停留的時間。",
  "品嚐法式起司、麵包與自然酒，認識巴黎人的餐桌文化。",
  "行程節奏輕鬆，可依天氣與成員喜好微調，適合第一次來巴黎的旅人。",
];

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-10 place-items-center rounded-md border border-[#DDE3E5] bg-white text-lg text-[#5C666C] transition-colors hover:border-[#68BBC3] hover:text-[#419AA2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68BBC3]"
    >
      {children}
    </button>
  );
}

export default function ExperienceDetailPage({
  experience,
}: {
  experience: Experience;
}) {
  const [activeHash, setActiveHash] = useState("overview");
  // ⭕️ 1. 控制回到頂端按鈕的顯示狀態
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ⭕️ 2. 監聽滾動距離
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ⭕️ 3. 平滑回到頂端邏輯
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <div className="min-h-screen bg-white text-[#292E33]">
      <main className="mx-auto w-full max-w-[1280px] px-6 pt-10 pb-28 max-sm:px-2 max-sm:pt-0">
        <nav
          className="hidden text-sm font-medium sm:block"
          aria-label="麵包屑"
        >
          {/* 1. 可點擊或主要的層級：全部改成亮青色 [#68BBC3] */}
          <span className="cursor-pointer font-bold text-[#68BBC3] hover:underline">
            首頁
          </span>
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="cursor-pointer text-[#68BBC3] hover:underline">
            法國
          </span>
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="cursor-pointer text-[#68BBC3] hover:underline">
            巴黎
          </span>
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="cursor-pointer text-[#68BBC3] hover:underline">
            美食饗宴
          </span>

          {/* 2. 最後一層（當前商品）：維持原本的灰色 [#7B8388]，代表不用點擊 */}
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="inline-block max-w-[200px] truncate align-bottom text-[#7B8388]">
            塞納河黃昏野餐
          </span>
        </nav>

        <section className="mt-7 grid h-[510px] grid-cols-2 gap-2 overflow-hidden rounded-lg max-md:h-auto max-md:grid-cols-1 max-sm:relative max-sm:left-1/2 max-sm:mt-0 max-sm:w-screen max-sm:-translate-x-1/2 max-sm:rounded-none">
          {/* 第一張主圖容器 (在手機版將作為所有浮動按鈕的基地) */}
          <div className="relative min-h-[360px] overflow-hidden max-sm:h-[280px] max-sm:min-h-0">
            <Image
              src={gallery[0].src}
              alt={gallery[0].alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 62vw"
              className="object-cover"
            />

            {/* 📱 手機版專屬：2. 左上角「回上一頁」 */}
            <button
              type="button"
              onClick={() => window.history.back()}
              className="absolute top-4 left-4 z-10 hidden size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform active:scale-90 max-sm:flex"
              aria-label="回上一頁"
            >
              <HiChevronLeft className="-ml-0.5 size-6" />
            </button>

            {/* 📱 手機版專屬：3. 右上角「愛心與購物車組合」 */}
            <div className="absolute top-4 right-4 z-10 hidden items-center gap-3 max-sm:flex">
              {/* 愛心按鈕 */}
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform active:scale-90"
                aria-label="加入我的最愛"
              >
                <HiOutlineHeart className="size-5" />
              </button>
              {/* 購物車按鈕 */}
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform active:scale-90"
                aria-label="查看購物車"
              >
                <HiOutlineShoppingCart className="size-5" />
              </button>
            </div>

            {/* 📱 手機版專屬：1. 右下角黑底「查看照片」按鈕 */}
            <button
              type="button"
              className="absolute right-4 bottom-4 z-10 hidden items-center gap-1.5 rounded-md bg-black/65 px-3 py-1.5 text-[12px] font-bold text-white backdrop-blur-sm max-sm:flex"
            >
              {/* 這裡模擬一個圖片小圖標，也可以換成你的 icon */}
              <span className="text-sm">
                <FaImages />
              </span>{" "}
              查看照片
            </button>
          </div>

          {/* 右側四張圖拼圖區：加上 max-sm:hidden，手機版直接隱藏不顯示 */}
          <div className="grid grid-cols-2 grid-rows-2 gap-2 max-md:h-[320px] max-sm:hidden">
            {gallery.slice(1).map((photo, index) => (
              <div key={photo.src} className="relative overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover"
                />
                {index === 3 && (
                  /* 💻 電腦/平版版專屬的查看全部按鈕 */
                  <button
                    type="button"
                    className="absolute right-4 bottom-4 rounded-md bg-black/65 px-4 py-2 text-[14px] font-bold text-white backdrop-blur-sm"
                  >
                    查看照片
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-end justify-between gap-6 py-7 max-sm:px-5">
          <div>
            <h3 className="leading-tight">
              塞納河黃昏野餐、橋上故事與小酒館收尾
            </h3>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#727A7F]">
              {/* 💡 核心修正：把星星和 4.9 用一個 flex 區塊緊緊鎖在一起 */}
              {/* 這裡的 gap-1 讓星星和 4.9 的距離變得超級近，同時也享受外層 gap-x-4 的推擠效果 */}
              <div className="flex items-center gap-1">
                <HiStar className="size-4 shrink-0 text-[#FFA938]" />
                <span className="font-extrabold text-[#F4A629]">4.9</span>
              </div>

              <span>1,284 則評價</span>
              <span>18K+ 人參加</span>
              <span>體驗時間：3.5 小時</span>
              <span>中文 / English</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2 max-sm:hidden">
            <IconButton label="分享體驗">↗</IconButton>
            <IconButton label="加入我的最愛">
              <HiOutlineHeart className="size-5" />
            </IconButton>
          </div>
        </section>

        <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-12 max-lg:grid-cols-1">
          <div className="w-full max-sm:px-5">
            <div className="w-full border-t border-[#DEE3E5]" />
            <nav className="sticky top-25 z-20 flex gap-8 border-b border-[#DEE3E5] bg-white/95 px-1 backdrop-blur max-sm:[scrollbar-width:none] max-sm:overflow-x-auto max-sm:[&::-webkit-scrollbar]:hidden">
              {[
                ["#overview", "體驗介紹"],
                ["#host", "在地嚮導"],
                ["#location", "集合地點"],
                ["#reviews", "旅人好評"],
                ["#notes", "注意事項"],
              ].map(([href, label]) => {
                // 💡 步驟 2：檢查目前這個項目的 href 是不是就是被啟動的 activeHash
                const isActive = activeHash === href;

                return (
                  <a
                    key={href}
                    href={href}
                    // 💡 步驟 3：點擊時，把目前的 href 存進 state 裡
                    onClick={() => setActiveHash(href)}
                    // 💡 步驟 4：動態判斷 class，是 active 就給水藍色，不是就給灰色
                    className={`shrink-0 border-b-2 py-4 text-sm font-extrabold transition-colors ${
                      isActive
                        ? "border-[#68BBC3] text-[#4CA3AB]"
                        : "border-transparent text-[#555D62] md:hover:text-[#4CA3AB]"
                    }`}
                  >
                    {label}
                  </a>
                );
              })}
            </nav>

            <section id="overview" className="scroll-mt-36 pt-9">
              <ul className="space-y-4">
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 text-sm leading-7 text-[#61696E]"
                  >
                    <span className="text-[#68BBC3]">◎</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>

            <HostSection />
            <LocationSection />
            <ReviewsSection />
            <NotesSection />
          </div>

          <div className="hidden lg:sticky lg:top-30 lg:block">
            <BookingCard />
          </div>
        </div>
        {/* 📱 手機版專屬：右下角圓形回到頂端按鈕（避開底部浮動條，改用 bottom-36 飄在它上方） */}
        <button
          type="button"
          onClick={scrollToTop}
          className={`fixed right-5 bottom-36 z-40 grid size-12 place-items-center rounded-full border border-[#ECEFF0] bg-white text-[#68BBC3] shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 active:scale-95 md:hidden ${
            showScrollTop
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0"
          }`}
          aria-label="回到最頂端"
        >
          <HiChevronUp className="size-6 stroke-[1.5]" />
        </button>
        {/* 📱 手機版專屬：底部雙按鈕浮動條 (上下分層版) */}
        <div className="fixed bottom-0 left-0 z-50 flex w-full flex-col border-t border-[#ECEFF0] bg-white px-4 pt-3 pb-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden">
          {/* 1. 上層：左上角的價格資訊 */}
          <div className="mb-2.5 flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-[#7B8388]">每人只要</span>
            {/* 💡 暫時寫死：等之後串 API 時，再把它換回 {experience?.price} */}
            <span className="text-[18px] font-black text-[#30353A]">
              NT$ 1,960 起
            </span>
          </div>

          {/* 2. 下層：橫向滿版的雙按鈕 */}
          <div className="flex w-full gap-3">
            {/* 橘色按鈕：加入購物車 */}
            <button
              type="button"
              className="flex-1 rounded-xl bg-[#FF9224] py-4 text-center text-sm font-black text-white transition-transform active:scale-[0.98]"
            >
              加入購物車
            </button>

            {/* 藍綠色按鈕：立即預訂 */}
            <button
              type="button"
              className="flex-1 rounded-xl bg-[#68BBC3] py-4 text-center text-sm font-black text-white transition-transform active:scale-[0.98]"
            >
              立即預訂
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
