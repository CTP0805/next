"use client";

import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useFavorites } from "@/contexts/FavoriteContext";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FaLink } from "react-icons/fa6";
import { useCart } from "@/contexts/cart";
import {
  HiStar,
  HiHeart,
  HiOutlineHeart,
  HiChevronLeft,
  HiOutlineShoppingCart,
  HiChevronUp,
  HiCheck,
} from "react-icons/hi";

import HostSection from "@/app/experiences/_components/HostSection";
import LocationSection from "@/app/experiences/_components/LocationSection";
import ReviewsSection from "@/app/experiences/_components/ReviewsSection";
import NotesSection from "@/app/experiences/_components/NotesSection";
import BookingCard from "@/app/experiences/_components/BookingCard";
import Loading from "@/components/Loading";

// 最近瀏覽
import { API_SERVER } from "@/config/api-path";
import { useAuth } from "@/contexts/auth-context";

// 💡 調整 Type 定義，以符合後端資料庫回傳的真實欄位
type ExperienceNote = {
  title: string;
  content: string;
};

type ExperienceImage = {
  id: number;
  image_url: string;
  is_primary: number;
  sort_order: number;
};

type ExperienceSession = {
  id: number;
  start_time: string;
  end_time: string;
  adult_price: number;
  child_price: number;
  min_participants: number;
  max_participants: number;
};

type ExperienceReview = {
  id: number;
  member_id: number;
  rating: number;
  comment: string;
  created_at: string;
  image_url: string | null;
  member_name: string | null;
  member_avatar: string | null;
  departure_date: string | null;
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
  description: string;
  meeting_point: string;
  city: string;
  longitude: number | null;
  latitude: number | null;

  price: number;
  adult_price: number;
  child_price: number;
  duration_minutes: number;

  image_url: string | null;
  images: ExperienceImage[];

  rating: number;
  review_count: number;

  notes: ExperienceNote[];
  sessions: ExperienceSession[];
  reviews: ExperienceReview[];
};

