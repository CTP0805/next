"use client";

import { useFavorites } from "@/contexts/FavoriteContext";
import FavoriteCard from "@/components/FavoriteCard";
import { useMemo, useState } from "react";

type FavoriteSort = "latest" | "rating" | "price-low";

export default function FavoritesPage() {
  const { favoriteItems, loading } = useFavorites();

  const [sort, setSort] = useState<FavoriteSort>("latest");

  const sortedFavoriteItems = useMemo(() => {
    const items = [...favoriteItems];

    if (sort === "rating") {
      return items.sort(
        (a, b) => b.rating - a.rating || b.review_count - a.review_count,
      );
    }

    if (sort === "price-low") {
      return items.sort((a, b) => a.price - b.price);
    }

    // 後端本來就按照收藏時間由新到舊回傳
    return items;
  }, [favoriteItems, sort]);

  if (loading) {
    return (
      <div className="px-8 py-16 text-center text-[#687076]">
        心願清單載入中...
      </div>
    );
  }

  return (
    <div className="text-[#292D32]">
      {/* 
        💡 修正 1：移除 min-h-screen 和過大的 pt-16。
        把原本的 mx-auto grid 簡化。手機版不需要多餘的 padding 塞在 layout 內。
      */}
      <div className="w-full">
        {/* 
          💡 修正 2：
          - 電腦版：維持原本的卡片包裝框。
          - 手機版：max-md:shadow-none max-md:rounded-none，拔掉重複的陰影跟圓角，
                   直接融入 layout 的大白底背景中！
        */}

        {/* 💡 修正 3：標題「我的心願清單」，手機版高度太空，微調內邊距 */}

        <div className="max-sm:px-0">
          {/* 
              💡 修正 4：
              - 加上 items-center，強迫「目前有12個體驗」跟「下拉選單」不論在哪種螢幕都垂直完美置中！
              - 攤平結構：把之前的 label 套娃改成乾淨的平級結構。
            */}
          <div className="flex min-h-[92px] items-center justify-between gap-4 border-b border-[#ECEFF0] max-sm:min-h-0 max-sm:py-4">
            <p className="text-[17px] font-bold text-[#51585E] max-sm:text-[15px]">
              目前有{" "}
              <span className="text-[22px] font-extrabold text-[#68BBC3] max-sm:text-lg">
                {favoriteItems.length}
              </span>{" "}
              個體驗等你去實現
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap text-[#8A9196] max-sm:hidden">
                排序方式
              </span>
              <select
                aria-label="排序方式"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as FavoriteSort)
                }
                className="select select-bordered h-10 min-h-10 rounded-md border border-[#E1E5E7] bg-white pr-10 pl-4 text-sm font-bold text-[#454B50] outline-none hover:border-[#68BBC3]"
              >
                <option value="latest">最新收藏</option>
                <option value="rating">評價最高</option>
                <option value="price-low">價格低到高</option>
              </select>
            </div>
          </div>

          {/* 卡片列表 */}
          <div className="mt-6 flex flex-col gap-4 max-sm:mt-4">
            {favoriteItems.length === 0 ? (
              <div className="rounded-lg border border-[#E3E7E9] px-6 py-16 text-center">
                <p className="font-bold text-[#596066]">心願清單目前是空的</p>
                <p className="mt-2 text-sm text-[#969CA1]">
                  找到喜歡的體驗後，點擊愛心收藏吧！
                </p>
              </div>
            ) : (
              sortedFavoriteItems.map((item) => (
                <FavoriteCard key={item.id} item={item} />
              ))
            )}
          </div>

          {favoriteItems.length > 0 && (
            <div className="py-10 text-center text-sm font-medium tracking-wide text-[#8A9196]">
              到底了！暫時沒有其他體驗囉
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
