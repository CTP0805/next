"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules"; // 不需要再載入 Navigation
import type { Swiper as SwiperType } from "swiper";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import IconMenu from "@/components/IconMenu";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
import "swiper/css";
import "swiper/css/autoplay";

export default function HeroSwiper() {
  const swiperRef = useRef<SwiperType | null>(null);

  const slides = [
    {
      id: 1,
      title: "Play Like a Local",
      image: "/images/banner/carousel1.jpg",
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

              <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
                <span
                  className={`${cormorant.className} bg-[linear-gradient(to_top,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.65)_25%,rgba(255,255,255,1)_100%)] bg-clip-text text-6xl leading-[0.9] font-[300] tracking-[-0.03em] text-transparent italic md:text-[100px]`}
                >
                  {slide.title}
                </span>
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
