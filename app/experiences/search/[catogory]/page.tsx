"use client";

import { useState, useEffect } from "react";
import FilterPanel from "@/app/experiences/_components/FilterPanel";
import ExperienceCard from "@/app/experiences/_components/ExperienceCard";
import Link from "next/link";
import { HiAdjustments, HiChevronUp } from "react-icons/hi";

type Experience = {
  id: number;
  title: string;
  location: string;
  rating: string;
  reviews: string;
  price: string;
  image: string;
};

const experiences: Experience[] = [
  {
    id: 1,
    title: "蒙帕納斯大樓：巴黎全景攝影",
    location: "法國・巴黎",
    rating: "4.6",
    reviews: "567 則評價",
    price: "NT$ 950 起",
    image: "/images/experiences/paris-car.jpg",
  },
  {
    id: 2,
    title: "花園裡的巴黎午後：與在地人共度時光",
    location: "法國・巴黎",
    rating: "4.8",
    reviews: "403 則評價",
    price: "NT$ 1,280 起",
    image: "/images/experiences/paris-garden.jpg",
  },
  {
    id: 3,
    title: "巴黎烘焙坊：跟著職人學做法式麵包",
    location: "法國・巴黎",
    rating: "4.9",
    reviews: "862 則評價",
    price: "NT$ 1,650 起",
    image: "/images/experiences/paris-bakery.jpg",
  },
  {
    id: 4,
    title: "玻璃拱廊散步：老巴黎的優雅日常",
    location: "法國・巴黎",
    rating: "4.7",
    reviews: "326 則評價",
    price: "NT$ 880 起",
    image: "/images/experiences/paris-arcade.jpg",
  },
  {
    id: 5,
    title: "左岸咖啡館巡禮：與新朋友共享午後",
    location: "法國・巴黎",
    rating: "4.8",
    reviews: "734 則評價",
    price: "NT$ 1,120 起",
    image: "/images/experiences/paris-cafe.jpg",
  },
  {
    id: 6,
    title: "市場美食散步：認識巴黎人的餐桌",
    location: "法國・巴黎",
    rating: "4.9",
    reviews: "915 則評價",
    price: "NT$ 1,390 起",
    image: "/images/experiences/paris-market.jpg",
  },
  {
    id: 7,
    title: "蒙馬特巷弄導覽：畫家、故事與街角",
    location: "法國・巴黎",
    rating: "4.7",
    reviews: "488 則評價",
    price: "NT$ 920 起",
    image: "/images/experiences/montmartre-walk.jpg",
  },
  {
    id: 8,
    title: "塞納河夕陽野餐：像巴黎人一樣生活",
    location: "法國・巴黎",
    rating: "4.9",
    reviews: "1,284 則評價",
    price: "NT$ 1,960 起",
    image: "/images/experiences/seine-picnic.jpg",
  },
  {
    id: 9,
    title: "地下酒窖餐桌：法式料理與自然酒之夜",
    location: "法國・巴黎",
    rating: "4.8",
    reviews: "652 則評價",
    price: "NT$ 1,780 起",
    image: "/images/experiences/paris-dinner.jpg",
  },
  {
    id: 10,
    title: "巴士底市場：鮮花、起司與街區故事",
    location: "法國・巴黎",
    rating: "4.8",
    reviews: "678 則評價",
    price: "NT$ 1,080 起",
    image: "/images/experiences/bastille-market.jpg",
  },
  {
    id: 11,
    title: "蒙馬特藝術散步：尋找巴黎的創作靈感",
    location: "法國・巴黎",
    rating: "4.7",
    reviews: "529 則評價",
    price: "NT$ 990 起",
    image: "/images/experiences/montmartre-art.jpg",
  },
  {
    id: 12,
    title: "河岸舊書攤巡禮：閱讀巴黎城市風景",
    location: "法國・巴黎",
    rating: "4.9",
    reviews: "377 則評價",
    price: "NT$ 860 起",
    image: "/images/experiences/paris-books.jpg",
  },
];

