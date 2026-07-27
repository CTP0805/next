"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { HiStar } from "react-icons/hi";

interface ReviewCardProps {
  rating: number;
  comment: string;
  memberName?: string;
  avatarUrl?: string;
}

export function ReviewCard({
  rating,
  comment,
  memberName = "旅客",
  avatarUrl = "/images/carousel1.jpeg",
}: ReviewCardProps) {
  return (
    <div className="rounded-3xl bg-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative aspect-square h-12 w-12 rounded-full bg-gray-300">
          <Image
            src={avatarUrl}
            alt=""
            className="rounded-full object-cover"
            fill
          />
        </div>
        <div>
          <p className="font-medium">{memberName}</p>
          <div className="flex flex-wrap">
            {Array.from({ length: rating }).map((_, index) => (
              <HiStar
                key={index}
                className="size-3 shrink-0 text-[#FFA938]"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-gray-600">「{comment}」</p>
    </div>
  );
}

interface ImageCardProps {
  imageUrl: string;
}

export function ImageCard({ imageUrl }: ImageCardProps) {
  return (
    <div className="relative h-96 overflow-hidden rounded-3xl">
      <Image src={imageUrl} alt="" fill className="rounded-3xl object-cover" />
    </div>
  );
}

// 依照你原本排版設計的欄位結構 (對應 API 資料的 index)
const columns = [
  [
    { type: "review", dataIndex: 0 },
    { type: "image", dataIndex: 1 },
  ],
  [
    { type: "image", dataIndex: 0 },
    { type: "review", dataIndex: 1 },
  ],
  [
    { type: "review", dataIndex: 2 },
    { type: "image", dataIndex: 3 },
  ],
  [
    { type: "image", dataIndex: 2 },
    { type: "review", dataIndex: 3 },
  ],
];

export default function Home() {
  const [reviewsData, setReviewsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 1. 宣告載入狀態

  useEffect(() => {
    fetch("http://localhost:3001/api/location")
      .then((res) => res.json())
      .then((data) => {
        setReviewsData(data.data || data);
        setIsLoading(false); // 2. 資料回來後關閉載入狀態
      })
      .catch((err) => {
        console.error("Failed to fetch reviews:", err);
        setIsLoading(false);
      });
  }, []);

  // 3. 載入中先回傳畫面，避免直接去跑 map
  if (isLoading) {
    return <div className="py-20 text-center text-gray-500">載入中...</div>;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 text-center">
        <h2 className="inline-block w-[240px] rounded-[16px] bg-[#45cad5] px-6 py-2 text-xl font-bold text-white">
          旅人好評
        </h2>
        <p className="mt-4 text-gray-500">
          已有超過 10,000 位探險家在 Meet Locals 寫下故事
        </p>
      </div>
      <div className="grid grid-cols-2 gap-8 xl:grid-cols-4">
        {columns.map((column, colIndex) => (
          <div
            key={colIndex}
            className={`space-y-8 ${colIndex % 2 === 0 ? "md:pt-24" : ""}`}
          >
            {column.map((item, itemIndex) => {
              const reviewItem = reviewsData[item.dataIndex];

              // 4. 防呆：如果 API 回傳的資料筆數不夠對應這個 index，直接跳過不渲染
              if (!reviewItem) return null;

              return item.type === "review" ? (
                <ReviewCard
                  key={itemIndex}
                  rating={reviewItem.rating}
                  comment={reviewItem.comment}
                />
              ) : (
                <ImageCard
                  key={itemIndex}
                  imageUrl={reviewItem.image_url || "/images/carousel1.jpeg"}
                />
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
