"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules"; // 不需要再載入 Navigation
import type { Swiper as SwiperType } from "swiper";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import IconMenu from "@/components/IconMenu";

import "swiper/css";
import "swiper/css/autoplay";

export default function HeroSwiper() {
  const swiperRef = useRef<SwiperType | null>(null);

  const slides = [
    {
      id: 1,
      title: "Play Like a Local",
      image: "/images/banner/carousel1.avif",
    },
    {
      id: 2,
      title: "More Than Travel",
      image: "/images/banner/carousel2.avif",
    },
    {
      id: 3,
      title: "Explore the Real City",
      image: "/images/banner/carousel3.jpg",
    },
    {
      id: 4,
      title: "Connect with Locals",
      image: "/images/banner/carousel4.webp",
    },
    {
      id: 5,
      title: "See the City Through Local Eyes",
      image: "/images/banner/carousel5.jpeg",
    },
  ];

  return (
    <>
      <div className="relative w-full">
        <Swiper
          modules={[Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="h-[362px] w-full md:h-[800px]"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative">
              <Image
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover"
                fill
                priority
              />

              <div
                className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"
                aria-hidden="true"
              />

              <div className="relative z-10 flex h-full flex-col items-center justify-center text-5xl font-bold text-white md:text-[64px]">
                {slide.title}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 自訂左右箭頭 */}
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute top-1/2 left-4 z-30 -translate-y-1/2 transition md:left-8"
          aria-label="Previous slide"
        >
          <IoMdArrowDropleft className="h-10 w-10 text-white/30 hover:text-zinc-50 md:h-14 md:w-14" />
        </button>

        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="absolute top-1/2 right-4 z-30 -translate-y-1/2 transition md:right-8"
          aria-label="Next slide"
        >
          <IoMdArrowDropright className="h-10 w-10 text-white/30 hover:text-zinc-50 md:h-14 md:w-14" />
        </button>
      </div>

      <div className="relative z-20 md:-mt-18">
        <IconMenu />
      </div>
    </>
  );
}
