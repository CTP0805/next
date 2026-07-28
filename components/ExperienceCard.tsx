"use client";

import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/contexts/FavoriteContext";
import { useState, useEffect } from "react";
import { HiStar, HiHeart, HiOutlineHeart } from "react-icons/hi";
import toast from "react-hot-toast";

type ExperienceCardProps = {
  id: number;
  title: string;
  city: string;
  categoryName: string | null;
  price: number;
  imageUrl: string | null;
  rating: number;
  reviewCount: number;
};

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

export function ExperienceCard({
  id,
  title,
  city,
  categoryName,
  price,
  imageUrl,
  rating,
  reviewCount,
}: ExperienceCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(id);
  const handleFavoriteClick = async () => {
    try {
      await toggleFavorite(id);

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
  return (
    <article className="card relative flex w-full flex-col overflow-hidden bg-white shadow-sm transition-all duration-500 ease-out will-change-transform md:h-[340px] md:hover:-translate-y-2 md:hover:shadow-[0_16px_34px_rgba(39,68,72,0.16)]">
      <Link href={`/experiences/${id}`} className="flex flex-1 flex-col">
        <figure className="relative aspect-[16/10] w-full shrink-0 overflow-hidden md:aspect-auto md:h-[190px]">
          <Image
            src={imageUrl ?? "/images/placeholder.jpg"}
            alt={title}
            fill
            sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 45vw, 300px"
            className="object-cover"
          />
        </figure>

        <div className="flex flex-1 flex-col px-4 pt-3 pb-6">
          <p className="text-[12px] font-medium text-[#858C91]">
            {city}
            {categoryName && `・${categoryName}`}
          </p>

          <p className="mt-1 line-clamp-2 h-auto text-[16px] leading-6 font-extrabold text-[#2E3338] max-md:leading-tight md:h-[48px]">
            {title}
          </p>

          <p className="mt-1 flex items-center gap-1 text-[12px] font-bold">
            {reviewCount > 0 ? (
              <>
                <HiStar
                  className="size-3 shrink-0 text-[#FFA938]"
                  aria-hidden="true"
                />
                <span className="text-[#F4A629]">{rating}</span>
                <span className="font-medium text-[#8A9196]">
                  ({reviewCount} 則評價)
                </span>
              </>
            ) : (
              <span className="font-medium text-[#8A9196]">尚無評價</span>
            )}
          </p>

          <p className="mt-4 text-[16px] font-extrabold text-[#30353A] md:mt-auto">
            NT$ {price.toLocaleString()} 起
          </p>
        </div>
      </Link>

      <button
        type="button"
        aria-label={favorite ? "取消收藏" : "加入最愛"}
        aria-pressed={favorite}
        className="absolute top-2 right-2 z-10 cursor-pointer p-1 transition-transform duration-300 hover:scale-110 active:scale-95"
        onClick={handleFavoriteClick}
      >
        {favorite ? (
          <HiHeart className="size-6 [stroke:white] [stroke-width:1.5] text-red-500 drop-shadow-[0_2px_5px_rgba(0,0,0,0.2)]" />
        ) : (
          <HiOutlineHeart className="size-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]" />
        )}
      </button>
    </article>
  );
}

export default function Page() {
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/experiences")
      .then((data) => data.json())
      .then((data) => setExperiences(data.data.slice(0, 8)))
      .catch((err) => console.error(err));
  }, [experiences]);
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 text-center">
        <h2 className="inline-block w-[240px] rounded-[16px] bg-[#45cad5] px-6 py-2 text-xl font-bold text-white">
          超夯在地體驗
        </h2>
        <p className="mt-4 text-gray-500">
          探險者們最推薦的深度體驗，這週就出發！
        </p>
      </div>

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
    </section>
  );
}
