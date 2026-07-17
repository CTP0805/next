"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation"; // 💡 引入 useParams 獲取網址 ID
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
import { useCart } from "@/contexts/cart";

// 💡 調整 Type 定義，以符合後端資料庫回傳的真實欄位
type ExperienceNote = {
  title: string;
  content: string;
};

type Experience = {
  id: number;
  category_id: number;
  category_name: string;

  host_id: number;
  host_name: string;
  host_bio: string | null;
  host_avatar: string | null;
  host_rating: number;
  host_role: string | null;

  title: string;
  subtitle: string;
  description: string;
  notice: string | null;
  meeting_point: string;
  city: string;
  longitude: number | null;
  latitude: number | null;

  price: number;
  adult_price: number;
  child_price: number;
  duration_minutes: number;

  image_url: string | null;

  rating: number;
  review_count: number;

  notes: ExperienceNote[];
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

const formatDuration = (minutes: number) => {
  const hours = minutes / 60;

  if (Number.isInteger(hours)) {
    return `${hours} 小時`;
  }

  return `${hours.toFixed(1)} 小時`;
};

export default function ExperienceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams(); // 💡 獲取網址 Query 參數
  const router = useRouter(); // 💡 獲取 Next.js 路由路由器
  const { onAdd, onEdit } = useCart(); // 💡 從你的 Context 中引入這兩個好幫手

  const id = params.id as string;
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeHash, setActiveHash] = useState("overview");
  // 1. 控制回到頂端按鈕的顯示狀態
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 📱 手機版選擇場次與人的人數狀態（通常需要與 UI 的點擊綁定，這裡先提供 State 管理）
  const [selectedSessionId, setSelectedSessionId] = useState<number>(101); // 預設某場次
  const [selectedQty, setSelectedQty] = useState<number>(1); // 預設 1 人
  const [selectedSessionName, setSelectedSessionName] =
    useState<string>("2026-08-07 17:00");

  // 💡 1. 網址參數解析：判斷當前是否處於「編輯模式」並記錄舊資料
  const isEditMode = searchParams.get("edit") === "true";
  const oldSessionId = searchParams.get("oldSession")
    ? Number(searchParams.get("oldSession"))
    : null;
  const oldQty = searchParams.get("oldQty")
    ? Number(searchParams.get("oldQty"))
    : null;

  useEffect(() => {
    if (!id) return;

    const getExperience = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const res = await fetch(`http://localhost:3001/api/experiences/${id}`);
        const resData = await res.json();

        if (resData.status !== "success") {
          setErrorMessage(resData.message ?? "找不到此體驗");
          return;
        }

        setExperience(resData.data);
      } catch (error) {
        console.error("取得體驗詳情失敗:", error);
        setErrorMessage("無法取得體驗資料");
      } finally {
        setIsLoading(false);
      }
    };

    getExperience();
  }, [id]);

  // 2. 監聽滾動距離
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

  // 3. 平滑回到頂端邏輯
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // 💡 2. 統一的購物車提交處理函式（不管是手機版點擊、還是 BookingCard 點擊都用這一個！）
  const handleCartSubmit = (
    targetSessionId: number,
    targetQty: number,
    targetSessionName?: string,
  ) => {
    if (!experience) return;

    const productInfo = {
      experienceId: experience.id,
      name: experience.title,
      price: experience.price,
    };

    if (isEditMode && oldSessionId !== null) {
      // 編輯模式：呼叫 onEdit
      onEdit(
        experience.id,
        oldSessionId,
        productInfo,
        targetSessionId,
        targetQty,
        targetSessionName,
      );
      router.push("/cart"); // 編輯完成回購物車
    } else {
      // 一般新增模式
      onAdd(productInfo, targetSessionId, targetQty, targetSessionName);
      alert("已加入購物車！");
    }
  };

  if (isLoading) {
    return <div className="px-6 py-20 text-center">載入中...</div>;
  }

  if (errorMessage || !experience) {
    return (
      <div className="px-6 py-20 text-center text-[#687076]">
        {errorMessage || "找不到此體驗"}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white text-[#292E33]">
      <main className="mx-auto w-full max-w-[1280px] px-6 pt-10 pb-28 max-sm:px-2 max-sm:pt-0">
        <nav
          className="hidden text-sm font-medium sm:block"
          aria-label="麵包屑"
        >
          <span className="cursor-pointer font-bold text-[#68BBC3] hover:underline">
            首頁
          </span>
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="cursor-pointer text-[#68BBC3] hover:underline">
            義大利
          </span>
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="cursor-pointer text-[#68BBC3] hover:underline">
            {experience.city}
          </span>
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="cursor-pointer text-[#68BBC3] hover:underline">
            {experience.category_name}
          </span>

          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="inline-block max-w-[200px] truncate align-bottom text-[#7B8388]">
            {experience.title}
          </span>
        </nav>

        <section className="mt-7 grid h-[510px] grid-cols-2 gap-2 overflow-hidden rounded-lg max-md:h-auto max-md:grid-cols-1 max-sm:relative max-sm:left-1/2 max-sm:mt-0 max-sm:w-screen max-sm:-translate-x-1/2 max-sm:rounded-none">
          {/* 第一張主圖容器 (在手機版將作為所有浮動按鈕的基地) */}
          <div className="relative min-h-[360px] overflow-hidden max-sm:h-[280px] max-sm:min-h-0">
            <Image
              src={
                experience.image_url ?? "/images/experiences/seine-picnic.jpg"
              }
              alt={experience.title}
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
            <h3 className="leading-tight">{experience.title}</h3>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#727A7F]">
              {/* 💡 核心修正：把星星和 4.9 用一個 flex 區塊緊緊鎖在一起 */}
              {/* 這裡的 gap-1 讓星星和 4.9 的距離變得超級近，同時也享受外層 gap-x-4 的推擠效果 */}
              <div className="flex items-center gap-1">
                <HiStar className="size-4 shrink-0 text-[#FFA938]" />
                <span className="font-extrabold text-[#F4A629]">
                  {" "}
                  {experience.rating.toFixed(1)}
                </span>
              </div>

              <span>
                {experience.review_count.toLocaleString("zh-TW")} 則評價
              </span>
              <span>18K+ 人參加</span>
              <span>
                體驗時間：{formatDuration(experience.duration_minutes)}
              </span>
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
            <nav className="sticky top-15 z-20 flex gap-8 border-b border-[#DEE3E5] bg-white/95 px-1 backdrop-blur max-sm:[scrollbar-width:none] max-sm:overflow-x-auto max-sm:[&::-webkit-scrollbar]:hidden">
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

            <section id="overview" className="scroll-mt-24 pt-9">
              <ul className="space-y-4">
                {experience.description
                  .split(/[。.!！?？]/)
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((item) => (
                    <li
                      key={item}
                      className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 text-sm leading-7 text-[#61696E]"
                    >
                      <span className="text-[#68BBC3]">◎</span>
                      <span>{item}。</span>
                    </li>
                  ))}
              </ul>
            </section>

            <HostSection
              hostName={experience.host_name}
              hostRole={experience.host_role}
              hostBio={experience.host_bio}
              hostAvatar={experience.host_avatar}
              city={experience.city}
            />
            <LocationSection
              meetingPoint={experience.meeting_point}
              longitude={experience.longitude}
              latitude={experience.latitude}
            />
            <ReviewsSection />
            <NotesSection notes={experience.notes} />
          </div>

          {/* 💡 桌機版 BookingCard 修改：傳入 onSubmit (handleCartSubmit) 以及編輯預設參數 */}
          <div className="hidden lg:sticky lg:top-20 lg:block">
            <BookingCard
              experience={experience}
              isEditMode={isEditMode}
              oldSessionId={oldSessionId}
              oldQty={oldQty}
              onSubmit={handleCartSubmit} // 💡 讓 BookingCard 直接執行統一處理函式
            />
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
              NT$ {experience.adult_price.toLocaleString("zh-TW")} 起
            </span>
          </div>

          {/* 2. 下層：橫向滿版的雙按鈕 */}
          <div className="flex w-full gap-3">
            {/* 橘色按鈕：加入購物車 */}
            {isEditMode ? (
              <button
                type="button"
                onClick={() =>
                  handleCartSubmit(
                    selectedSessionId,
                    selectedQty,
                    selectedSessionName,
                  )
                }
                className="flex-1 rounded-xl bg-[#68BBC3] py-4 text-center text-sm font-black text-white transition-transform active:scale-[0.98]"
              >
                確認修改商品
              </button>
            ) : (
              // 一般模式：維持原本的雙按鈕
              <>
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
