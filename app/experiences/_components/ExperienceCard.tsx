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
    <div className="card bg-white w-full h-[340px] shadow-sm flex flex-col overflow-hidden transition-all duration-500 ease-out will-change-transform hover:-translate-y-2 hover:shadow-[0_16px_34px_rgba(39,68,72,0.16)] focus-within:-translate-y-2 focus-within:shadow-[0_16px_34px_rgba(39,68,72,0.16)]">
      <figure className="relative h-[55%] w-full overflow-hidden shrink-0">
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
          className="absolute right-3 top-3 z-10 cursor-pointer p-1"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          {isFavorite ? (
            <HiHeart className="size-6 text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] scale-110 transition-transform duration-200" />
          ) : (
            <HiOutlineHeart className="size-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] hover:text-red-500 transition-colors" />
          )}
        </button>
      </figure>
      <div className="h-[45%] px-4 pb-6 pt-3 flex flex-col">
        <p className="text-xs font-medium text-[#858C91]">
          {experience.location}
        </p>
        <h2 className="mt-1 line-clamp-2 text-[16px] font-extrabold leading-6 text-[#2E3338]">
          {experience.title}
        </h2>
        <p className="mt-0.5 text-sm font-bold">
          <span className="text-[#F4A629]">{experience.rating}</span>
          <span className="ml-1 font-medium text-[#8A9196]">
            ({experience.reviews})
          </span>
        </p>
        <p className="mt-auto text-[18px] font-extrabold text-[#30353A]">
          {experience.price}
        </p>
      </div>
    </div>
  );
}
