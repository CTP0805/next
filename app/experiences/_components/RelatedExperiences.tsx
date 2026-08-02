"use client";

import { useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import ExperienceCard from "@/app/experiences/_components/ExperienceCard";

export type RelatedExperience = {
  id: number;
  title: string;
  city: string;
  category_name: string | null;
  price: number;
  image_url: string | null;
  rating: number;
  review_count: number;
};

type RelatedExperiencesProps = {
  experiences: RelatedExperience[];
};

export default function RelatedExperiences({
  experiences,
}: RelatedExperiencesProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [canSlidePrev, setCanSlidePrev] = useState(false);
  const [canSlideNext, setCanSlideNext] = useState(false);

  const updateNavigation = (instance: SwiperType) => {
    setCanSlidePrev(!instance.isBeginning);
    setCanSlideNext(!instance.isEnd);
  };
  if (experiences.length === 0) return null;

  return (
    <section className="pt-14 max-sm:px-5">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="mt-1 text-2xl font-extrabold text-[#292E33]">
            你可能也會喜歡
          </h2>
        </div>
      </div>

      <div className="relative">
        <Swiper
          className="-my-3"
          onSwiper={(instance) => {
            setSwiper(instance);

            requestAnimationFrame(() => {
              updateNavigation(instance);
            });
          }}
          onSlideChange={updateNavigation}
          onResize={updateNavigation}
          spaceBetween={20}
          breakpoints={{
            0: {
              slidesPerView: 1.15,
              slidesPerGroup: 1,
            },
            640: {
              slidesPerView: 2,
              slidesPerGroup: 2,
            },
            1024: {
              slidesPerView: 4,
              slidesPerGroup: 4,
            },
          }}
        >
          {experiences.map((item) => (
            <SwiperSlide key={item.id} className="h-auto py-3">
              <ExperienceCard
                id={item.id}
                title={item.title}
                city={item.city}
                categoryName={item.category_name}
                price={item.price}
                imageUrl={item.image_url}
                rating={item.rating}
                reviewCount={item.review_count}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {canSlidePrev && (
          <button
            type="button"
            onClick={() => swiper?.slidePrev()}
            aria-label="查看前一組相關體驗"
            className="absolute top-1/2 -left-14 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-[#DDE3E5] bg-white text-[#30353A] shadow-sm transition hover:border-[#68BBC3] hover:text-[#419AA2] max-sm:hidden"
          >
            <HiChevronLeft className="size-6" />
          </button>
        )}
        {canSlideNext && (
          <button
            type="button"
            onClick={() => swiper?.slideNext()}
            aria-label="查看下一組相關體驗"
            className="absolute top-1/2 -right-14 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-[#DDE3E5] bg-white text-[#30353A] shadow-sm transition hover:border-[#68BBC3] hover:text-[#419AA2] max-sm:hidden"
          >
            <HiChevronRight className="size-6" />
          </button>
        )}
      </div>
    </section>
  );
}
