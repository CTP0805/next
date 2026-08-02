"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterPanel from "@/app/experiences/_components/FilterPanel";
import ExperienceCard from "@/app/experiences/_components/ExperienceCard";
import Link from "next/link";
import { HiAdjustments, HiChevronUp } from "react-icons/hi";
import Loading from "@/components/Loading";

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
  const router = useRouter();
  const pathname = usePathname();
  const MAX_PRICE_LIMIT = 9999;
  const urlCity = searchParams.get("city") ?? "";
  const keyword = searchParams.get("keyword") ?? "";
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = searchParams.get("date") ?? "";

    return date === "tomorrow" || /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  });
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
  const [sort, setSort] = useState<SortOption>(() => {
    const urlSort = searchParams.get("sort");

    return urlSort === "rating" ||
      urlSort === "price_asc" ||
      urlSort === "popular"
      ? urlSort
      : "popular";
  });
  const [city, setCity] = useState(urlCity);
  const CITY_NAMES = ["倫敦", "巴黎", "阿姆斯特丹", "東京", "首爾", "台北"];

  const [minPrice, setMinPrice] = useState(() => {
    const value = Number(searchParams.get("min_price"));

    return Number.isFinite(value) && value >= 0 ? value : 0;
  });
  const [maxPrice, setMaxPrice] = useState(() => {
    const maxPriceParam = searchParams.get("max_price");

    if (!maxPriceParam) return MAX_PRICE_LIMIT;

    const value = Number(maxPriceParam);

    return Number.isFinite(value) && value >= 0 && value <= MAX_PRICE_LIMIT
      ? value
      : MAX_PRICE_LIMIT;
  });
  const [page, setPage] = useState(() => {
    const value = Number(searchParams.get("page"));

    return Number.isInteger(value) && value > 0 ? value : 1;
  });

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
  const isSyncingCityFromUrlRef = useRef(false);
  const previousUrlCityRef = useRef(urlCity);
  const previousKeywordRef = useRef(keyword);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const clearFilters = () => {
    setCity("");
    setCategoryIds([]);
    setMinPrice(0);
    setMaxPrice(MAX_PRICE_LIMIT);
    setSelectedDate("");
    setPage(1);
  };
  const activeFilterCount =
    (city ? 1 : 0) +
    categoryIds.length +
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < MAX_PRICE_LIMIT ? 1 : 0) +
    (selectedDate ? 1 : 0);
  // 建立控制「回到頂端」按鈕是否顯示的狀態
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (previousUrlCityRef.current === urlCity) return;

    previousUrlCityRef.current = urlCity;

    if (city !== urlCity) {
      isSyncingCityFromUrlRef.current = true;

      setCity(urlCity);

      // 保留原本的類別與其他篩選條件
      // setCategoryIds([]);
      // setMinPrice(0);
      // setMaxPrice(MAX_PRICE_LIMIT);
      // setSelectedDate("");
      // setSort("popular");

      setPage(1);
    }
  }, [urlCity, city]);

  // 💡 在列表頁元件中放置這段程式碼
  useEffect(() => {
    // 1. 強制讓瀏覽器不要擅自恢復之前的滾動位置
    if (
      typeof window !== "undefined" &&
      "scrollRestoration" in window.history
    ) {
      window.history.scrollRestoration = "manual";
    }

    // 2. 剛回到列表頁時，強制回到最頂端
    window.scrollTo(0, 0);

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
    if (!isFilterOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isFilterOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        setIsFilterOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (previousKeywordRef.current === keyword) return;

    previousKeywordRef.current = keyword;

    // 因為改選城市而移除 keyword 時，
    // 保留目前已套用的其他篩選條件
    if (!keyword) {
      setPage(1);
      return;
    }

    // 使用搜尋列輸入新的關鍵字時，才重設其他篩選條件
    setCategoryIds([]);
    setMinPrice(0);
    setMaxPrice(MAX_PRICE_LIMIT);
    setSelectedDate("");
    setSort("popular");
    setPage(1);
  }, [keyword]);

  useEffect(() => {
    if (isSyncingCityFromUrlRef.current) {
      if (city === urlCity) {
        isSyncingCityFromUrlRef.current = false;
      }

      return;
    }
    const params = new URLSearchParams();
    // 保留搜尋本身帶來的條件
    if (keyword) {
      params.set("keyword", keyword);
      // 只有當 city 真的跟 keyword 不一樣時（例如 keyword=旅拍 & city=倫敦）才同時帶 city
      if (city && city !== keyword) {
        params.set("city", city);
      }
    } else if (city) {
      params.set("city", city);
    }

    // 非預設值才寫進網址，網址會比較乾淨
    if (categoryIds.length > 0) {
      params.set("category_ids", categoryIds.join(","));
    }

    if (minPrice > 0) {
      params.set("min_price", String(minPrice));
    }

    if (maxPrice < MAX_PRICE_LIMIT) {
      params.set("max_price", String(maxPrice));
    }

    if (selectedDate) {
      params.set("date", selectedDate);
    }

    if (sort !== "popular") {
      params.set("sort", sort);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery === currentQuery) return;

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [
    keyword,
    city,
    urlCity,
    categoryIds,
    minPrice,
    maxPrice,
    selectedDate,
    sort,
    page,
    searchParams,
    pathname,
    router,
  ]);
  useEffect(() => {
    async function loadExperiences() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (keyword) {
          params.set("keyword", keyword);
          // 只有當使用者在左側選單『手動挑選了不同的城市』時，才同時帶 city
          if (city && city !== keyword) {
            params.set("city", city);
          }
        } else if (city) {
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
        const response = await fetch(
          "http://localhost:3001/api/experiences/categories",
        );

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
  }, []);

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

  const handleCityChange = (newCity: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newCity) {
      params.set("city", newCity);
    } else {
      params.delete("city");
    }

    const currentKeyword = params.get("keyword")?.trim() ?? "";

    // 搜尋列原本搜尋的是城市，改選其他城市後移除舊城市 keyword
    if (CITY_NAMES.includes(currentKeyword)) {
      params.delete("keyword");
    }

    params.delete("page");

    const nextQuery = params.toString();

    router.replace(
      nextQuery ? `/experiences/search?${nextQuery}` : "/experiences/search",
      {
        scroll: false,
      },
    );
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
          <span>{titleKeyword || "探索體驗"}</span>
        </nav>

        <h2 className="mt-6 leading-tight font-extrabold text-[#292E33] max-md:hidden">
          {titleKeyword ? (
            <>
              與 <span className="text-[#68BBC3]">{titleKeyword}</span>{" "}
              相關的體驗
            </>
          ) : (
            "探索體驗"
          )}
        </h2>
        <div className="mt-9 grid grid-cols-[280px_minmax(0,1fr)] items-start gap-8 max-lg:grid-cols-1 max-md:mt-2">
          <div className="sticky top-25 h-fit max-lg:hidden">
            <FilterPanel
              maxPriceLimit={MAX_PRICE_LIMIT}
              city={city}
              onCityChange={handleCityChange}
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
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="shrink-0 text-[16px] font-bold whitespace-nowrap text-[#596066] sm:text-[14px]">
                  <span className="mr-1 text-[20px] font-extrabold text-[#68BBC3] sm:text-[18px]">
                    {pagination.total}
                  </span>
                  項體驗可預訂
                </p>

                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(true)}
                    className="flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-[#DDE2E4] px-3 text-sm font-bold text-[#4D545A] hover:border-[#68BBC3] lg:hidden"
                  >
                    <HiAdjustments className="size-4 text-[#68BBC3]" />
                    <span>篩選</span>
                  </button>

                  <select
                    value={sort}
                    onChange={(event) =>
                      handleSortChange(event.target.value as SortOption)
                    }
                    aria-label="排序方式"
                    className="select h-10 min-h-10 w-[116px] rounded-md border border-[#DDE2E4] bg-white px-2 text-sm font-bold text-[#4D545A] shadow-none outline-none hover:border-[#68BBC3] focus:outline-none sm:w-[140px]"
                  >
                    <option value="popular">熱門推薦</option>
                    <option value="rating">評價最高</option>
                    <option value="price_asc">價格低到高</option>
                  </select>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex items-center gap-3 rounded-md bg-[#F4FAFA] px-3 py-2">
                  <p className="text-sm font-bold text-[#596066]">
                    已套用 {activeFilterCount} 個篩選條件
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="hidden border-l border-[#9FCED2] pl-3 text-sm font-bold text-[#419AA2] hover:underline lg:block"
                  >
                    清除
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <Loading />
            ) : // <div className="px-6 py-16 text-center">
            //   <p className="font-bold text-[#596066]">載入中...</p>
            // </div>
            experiences.length === 0 ? (
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
            {/* 手機／平板版簡化分頁 */}
            <nav
              aria-label="手機版商品列表分頁"
              className="mt-12 flex items-center justify-center gap-3 md:hidden"
            >
              <button
                type="button"
                aria-label="上一頁"
                disabled={page === 1}
                onClick={() => setPage((currentPage) => currentPage - 1)}
                className="grid size-10 place-items-center rounded-md border border-[#E0E4E6] bg-white text-lg font-bold text-[#6E757B] hover:border-[#68BBC3] hover:text-[#489DA5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹
              </button>

              <span className="min-w-[90px] text-center text-sm font-bold text-[#596066]">
                第 {page} / {pagination.totalPages || 1} 頁
              </span>

              <button
                type="button"
                aria-label="下一頁"
                disabled={
                  page >= pagination.totalPages || pagination.totalPages === 0
                }
                onClick={() => setPage((currentPage) => currentPage + 1)}
                className="grid size-10 place-items-center rounded-md border border-[#E0E4E6] bg-white text-lg font-bold text-[#6E757B] hover:border-[#68BBC3] hover:text-[#489DA5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ›
              </button>
            </nav>
            <nav
              aria-label="商品列表分頁"
              className="mt-20 flex items-center justify-center gap-2 max-md:hidden"
            >
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
            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="text-3xl leading-none text-[#555D62]"
              aria-label="關閉篩選"
            >
              ×
            </button>

            <h3 className="text-lg font-extrabold text-[#292E33]">篩選條件</h3>

            <button
              type="button"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              className="text-base font-bold text-[#292E33] underline underline-offset-4 disabled:opacity-40"
            >
              清除
            </button>
          </div>
          {/* 彈窗內容：直接把原本的 FilterPanel 塞進來，加上滾動條 */}
          <div className="flex-1 overflow-y-auto p-6">
            <FilterPanel
              maxPriceLimit={MAX_PRICE_LIMIT}
              city={city}
              onCityChange={handleCityChange}
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
              className="button-main w-full text-lg font-bold"
            >
              查看 {pagination.total.toLocaleString("zh-TW")} 項結果
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
