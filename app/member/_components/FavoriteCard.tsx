"use client";

import Image from "next/image";
import { HiStar, HiHeart, HiOutlineHeart } from "react-icons/hi";
import { useState } from "react";

type FavoriteItem = {
  id: number;
  title: string;
  location: string;
  rating: string;
  reviews: string;
  tag: string;
  price: string;
  image: string;
};

export default function FavoriteCard({ item }: { item: FavoriteItem }) {
  const [isFavorite, setIsFavorite] = useState(true);
  return (
    <div className="relative mb-5 grid min-h-[200px] grid-cols-[220px_minmax(0,1fr)] gap-6 rounded-xl border border-[#ECEFF0] bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md max-md:grid-cols-[150px_minmax(0,1fr)] max-md:gap-4 max-sm:grid-cols-1">
      <figure className="relative h-[172px] overflow-hidden rounded-md bg-[#EEF1F2] max-md:h-[150px] max-sm:h-[220px]">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) calc(100vw - 48px), 220px"
          className="object-cover"
        />
      </figure>
      <div className="flex min-w-0 flex-col py-2 pr-16 max-sm:pr-0">
        <h2 className="text-[17px] font-bold leading-7 text-[#2B2F33]">
          {item.title}
        </h2>
        <p className="mt-1 text-sm font-medium text-[#7A8187]">
          {item.location}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm">
          <span className="flex items-center gap-1 font-extrabold text-[#F4A629]">
            <HiStar className="size-4 shrink-0" />
            {item.rating}
          </span>
          <span className="font-medium text-[#6F777D]">{item.reviews}</span>
        </div>
        <span className="mt-3 w-fit rounded bg-[#E8F7F7] px-3 py-1 text-xs font-bold text-[#409DA5]">
          {item.tag}
        </span>
        <p className="mt-auto self-end text-[20px] font-extrabold text-[#30343A]">
          {item.price}
        </p>
      </div>
      <button
        type="button"
        aria-label={isFavorite ? "取消收藏" : "加入最愛"}
        className="absolute right-2 top-8 z-10 cursor-pointer p-1"
        onClick={() => setIsFavorite(!isFavorite)}
      >
        {isFavorite ? (
          <HiHeart className="size-6 text-red-500  scale-110 transition-transform duration-200" />
        ) : (
          <HiOutlineHeart className="size-6 text-[#BCC3C7] hover:text-red-500 transition-colors" />
        )}
      </button>
    </div>
  );
}
