"use client";

import { useEffect, useState } from "react";
import { HiStar } from "react-icons/hi";
import ImageLightbox from "@/app/experiences/_components/ImageLightbox";
import Image from "next/image";

type ExperienceReview = {
  id: number;
  member_id: number;
  rating: number;
  comment: string;
  created_at: string;
  images: {
    id: number;
    image_url: string;
    sort_order: number;
  }[];
  member_name: string | null;
  member_avatar: string | null;
  member_city: string | null;
  departure_date: string | null;
};

type ReviewsSectionProps = {
  rating: number;
  reviewCount: number;
  reviews: ExperienceReview[];
};

export default function ReviewsSection({
  rating,
  reviewCount,
  reviews,
}: ReviewsSectionProps) {
  const [isAllReviewsOpen, setIsAllReviewsOpen] = useState(false);
  const [reviewGallery, setReviewGallery] = useState<{
    images: { id: number; image_url: string }[];
    currentIndex: number;
  } | null>(null);

  const openAllReviewsOnMobile = (reviewId?: number) => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setTargetReviewId(reviewId ?? null);
      setIsAllReviewsOpen(true);
    }
  };

  const [targetReviewId, setTargetReviewId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAllReviewsOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isAllReviewsOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const closeModalOnDesktop = () => {
      if (mediaQuery.matches) {
        setIsAllReviewsOpen(false);
      }
    };

    closeModalOnDesktop();
    mediaQuery.addEventListener("change", closeModalOnDesktop);

    return () => {
      mediaQuery.removeEventListener("change", closeModalOnDesktop);
    };
  }, []);

  useEffect(() => {
    if (!isAllReviewsOpen || !targetReviewId) return;

    requestAnimationFrame(() => {
      document.getElementById(`all-review-${targetReviewId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [isAllReviewsOpen, targetReviewId]);

  const handlePreviewImageClick = (review: ExperienceReview, index: number) => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setReviewGallery({
        images: review.images.map((image) => ({
          id: image.id,
          image_url: `http://localhost:3001${image.image_url}`,
        })),
        currentIndex: index,
      });
      return;
    }

    setIsAllReviewsOpen(true);
  };
  return (
    <section id="reviews" className="scroll-mt-20 pt-14">
      <h4>旅人好評</h4>

      <div className="mt-4 mb-10 flex flex-wrap items-center gap-2">
        {/* 💡 核心修正：加上 -mr-1.5，把右邊的數字往左拉近 */}
        <HiStar className="-mr-1.5 size-5 shrink-0 text-[#FFA938]" />

        <strong className="text-[20px] font-black tracking-tight text-[#FFA938]">
          {rating}
        </strong>

        <span className="mx-1 h-3 w-px bg-gray-300" />

        <span className="text-[14px] font-semibold text-[#5E656B]">
          {reviewCount} 則已驗證評價
        </span>
      </div>

      <div className="mt-7 mb-10 flex scrollbar-none flex-col gap-6 max-sm:-mx-4 max-sm:snap-x max-sm:snap-mandatory max-sm:flex-row max-sm:gap-4 max-sm:divide-y-0 max-sm:overflow-x-auto max-sm:px-4 sm:divide-y sm:divide-[#ECEFF0]">
        {reviews.map((review) => (
          <article
            key={review.id}
            onClick={() => openAllReviewsOnMobile(review.id)}
            className="w-full text-left max-sm:w-[80vw] max-sm:shrink-0 max-sm:snap-center max-sm:rounded-xl max-sm:border max-sm:border-[#ECEFF0] max-sm:bg-white max-sm:p-5 max-sm:shadow-sm sm:py-7 sm:first:pt-0 sm:last:pb-0"
          >
            {/* 1. 頂部資訊列 (左右分開) */}
            <div className="flex items-start justify-between gap-4">
              {/* 頂部左側：頭像 + 名字/標籤 */}
              <div className="flex items-center gap-3">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#EAF7F7] shadow-[0_2px_8px_rgba(34,57,61,0.12)]">
                  <Image
                    src={
                      review.member_avatar
                        ? `http://localhost:3001${review.member_avatar}`
                        : "/images/member-avatar/angry-man.jpg"
                    }
                    alt={`${review.member_name ?? "會員"}的頭像`}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <strong className="text-[14px] font-bold text-[#292E33]">
                    {review.member_name ?? `旅人 #${review.member_id}`}
                  </strong>
                  {/* 手機版模擬截圖中的標籤，電腦版可隱藏或留著 */}
                  <span className="mt-0.5 text-[12px] text-[#8A9196] max-sm:inline-block">
                    {review.member_city ?? "台灣"}
                  </span>
                </div>
              </div>

              {/* 頂部右側：雙日期資訊 */}
              <div className="flex flex-col text-right text-[12px] leading-4 text-[#8A9196]">
                <div>
                  <span className="mr-1 text-[#ABAFB2]">出發日</span>
                  <span>
                    {review.departure_date
                      ? new Date(review.departure_date).toLocaleDateString(
                          "zh-TW",
                        )
                      : "未提供"}
                  </span>
                </div>
                <div>
                  <span className="mr-1 text-[#ABAFB2]">評論於</span>
                  <span>
                    {new Date(review.created_at).toLocaleDateString("zh-TW")}
                  </span>
                </div>
              </div>
            </div>
            {/* 2. 中間內容區塊 (全部獨立成行，完美靠左) */}

            {/* 藍色星星獨立一行 */}
            <div className="mt-3 flex items-center gap-0.5 text-[#68BBC3]">
              {[...Array(review.rating)].map((_, i) => (
                <HiStar key={i} className="size-4 shrink-0" />
              ))}
            </div>

            <p className="mt-2 text-[14px] leading-6 font-normal text-[#5F676C]">
              {review.comment}
            </p>
            {review.images.length > 0 &&
              (() => {
                const remainingImageCount = review.images.length - 3;

                return (
                  <>
                    {/* 手機：最多三張；第三張顯示剩餘數量 */}
                    <div className="mt-4 grid grid-cols-3 gap-2 md:hidden">
                      {review.images.slice(0, 3).map((image, index) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => openAllReviewsOnMobile(review.id)}
                          className="relative aspect-[4/3] w-full overflow-hidden rounded-lg"
                          aria-label={
                            index === 2 && remainingImageCount > 0
                              ? `查看其餘 ${remainingImageCount} 張評論照片`
                              : `查看第 ${index + 1} 張評論照片`
                          }
                        >
                          <Image
                            src={`http://localhost:3001${image.image_url}`}
                            alt={`${review.member_name ?? "旅人"}的評論照片 ${index + 1}`}
                            width={160}
                            height={120}
                            className="h-full w-full object-cover"
                          />

                          {index === 2 && remainingImageCount > 0 && (
                            <span className="absolute inset-0 grid place-items-center bg-black/50 text-lg font-bold text-white">
                              +{remainingImageCount}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* 桌機：完整顯示 */}
                    <div className="mt-4 hidden grid-cols-6 gap-2 md:grid">
                      {review.images.map((image, index) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handlePreviewImageClick(review, index);
                          }}
                          className="aspect-[4/3] w-full overflow-hidden rounded-lg"
                          aria-label={`查看第 ${index + 1} 張評論照片`}
                        >
                          <Image
                            src={`http://localhost:3001${image.image_url}`}
                            alt={`${review.member_name ?? "旅人"}的評論照片 ${index + 1}`}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                          />
                        </button>
                      ))}
                    </div>
                  </>
                );
              })()}
          </article>
        ))}
      </div>
      <button
        type="button"
        onClick={() => openAllReviewsOnMobile()}
        className="mb-10 w-full rounded-xl border border-[#30363A] bg-white py-3 text-sm font-bold text-[#30363A] active:bg-[#F0F2F3] md:hidden"
      >
        查看全部 {reviewCount} 則評價
      </button>
      {isAllReviewsOpen && (
        <div className="fixed inset-0 z-[300] bg-white md:hidden">
          <header className="relative flex h-16 items-center justify-center border-b border-[#E8ECEE] px-5">
            <button
              type="button"
              onClick={() => setIsAllReviewsOpen(false)}
              className="absolute left-5 grid size-10 place-items-center rounded-full text-[25px] leading-none text-[#30363A] active:bg-[#F0F2F3]"
              aria-label="關閉評價"
            >
              ×
            </button>

            <h2 className="text-[16px] font-extrabold text-[#292E33]">評價</h2>
          </header>

          <main className="h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain px-5 py-6 pb-10">
            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-6 flex items-center gap-4 rounded-2xl bg-[#EAF7F7] px-5 py-4">
                <div className="flex items-center gap-1.5 text-[#FFA938]">
                  <HiStar className="size-6" />
                  <strong className="text-2xl font-black">{rating}</strong>
                </div>

                <span className="h-9 w-px bg-[#BFE3E6]" />

                <div>
                  <p className="text-sm font-extrabold text-[#30363A]">
                    旅人真實評價
                  </p>
                  <p className="mt-0.5 text-xs text-[#687076]">
                    {reviewCount} 則已驗證評價
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {reviews.map((review) => {
                  const remainingImageCount = review.images.length - 6;

                  return (
                    <article
                      key={review.id}
                      id={`all-review-${review.id}`}
                      className="rounded-2xl bg-[#FAFBFB] p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src={
                              review.member_avatar
                                ? `http://localhost:3001${review.member_avatar}`
                                : "/images/member-avatar/angry-man.jpg"
                            }
                            alt={`${review.member_name ?? "會員"}的頭像`}
                            width={44}
                            height={44}
                            className="size-11 rounded-full object-cover"
                          />

                          <div className="min-w-0">
                            <div className="flex items-baseline gap-2">
                              <strong className="text-sm font-bold text-[#292E33]">
                                {review.member_name ??
                                  `旅人 #${review.member_id}`}
                              </strong>
                            </div>

                            <p className="mt-0.5 text-xs text-[#8A9196]">
                              {new Date(review.created_at).toLocaleDateString(
                                "zh-TW",
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-0.5 text-[#68BBC3]">
                          {Array.from({ length: review.rating }).map(
                            (_, index) => (
                              <HiStar key={index} className="size-4" />
                            ),
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#5F676C]">
                        {review.comment}
                      </p>

                      {review.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {review.images.slice(0, 6).map((image, index) => (
                            <button
                              key={image.id}
                              type="button"
                              onClick={() =>
                                setReviewGallery({
                                  images: review.images.map((item) => ({
                                    id: item.id,
                                    image_url: `http://localhost:3001${item.image_url}`,
                                  })),
                                  currentIndex: index,
                                })
                              }
                              className="relative aspect-[4/3] overflow-hidden rounded-lg"
                              aria-label={`查看第 ${index + 1} 張評論照片`}
                            >
                              <Image
                                src={`http://localhost:3001${image.image_url}`}
                                alt={`${review.member_name ?? "旅人"}的評論照片 ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 30vw, 180px"
                                className="object-cover"
                              />

                              {index === 5 && remainingImageCount > 0 && (
                                <span className="absolute inset-0 grid place-items-center bg-black/50 text-lg font-bold text-white">
                                  +{remainingImageCount}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      )}
      {reviewGallery && (
        <ImageLightbox
          images={reviewGallery.images}
          currentIndex={reviewGallery.currentIndex}
          isOpen
          onClose={() => setReviewGallery(null)}
          onIndexChange={(index) =>
            setReviewGallery((current) =>
              current ? { ...current, currentIndex: index } : null,
            )
          }
        />
      )}
    </section>
  );
}
