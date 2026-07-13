"use client";

import Image from "next/image";
import { useState } from "react";
import { HiOutlineHeart, HiHeart } from "react-icons/hi";

type Experience = {
  id: number;
  title: string;
  location: string;
  rating: string;
  reviews: string;
  price: string;
  image: string;
};

export default function ExperienceCard({
  experience,
}: {
  experience: Experience;
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="card flex w-full flex-col overflow-hidden bg-white shadow-sm transition-all duration-500 ease-out will-change-transform md:h-[340px] md:hover:-translate-y-2 md:hover:shadow-[0_16px_34px_rgba(39,68,72,0.16)]">
      <figure className="relative aspect-[16/10] w-full shrink-0 overflow-hidden md:aspect-auto md:h-[190px]">
        <Image
          src={experience.image}
          alt={experience.title}
          fill
          sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 45vw, 300px"
          className="object-cover"
        />
        <button
          type="button"
          aria-label={isFavorite ? "取消收藏" : "加入最愛"}
          className="absolute top-3 right-3 z-10 cursor-pointer p-1 transition-transform duration-300 hover:scale-110 active:scale-95"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          {isFavorite ? (
            <HiHeart className="size-6 text-red-500 drop-shadow-[0_2px_5px_rgba(0,0,0,0.2)] filter" />
          ) : (
            <HiOutlineHeart className="size-6 text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.25)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] filter transition-colors" />
          )}
        </button>
      </figure>
      <div className="flex flex-1 flex-col px-4 pt-3 pb-6">
        <p className="text-[12px] font-medium text-[#858C91]">
          {experience.location}
        </p>
        <p className="mt-1 line-clamp-2 h-auto text-[16px] leading-6 font-extrabold text-[#2E3338] max-md:leading-tight md:h-[48px]">
          {experience.title}
        </p>
        <p className="mt-1 text-[12px] font-bold">
          <span className="text-[#F4A629]">{experience.rating}</span>
          <span className="ml-1 font-medium text-[#8A9196]">
            ({experience.reviews})
          </span>
        </p>
        <p className="mt-4 text-[16px] font-extrabold text-[#30353A] md:mt-auto">
          {experience.price}
        </p>
      </div>
    </div>
  );
}
