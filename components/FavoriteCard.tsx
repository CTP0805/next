"use client";

import Image from "next/image";
import Link from "next/link";
import { HiStar, HiHeart, HiOutlineHeart } from "react-icons/hi";
import { useFavorites, type FavoriteItem } from "@/contexts/FavoriteContext";

export default function FavoriteCard({ item }: { item: FavoriteItem }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(item.id);

  const handleFavoriteClick = async () => {
    try {
      await toggleFavorite(item.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "心願清單操作失敗";

      alert(message);
    }
  };

  return (
    <div className="relative mb-5 grid min-h-[200px] grid-cols-[220px_minmax(0,1fr)] gap-6 rounded-xl border-none bg-white p-0 shadow-sm transition-all duration-300 max-md:grid-cols-[150px_minmax(0,1fr)] max-md:gap-4 max-sm:grid-cols-1 max-sm:bg-transparent max-sm:shadow-none sm:border sm:border-[#ECEFF0] sm:p-5 md:hover:shadow-md">
      <Link
        href={`/experiences/${item.id}`}
        aria-label={`查看${item.title}詳情`}
        className="absolute inset-0 z-0 rounded-xl"
      />
      <figure className="pointer-events-none relative h-[172px] overflow-hidden rounded-md max-md:h-[150px] max-sm:h-[220px] max-sm:rounded-xl">
        <Image
          src={item.image_url ?? "/images/placeholder.jpg"}
          alt={item.title}
          fill
          sizes="(max-width: 640px) calc(100vw - 48px), 220px"
          className="object-cover"
        />

        {/* 📱 【手機版專屬愛心】放這裡：
            - max-sm:block：只有在手機版（小於 640px）時顯現。
            - absolute top-3 right-3：強迫精準留在圖片內部右上角。
            - hidden：電腦版、平版時完全隱藏。
        */}
        <button
          type="button"
          aria-label={favorite ? "取消收藏" : "加入最愛"}
          aria-pressed={favorite}
          className="pointer-events-auto absolute top-3 right-3 z-10 hidden cursor-pointer p-1 max-sm:block"
          onClick={handleFavoriteClick}
        >
          {favorite ? (
            <HiHeart className="size-6 scale-110 text-red-500 transition-transform duration-200" />
          ) : (
            <HiOutlineHeart className="size-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]" />
          )}
        </button>
      </figure>
      <div className="pointer-events-none flex min-w-0 flex-col py-2 pr-16 max-sm:px-4 max-sm:pr-0">
        <p className="text-[17px] leading-7 font-bold text-[#2B2F33]">
          {item.title}
        </p>
        <p className="p-text-14 mt-1 font-medium text-[#7A8187]">{item.city}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[14px]">
          {item.review_count > 0 ? (
            <>
              <span className="flex items-center gap-1 font-extrabold text-[#F4A629]">
                <HiStar className="size-4 shrink-0" />
                {item.rating}
              </span>

              <span className="font-medium text-[#6F777D]">
                {item.review_count.toLocaleString("zh-TW")} 則評價
              </span>
            </>
          ) : (
            <span className="font-medium text-[#6F777D]">尚無評價</span>
          )}
        </div>
        <span className="mt-3 w-fit rounded bg-[#E8F7F7] px-3 py-1 text-[14px] font-bold text-[#409DA5] max-sm:hidden">
          {item.category_name}
        </span>
        <p className="mt-auto self-end font-extrabold text-[#30343A] max-sm:mt-2 max-sm:self-start">
          NT$ {item.price.toLocaleString("zh-TW")} 起
        </p>
      </div>
      {/* 💻 【電腦版專屬愛心】留在最外層大容器底部：
          - max-sm:hidden：一到手機版就直接蒸發，不干涉手機排版。
          - block：大螢幕時如你所願出現在白卡片的右上角。
      */}
      <button
        type="button"
        aria-label={favorite ? "取消收藏" : "加入最愛"}
        aria-pressed={favorite}
        className="absolute top-8 right-5 z-10 block cursor-pointer p-1 max-sm:hidden"
        onClick={handleFavoriteClick}
      >
        {favorite ? (
          <HiHeart className="size-6 scale-110 text-red-500 transition-transform duration-200" />
        ) : (
          <HiOutlineHeart className="size-6 text-[#BCC3C7] transition-colors" />
        )}
      </button>
    </div>
  );
}