function IconButton({
  label,
  children,
  onClick,
  pressed,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, onAdd, onEdit } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const id = params.id as string;
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  // 1. 控制回到頂端按鈕的顯示狀態
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isEditMode = searchParams.get("edit") === "true";
  const oldSessionId = searchParams.get("oldSession")
    ? Number(searchParams.get("oldSession"))
    : null;
  const oldQty = searchParams.get("oldQty")
    ? Number(searchParams.get("oldQty"))
    : null;
  const favorite = experience ? isFavorite(experience.id) : false;

  // 最近瀏覽
  const { authInit, isAuthenticated } = useAuth();

  const handleFavoriteClick = async () => {
    if (!experience) return;

    try {
      await toggleFavorite(experience.id);

      if (favorite) {
        toast.success("已從「心願清單」移除");
      } else {
        toast.success("已收藏至「心願清單」");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "收藏操作失敗";

      toast.error(message);
    }
  };

  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setIsLinkCopied(true);
      toast.success("已複製體驗連結！");

      window.setTimeout(() => {
        setIsLinkCopied(false);
      }, 2000);
    } catch (error) {
      console.error("複製網址失敗：", error);
      toast.error("複製網址失敗，請手動複製網址列");
    }
  };
  // 💡 解決重新整理跑到底部的 key：強制將滾動恢復模式設為 'manual'
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "scrollRestoration" in window.history
    ) {
      window.history.scrollRestoration = "manual";
    }

    // 元件卸載時恢復預設，避免影響其他頁面
    return () => {
      if (
        typeof window !== "undefined" &&
        "scrollRestoration" in window.history
      ) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);
  useEffect(() => {
    if (!id) return;

    const getExperience = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const res = await fetch(`http://localhost:3001/api/experiences/${id}`);
        const resData = await res.json();
        console.log(resData);
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

  // API 成功取得體驗資料後，將體驗名稱設定到瀏覽器分頁
  useEffect(() => {
    // 還在載入中、或 API 尚未回傳資料時，先不修改標題
    if (!experience) return;

    document.title = `${experience.title}｜Meet Locals`;
  }, [experience]);

  // 最近瀏覽
  useEffect(() => {
    // authInit：確認前端已完成向後端確認登入狀態
    // isAuthenticated：確認目前確實是登入會員
    // experience：確認體驗詳細資料成功載入
    if (!authInit || !isAuthenticated || !experience) {
      return;
    }

    const saveRecentlyViewed = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${API_SERVER}/api/member/recently-viewed`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },

            // 前端只送體驗 ID，不送 memberId
            body: JSON.stringify({
              experienceId: experience.id,
            }),
          },
        );

        // 未登入或 Cookie 過期時，不記錄即可。
        // 登入保護元件會負責處理會員頁面的權限。
        if (response.status === 401) {
          return;
        }

        if (!response.ok) {
          console.error("記錄最近瀏覽失敗");
        }
      } catch (error) {
        // 不讓紀錄失敗影響使用者正常看體驗內容
        console.error("記錄最近瀏覽時發生網路錯誤", error);
      }
    };

    void saveRecentlyViewed();
  }, [authInit, isAuthenticated, experience]);

  // 2. 監聽滾動距離
  useEffect(() => {
    const sectionIds = ["overview", "host", "location", "reviews", "notes"];
    const stickyOffset = 130;

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      let currentSection = "overview";

      sectionIds.forEach((sectionId) => {
        const section = document.getElementById(sectionId);

        if (!section) return;

        if (section.getBoundingClientRect().top <= stickyOffset) {
          currentSection = sectionId;
        }
      });

      setActiveSection(currentSection);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // 3. 平滑回到頂端邏輯
  const scrollToTop = () => {
    setActiveSection("overview");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToSection = (sectionId: string) => {
    const targetElement = document.getElementById(sectionId);

    if (!targetElement) return;

    setActiveSection(sectionId);

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  //處理Edit編輯&加入onAdd購物車按鈕
  const handleCartSubmit = async (
    sessionId: number,
    adultQty: number,
    childQty: number,
    sessionName: string,
  ) => {
    if (!experience) return;

    // 找出使用者選中的 Session 以確保拿到正確金額
    const targetSession = experience.sessions.find((s) => s.id === sessionId);
    const maxLimit = targetSession?.max_participants ?? 8;

    // 🚀 核心防呆：檢查購物車裡面「原本是否已經有這一個場次」
    const existingCartItem = items.find(
      (item) =>
        item.experienceId === experience.id && item.sessionId === sessionId,
    );

    // 如果不是編輯模式，需要把購物車舊數量與這次選擇的新數量相加
    if (!isEditMode && existingCartItem) {
      const existingTotal =
        Number(existingCartItem.adultQuantity || 0) +
        Number(existingCartItem.childQuantity || 0);
      const newTotal = existingTotal + adultQty + childQty;

      if (newTotal > maxLimit) {
        toast.error(
          `購物車內已有 ${existingTotal} 位，此場次最多預訂 ${maxLimit} 位！`,
        );
        return; // ⛔ 阻擋發送請求
      }
    } else if (adultQty + childQty > maxLimit) {
      toast.error(`該場次最多只能預訂 ${maxLimit} 位！`);
      return;
    }

    const productInfo = {
      experienceId: experience.id,
      name: experience.title,
      price:
        targetSession?.adult_price ??
        experience.adult_price ??
        experience.price ??
        0,
      adultPrice:
        targetSession?.adult_price ??
        experience.adult_price ??
        experience.price ??
        0,
      childPrice: targetSession?.child_price ?? experience.child_price ?? 0,
      image_url: experience.image_url ?? "",
      image: experience.image_url ?? "",
    };

    try {
      if (isEditMode && oldSessionId !== null) {
        await onEdit(
          experience.id,
          oldSessionId,
          productInfo,
          sessionId,
          adultQty,
          childQty,
          sessionName,
        );
        toast.success("已更新購物車資料！");
        router.push("/cart");
        return;
      }

      await onAdd(productInfo, sessionId, adultQty, childQty, sessionName);
      toast.success("已成功加入購物車！");
    } catch (error) {
      console.error("購物車同步失敗:", error);
      toast.error("加入失敗，請確認選擇的場次是否正確！");
    }
  };

  //處理點擊立即預定按鈕到checkout介面
  const handleDirectBook = async (
    sessionId: number,
    adultQty: number,
    childQty: number,
    sessionName: string,
  ) => {
    if (!experience) return;

    const targetSession = experience.sessions.find((s) => s.id === sessionId);
    const maxLimit = targetSession?.max_participants ?? 8;

    // 🚀 核心防呆
    if (adultQty + childQty > maxLimit) {
      toast.error(`該場次最多只能預訂 ${maxLimit} 位！`);
      return;
    }

    const productInfo = {
      experienceId: experience.id,
      name: experience.title,
      price:
        targetSession?.adult_price ??
        experience.adult_price ??
        experience.price ??
        0,
      adultPrice:
        targetSession?.adult_price ??
        experience.adult_price ??
        experience.price ??
        0,
      childPrice: targetSession?.child_price ?? experience.child_price ?? 0,
      image: experience.image_url ?? undefined,
    };

    try {
      // 1. 寫入購物車後跳轉
      await onAdd(productInfo, sessionId, adultQty, childQty, sessionName);
      // 2. 順暢跳轉至結帳頁面
      toast.success("正在前往結帳頁面");
      router.push("/checkout");
    } catch (error) {
      console.error("立即預訂失敗:", error);
      toast.error("預訂失敗，請重試！");
    }
  };

  // 【型別與載入保護】絕對不能刪！有這兩段 TypeScript 才知道底下的 experience 絕對不為 null
  if (isLoading) {
    return <Loading />;
    // return <div className="px-6 py-20 text-center">載入中...</div>;
  }

  if (errorMessage || !experience) {
    return (
      <div className="px-6 py-20 text-center text-[#687076]">
        {errorMessage || "找不到此體驗"}
      </div>
    );
  }
  const galleryImages =
    experience.images.length > 0
      ? experience.images
      : [
          {
            id: 0,
            image_url: "/images/placeholder.jpg",
            is_primary: 1,
            sort_order: 1,
          },
        ];
  return (
    <div className="min-h-screen bg-white text-[#292E33]">
      <main className="mx-auto w-full max-w-[1280px] px-6 pt-10 pb-28 max-sm:px-2 max-sm:pt-0">
        <nav
          className="hidden text-sm font-medium sm:block"
          aria-label="麵包屑"
        >
          <Link
            href="/"
            className="cursor-pointer font-bold text-[#68BBC3] hover:underline"
          >
            首頁
          </Link>
          <span className="mx-2 text-[#7B8388]">›</span>
          <Link
            href={`/experiences/search?city=${encodeURIComponent(experience.city)}`}
          >
            <span className="cursor-pointer text-[#68BBC3] hover:underline">
              {experience.city}
            </span>
          </Link>
          <span className="mx-2 text-[#7B8388]">›</span>
          <Link
            href={`/experiences/search?category_ids=${experience.category_id}`}
          >
            <span className="cursor-pointer text-[#68BBC3] hover:underline">
              {experience.category_name}
            </span>
          </Link>
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="inline-block max-w-[200px] truncate align-bottom text-[#7B8388]">
            {experience.title}
          </span>
        </nav>

        <section className="mt-7 grid h-[510px] grid-cols-2 gap-2 overflow-hidden rounded-lg max-md:h-auto max-md:grid-cols-1 max-sm:relative max-sm:left-1/2 max-sm:mt-0 max-sm:w-screen max-sm:-translate-x-1/2 max-sm:rounded-none">
          {/* 第一張主圖容器 (在手機版將作為所有浮動按鈕的基地) */}
          <div className="relative min-h-[360px] overflow-hidden max-sm:h-[280px] max-sm:min-h-0">
            <Image
              src={galleryImages[0].image_url}
              alt={`${experience.title}主圖`}
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
                onClick={handleFavoriteClick}
                aria-label={favorite ? "取消收藏" : "加入我的最愛"}
                aria-pressed={favorite}
                className="flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform active:scale-90"
              >
                {favorite ? (
                  <HiHeart className="size-5 text-red-500" />
                ) : (
                  <HiOutlineHeart className="size-5" />
                )}
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
          </div>

          {/* 右側四張圖拼圖區：加上 max-sm:hidden，手機版直接隱藏不顯示 */}
          <div className="grid grid-cols-2 grid-rows-2 gap-2 max-md:h-[320px] max-sm:hidden">
            {galleryImages.slice(1, 5).map((photo, index) => (
              <div key={photo.id} className="relative overflow-hidden">
                <Image
                  src={photo.image_url}
                  alt={`${experience.title}照片 ${index + 2}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover"
                />
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
            <IconButton
              label={isLinkCopied ? "網址已複製" : "複製體驗網址"}
              onClick={handleShareClick}
            >
              {isLinkCopied ? (
                <HiCheck className="size-5 text-[#68BBC3]" />
              ) : (
                <FaLink className="size-5" />
              )}
            </IconButton>

            <IconButton
              label={favorite ? "取消收藏" : "加入我的最愛"}
              pressed={favorite}
              onClick={handleFavoriteClick}
            >
              {favorite ? (
                <HiHeart className="size-5 text-red-500" />
              ) : (
                <HiOutlineHeart className="size-5" />
              )}
            </IconButton>
          </div>
        </section>

        <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-12 max-lg:grid-cols-1">
          <div className="w-full max-sm:px-5">
            <div className="w-full border-t border-[#DEE3E5]" />
            <nav className="sticky top-15 z-20 flex gap-8 border-b border-[#DEE3E5] bg-white/95 px-1 backdrop-blur max-sm:[scrollbar-width:none] max-sm:overflow-x-auto max-sm:[&::-webkit-scrollbar]:hidden">
              {[
                ["overview", "體驗介紹"],
                ["host", "在地嚮導"],
                ["location", "集合地點"],
                ["reviews", "旅人好評"],
                ["notes", "注意事項"],
              ].map(([sectionId, label]) => {
                const isActive = activeSection === sectionId;

                return (
                  <button
                    key={sectionId}
                    type="button"
                    onClick={() => scrollToSection(sectionId)}
                    className={`shrink-0 border-b-2 py-4 text-sm font-extrabold transition-colors ${
                      isActive
                        ? "border-[#68BBC3] text-[#4CA3AB]"
                        : "border-transparent text-[#555D62] md:hover:text-[#4CA3AB]"
                    }`}
                  >
                    {label}
                  </button>
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
            <ReviewsSection
              rating={experience.rating}
              reviewCount={experience.review_count}
              reviews={experience.reviews}
            />
            <NotesSection notes={experience.notes} />
          </div>
          {/* 讓最後一個區塊有足夠空間捲到導覽列下方 */}
          <div aria-hidden="true" className="hidden h-[20vh] max-sm:block" />
          <div className="hidden lg:sticky lg:top-20 lg:block">
            <BookingCard
              sessions={experience.sessions}
              isEditMode={isEditMode}
              oldSessionId={oldSessionId}
              oldQty={oldQty}
              onSubmit={handleCartSubmit}
              onDirectBook={handleDirectBook}
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
            <button
              type="button"
              onClick={() => {
                const session = experience.sessions[0];
                if (session) {
                  handleCartSubmit(session.id, 1, 0, session.start_time);
                }
              }}
              disabled={experience.sessions.length === 0}
              className="flex-1 rounded-xl bg-[#FF9224] py-4 text-center text-sm font-black text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              加入購物車
            </button>

            {/* 藍綠色按鈕：立即預訂 */}
            <button
              type="button"
              onClick={() => {
                const session = experience.sessions[0];
                if (session) {
                  handleDirectBook(session.id, 1, 0, session.start_time);
                }
              }}
              disabled={experience.sessions.length === 0}
              className="flex-1 rounded-xl bg-[#68BBC3] py-4 text-center text-sm font-black text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              立即預訂
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
