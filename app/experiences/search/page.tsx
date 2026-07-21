"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import FilterPanel from "@/app/experiences/_components/FilterPanel";
import ExperienceCard from "@/app/experiences/_components/ExperienceCard";
import Link from "next/link";
import { HiAdjustments, HiChevronUp, HiChevronDown } from "react-icons/hi";

type Experience = {
  id: number;
  title: string;
  city: string;
  category_name: string | null;
  price: number;
  image_url: string | null;
  rating: number;
  review_count: number;
};

type Category = {
  id: number;
  label: string;
  count: number;
};

type SortOption = "popular" | "rating" | "price_asc";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function ExperienceListPage() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const city = searchParams.get("city")?.trim() ?? "";
  const [selectedDate, setSelectedDate] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>(() => {
    const categoryIdsParam = searchParams.get("category_ids");

    if (!categoryIdsParam) return [];

    return categoryIdsParam
      .split(",")
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState<SortOption>("popular");
  const MAX_PRICE_LIMIT = 9999;
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_LIMIT);
  const [page, setPage] = useState(1);
  const titleKeyword = keyword || city;
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isFirstLoad = useRef(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // 建立控制「回到頂端」按鈕是否顯示的狀態
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    async function loadExperiences() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (keyword) {
          params.set("keyword", keyword);
        }

        if (city) {
          params.set("city", city);
        }
        if (selectedDate) {
          params.set("date", selectedDate);
        }
        if (categoryIds.length > 0) {
          params.set("category_ids", categoryIds.join(","));
        }

        if (minPrice > 0) {
          params.set("min_price", String(minPrice));
        }

        if (maxPrice < MAX_PRICE_LIMIT) {
          params.set("max_price", String(maxPrice));
        }

        params.set("sort", sort);
        params.set("page", String(page));

        const queryString = params.toString();

        const url = queryString
          ? `http://localhost:3001/api/experiences?${queryString}`
          : "http://localhost:3001/api/experiences";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`請求失敗：${response.status}`);
        }

        const result = await response.json();

        if (
          result.status !== "success" ||
          !Array.isArray(result.data) ||
          !result.pagination
        ) {
          throw new Error("後端回傳格式不正確");
        }

        setExperiences(result.data);
        setPagination(result.pagination);
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
        } else {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      } catch (error) {
        console.error(error);
        setError("體驗資料載入失敗");
      } finally {
        setLoading(false);
      }
    }

    const timer = window.setTimeout(() => {
      loadExperiences();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    keyword,
    city,
    categoryIds,
    minPrice,
    maxPrice,
    selectedDate,
    sort,
    page,
  ]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const params = new URLSearchParams();

        if (keyword) {
          params.set("keyword", keyword);
        }

        if (city) {
          params.set("city", city);
        }

        if (selectedDate) {
          params.set("date", selectedDate);
        }

        const queryString = params.toString();

        const url = queryString
          ? `http://localhost:3001/api/experiences/categories?${queryString}`
          : "http://localhost:3001/api/experiences/categories";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`取得分類失敗：${response.status}`);
        }

        const result = await response.json();

        if (result.status !== "success" || !Array.isArray(result.data)) {
          throw new Error("分類格式不正確");
        }

        setCategories(result.data);
      } catch (error) {
        console.error(error);
      }
    }

    loadCategories();
  }, [keyword, city, selectedDate]);

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

  if (error) return <p>{error}</p>;

  // ⭕️ 3. 點擊回到頂端的點擊事件
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // 讓它平滑地滾動上去，更有質感
    });
  };

  const handleCategoryIdsChange = (newCategoryIds: number[]) => {
    setCategoryIds(newCategoryIds);
    setPage(1);
  };

  const handleMinPriceChange = (newMinPrice: number) => {
    setMinPrice(newMinPrice);
    setPage(1);
  };

  const handleMaxPriceChange = (newMaxPrice: number) => {
    setMaxPrice(newMaxPrice);
    setPage(1);
  };

  const handleSelectedDateChange = (date: string) => {
    setSelectedDate(date);
    setPage(1);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
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
          <span>{titleKeyword || "全部體驗"}</span>
        </nav>

        <h2 className="mt-6 leading-tight font-extrabold text-[#292E33] max-md:hidden">
          {titleKeyword ? (
            <>
              與 <span className="text-[#68BBC3]">{titleKeyword}</span>{" "}
              相關的體驗
            </>
          ) : (
            "全部體驗"
          )}
        </h2>
        <div className="mt-9 grid grid-cols-[280px_minmax(0,1fr)] items-start gap-8 max-lg:grid-cols-1 max-md:mt-2">
          <div className="sticky top-25 h-fit max-lg:hidden">
            <FilterPanel
              maxPriceLimit={MAX_PRICE_LIMIT}
              categories={categories}
              categoryIds={categoryIds}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryIdsChange={handleCategoryIdsChange}
              onMinPriceChange={handleMinPriceChange}
              onMaxPriceChange={handleMaxPriceChange}
              selectedDate={selectedDate}
              onSelectedDateChange={handleSelectedDateChange}
            />
          </div>
          <section aria-label="體驗列表" className="min-w-0">
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-[16px] font-bold whitespace-nowrap text-[#596066] sm:text-[17px]">
                <span className="mr-1 text-[20px] font-extrabold text-[#68BBC3] sm:text-[24px]">
                  {pagination.total}
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
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(event) =>
                      handleSortChange(event.target.value as SortOption)
                    }
                    aria-label="排序方式"
                    className="h-10 appearance-none rounded-md border border-[#DDE2E4] bg-white py-0 pr-11 pl-4 text-sm font-bold text-[#4D545A] outline-none hover:border-[#68BBC3] hover:ring-2 hover:ring-[#68BBC3]/20"
                  >
                    <option value="popular">熱門推薦</option>
                    <option value="rating">評價最高</option>
                    <option value="price_asc">價格低到高</option>
                  </select>

                  <HiChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#737B81]"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center">
                <p className="font-bold text-[#596066]">載入中...</p>
              </div>
            ) : experiences.length === 0 ? (
              <div className="rounded-lg border border-[#E3E7E9] px-6 py-16 text-center">
                <p className="font-bold text-[#596066]">找不到符合條件的體驗</p>
                <p className="mt-2 text-sm text-[#969CA1]">
                  請調整或清除篩選條件
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-x-6 gap-y-14 max-md:grid-cols-2 max-sm:grid-cols-1">
                {experiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    id={experience.id}
                    title={experience.title}
                    city={experience.city}
                    categoryName={experience.category_name}
                    price={experience.price}
                    imageUrl={experience.image_url}
                    rating={experience.rating}
                    reviewCount={experience.review_count}
                  />
                ))}
              </div>
            )}
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
              <button
                type="button"
                aria-label="上一頁"
                disabled={page === 1}
                onClick={() => setPage((currentPage) => currentPage - 1)}
                className="grid size-10 place-items-center rounded-md border border-[#E0E4E6] bg-white text-sm font-bold text-[#6E757B] hover:border-[#68BBC3] hover:text-[#489DA5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹
              </button>

              {Array.from(
                { length: pagination.totalPages },
                (_, index) => index + 1,
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  aria-current={pageNumber === page ? "page" : undefined}
                  aria-label={`第 ${pageNumber} 頁`}
                  onClick={() => setPage(pageNumber)}
                  className={
                    pageNumber === page
                      ? "grid size-10 place-items-center rounded-md bg-[#68BBC3] text-sm font-extrabold text-white"
                      : "grid size-10 place-items-center rounded-md border border-[#E0E4E6] bg-white text-sm font-bold text-[#6E757B] hover:border-[#68BBC3] hover:text-[#489DA5]"
                  }
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                aria-label="下一頁"
                disabled={
                  page >= pagination.totalPages || pagination.totalPages === 0
                }
                onClick={() => setPage((currentPage) => currentPage + 1)}
                className="grid size-10 place-items-center rounded-md border border-[#E0E4E6] bg-white text-sm font-bold text-[#6E757B] hover:border-[#68BBC3] hover:text-[#489DA5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ›
              </button>
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
            <FilterPanel
              maxPriceLimit={MAX_PRICE_LIMIT}
              categories={categories}
              categoryIds={categoryIds}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryIdsChange={handleCategoryIdsChange}
              onMinPriceChange={handleMinPriceChange}
              onMaxPriceChange={handleMaxPriceChange}
              selectedDate={selectedDate}
              onSelectedDateChange={handleSelectedDateChange}
            />
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
