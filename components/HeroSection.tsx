"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
// 1. 匯入 Navigation 和 Autoplay
import { Navigation, Autoplay } from "swiper/modules";
import IconMenu from "@/components/IconMenu";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay"; // 2. 記得匯入 autoplay 的樣式
export default function HeroSwiper() {
  // 可以將資料抽出來做成陣列，方便後續擴充
  const slides = [
    { id: 1, title: "PARIS", image: "/images/banner/carousel1.avif" },
    { id: 2, title: "LONDON", image: "/images/carousel2.jpeg" },
    { id: 3, title: "TOKYO", image: "/images/carousel3.jpeg" },
  ];

  return (
    <>
      <div className="w-full">
        <Swiper
          navigation={true}
          modules={[Navigation, Autoplay]}
          // 4. 設定 autoplay 參數
          autoplay={{
            delay: 3000,
            disableOnInteraction: false, // 使用者手動滑動後是否停止自動播放，建議設為 false
          }}
          loop={true}
          className="h-[362px] w-full md:h-[800px]"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative">
              {/* 背景層 */}
              <Image
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover"
                fill
                priority // 首屏圖片建議加上 priority
              />

              {/* 遮罩層 */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"
                aria-hidden="true"
              />

              {/* 內容層 */}
              <div className="relative z-10 flex h-full flex-col items-center justify-center text-5xl font-bold text-white md:text-9xl">
                {slide.title}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="relative z-20 md:-mt-18">
        <IconMenu />
      </div>
    </>
  );
}
