"use client";

import { useEffect, useMemo, useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import FavoriteCard from "@/components/FavoriteCard";
import type { FavoriteItem } from "@/contexts/FavoriteContext";
import { API_SERVER } from "@/config/api-path";

// TS 型別專區
// 最近瀏覽比 FavoriteItem 多了 viewed_at。
// FavoriteCard 不會用到 viewed_at，但保留它方便未來顯示瀏覽時間。
interface RecentlyViewedItem extends FavoriteItem {
  viewed_at: string;
}

interface RecentlyViewedApiResponse {
  success: true | false;
  message?: string;
  data?: RecentlyViewedItem[];
}

type RecentlyViewedSort = "newest" | "oldest";

export default function RecentlyViewedPage() {
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<
    RecentlyViewedItem[]
  >([]);

  // const [isLoading, setIsLoading] = useState(true);
  // const [errorMessage, setErrorMessage] = useState("");

  // 預設由新到舊顯示
  const [sort, setSort] = useState<RecentlyViewedSort>("newest");

  // useMemo 用來快取，只有在資料或排序選項(依賴)改變時，才重新排序
  const sortedRecentlyViewedItems = useMemo(() => {
    // 先複製一份陣列，因為 sort 會直接更動原本的陣列
    const items = [...recentlyViewedItems];

    return items.sort((a, b) => {
      const timeA = new Date(a.viewed_at).getTime();
      const timeB = new Date(b.viewed_at).getTime();

      // 新資料排前面
      if (sort === "newest") {
        return timeB - timeA;
      }

      // 舊資料排前面( JS 規定:相減為負數時，前項擺前面，即:小-->大、相減為正數時，後項擺前面，即:大-->小)
      return timeA - timeB;
    });
  }, [recentlyViewedItems, sort]);

  useEffect(() => {
    const getRecentlyViewed = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${API_SERVER}/api/member/recently-viewed`,
          {
            credentials: "include",
          },
        );

        // if (response.status === 401) {
        //   setErrorMessage("請先登入會員");
        //   return;
        // }

        const result = (await response.json()) as RecentlyViewedApiResponse;

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message ?? "取得最近瀏覽資料失敗");
        }

        // MySQL 的 DECIMAL 可能會被回傳成字串，
        // 所以在前端統一轉成 number，讓 FavoriteCard 能正常顯示。
        setRecentlyViewedItems(
          result.data.map((item) => ({
            ...item,
            id: Number(item.id),
            price: Number(item.price),
            rating: Number(item.rating),
            review_count: Number(item.review_count),
          })),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "取得最近瀏覽資料失敗";

        // setErrorMessage(message);
      } finally {
        //setIsLoading(false);
      }
    };

    void getRecentlyViewed();
  }, []);

  // if (isLoading) {
  //   return (
  //     <div className="px-8 py-16 text-center text-[#687076]">
  //       正在載入最近瀏覽資料…
  //     </div>
  //   );
  // }

  // if (errorMessage) {
  //   return (
  //     <div className="px-8 py-16 text-center text-[#687076]">
  //       {errorMessage}
  //     </div>
  //   );
  // }

  return (
    <div className="text-[#292D32]">
      <div className="w-full">
        <div className="max-sm:px-0">
          <div className="flex min-h-[92px] items-center justify-between gap-4 border-b border-[#ECEFF0] max-md:hidden max-sm:min-h-0 max-sm:py-4">
            <p className="text-[17px] font-bold text-[#51585E] max-sm:text-[15px]">
              最近瀏覽
              <span className="mx-2 text-[22px] font-extrabold text-[#68BBC3] max-sm:text-lg">
                {recentlyViewedItems.length}
              </span>
              筆體驗
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap text-[#8A9196]">
                排序：
              </span>

              <div className="relative w-[82px]">
                <select
                  aria-label="最近瀏覽排序方式"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as RecentlyViewedSort)
                  }
                  className="select select-bordered h-10 min-h-10 w-full !appearance-none rounded-md border border-[#E1E5E7] bg-white !bg-none pr-9 pl-4 text-sm font-bold text-[#454B50] outline-none hover:border-[#68BBC3]"
                >
                  <option value="newest">最新</option>
                  <option value="oldest">最舊</option>
                </select>

                <HiChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-2.5 size-5 -translate-y-1/2 text-[#687076]"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 max-sm:mt-4">
            {recentlyViewedItems.length === 0 ? (
              <div className="rounded-lg border border-[#E3E7E9] px-6 py-16 text-center">
                <p className="font-bold text-[#596066]">
                  目前還沒有最近瀏覽的體驗
                </p>
                <p className="mt-2 text-sm text-[#969CA1]">
                  前往體驗列表，看看你感興趣的行程吧。
                </p>
              </div>
            ) : (
              sortedRecentlyViewedItems.map((item) => (
                // RecentlyViewedItem 包含 FavoriteItem 的全部欄位，
                // 所以可直接交給既有 FavoriteCard。
                <FavoriteCard key={item.id} item={item} />
              ))
            )}
          </div>

          {recentlyViewedItems.length > 0 && (
            <div className="py-10 text-center text-sm font-medium tracking-wide text-[#8A9196]">
              僅顯示最近瀏覽的 20 筆體驗
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