export default function ExperienceCategoryPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // ⭕️ 1. 建立控制「回到頂端」按鈕是否顯示的狀態
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ⭕️ 2. 監聽網頁滾動事件
  useEffect(() => {
    const handleScroll = () => {
      // 當使用者下滑超過 400px 時顯示按鈕，否則隱藏
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ⭕️ 3. 點擊回到頂端的點擊事件
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // 讓它平滑地滾動上去，更有質感
    });
  };
  return (
    <div className="min-h-screen bg-white text-[#292D32] max-sm:px-3">
      <main className="mx-auto w-full max-w-[1280px] px-6 pt-10 pb-32 max-md:pt-4 max-sm:px-4">
        <nav
          aria-label="麵包屑"
          className="text-sm font-medium text-[#747B81] max-md:hidden"
        >
          <Link href="/">
            <span className="text-[#68BBC3]">首頁</span>
          </Link>
          <span> › </span>
          <span>巴黎</span>
        </nav>

        <h2 className="mt-6 leading-tight font-extrabold text-[#292E33] max-md:hidden">
          與 <span className="text-[#68BBC3]">巴黎</span> 相關的體驗
        </h2>
        <div className="mt-9 grid grid-cols-[280px_minmax(0,1fr)] items-start gap-8 max-lg:grid-cols-1 max-md:mt-2">
          <div className="sticky top-28 h-fit max-lg:hidden">
            <FilterPanel />
          </div>
          <section aria-label="巴黎體驗列表" className="min-w-0">
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-[16px] font-bold whitespace-nowrap text-[#596066] sm:text-[17px]">
                <span className="mr-1 text-[20px] font-extrabold text-[#68BBC3] sm:text-[24px]">
                  124
                </span>
                項體驗可預訂
              </p>

              <div className="flex items-center gap-2">
                {/* 💡 修正 2：手機版專屬「篩選按鈕」。只在 lg 以下顯示，點擊開啟彈窗 */}
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-[#DDE2E4] px-3 text-sm font-bold text-[#4D545A] hover:border-[#68BBC3] lg:hidden"
                >
                  <HiAdjustments className="size-4 text-[#68BBC3]" />
                  <span>篩選</span>
                </button>

                <span className="text-sm font-medium text-[#777E84] max-sm:hidden">
                  排序方式
                </span>
                <select
                  defaultValue="popular"
                  aria-label="排序方式"
                  className="h-10 rounded-md border border-[#DDE2E4] bg-white px-4 text-sm font-bold text-[#4D545A] outline-none hover:border-[#68BBC3] hover:ring-2 hover:ring-[#68BBC3]/20"
                >
                  <option value="popular">熱門推薦</option>
                  <option value="rating">評價最高</option>
                  <option value="price-low">價格低到高</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-x-6 gap-y-14 max-md:grid-cols-2 max-sm:grid-cols-1">
              {experiences.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
            <nav
              aria-label="商品列表分頁"
              className="mt-20 flex items-center justify-center gap-2"
            >
              {/* 📱 手機版專屬（小於 768px）：溫馨的到底提示 */}
              <div className="hidden flex-col items-center gap-2 py-4 max-md:flex">
                <p className="text-sm font-medium tracking-wide text-[#8A9196]">
                  到底了！暫時沒有其他體驗囉
                </p>
              </div>
              {["‹", "1", "2", "3", "4", "›"].map((page) => (
                <button
                  key={page}
                  type="button"
                  aria-current={page === "1" ? "page" : undefined}
                  aria-label={
                    page === "‹"
                      ? "上一頁"
                      : page === "›"
                        ? "下一頁"
                        : `第 ${page} 頁`
                  }
                  className={`${
                    page === "1"
                      ? "grid size-10 place-items-center rounded-md bg-[#68BBC3] text-sm font-extrabold text-white"
                      : "grid size-10 place-items-center rounded-md border border-[#E0E4E6] bg-white text-sm font-bold text-[#6E757B] transition-colors hover:border-[#68BBC3] hover:text-[#489DA5]"
                  } max-md:hidden`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </section>
        </div>
      </main>
      {/* 📱 手機版專屬：右下角圓形回到頂端按鈕 */}
      {/* md:hidden：確保只在手機/平板版出現 */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`fixed right-5 bottom-6 z-40 grid size-12 place-items-center rounded-full border border-[#ECEFF0] bg-white text-[#68BBC3] shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 active:scale-95 md:hidden ${
          showScrollTop
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        aria-label="回到最頂端"
      >
        <HiChevronUp className="size-6 stroke-[1.5]" />
      </button>
      {/* 💡 修正 4：手機版全螢幕「滿版篩選抽屜」
          當 isFilterOpen 為 true 時，會從下方/右方跳出，直接重用組員寫的 FilterPanel！
      */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-white lg:hidden">
          {/* 彈窗頂部列 */}
          <div className="flex items-center justify-between border-b border-[#ECEFF0] px-6 py-4">
            <h3 className="text-lg font-extrabold text-[#292E33]">篩選條件</h3>
            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="text-2xl font-bold text-gray-400 hover:text-black"
            >
              ×
            </button>
          </div>
          {/* 彈窗內容：直接把原本的 FilterPanel 塞進來，加上滾動條 */}
          <div className="flex-1 overflow-y-auto p-6">
            <FilterPanel />
          </div>
          {/* 彈窗底部：確認按鈕 */}
          <div className="border-t border-[#ECEFF0] p-6">
            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="h-12 w-full rounded-xl bg-[#68BBC3] font-bold text-white shadow-lg"
            >
              查看結果
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
