"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { HiChevronLeft, HiChevronRight, HiOutlineXMark } from "react-icons/hi2";

type ExperienceImage = {
  id: number;
  image_url: string;
};

type ImageLightboxProps = {
  images: ExperienceImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export default function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const safeIndex =
    currentIndex >= 0 && currentIndex < images.length ? currentIndex : 0;

  const touchStartX = useRef<number | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    touchStartX.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const distance = event.clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 48) return;

    if (distance > 0) {
      showPrevious();
    } else {
      showNext();
    }
  };

  const showPrevious = useCallback(() => {
    if (images.length === 0) return;

    const previousIndex = safeIndex === 0 ? images.length - 1 : safeIndex - 1;

    onIndexChange(previousIndex);
  }, [safeIndex, images.length, onIndexChange]);

  const showNext = useCallback(() => {
    if (images.length === 0) return;

    const nextIndex = safeIndex === images.length - 1 ? 0 : safeIndex + 1;

    onIndexChange(nextIndex);
  }, [safeIndex, images.length, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, showNext, showPrevious]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[safeIndex];

  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col bg-black md:bg-white"
      role="dialog"
      aria-modal="true"
      aria-label="體驗圖片燈箱"
      onClick={onClose}
    >
      {/* 桌機：上方工具列 */}
      <div className="relative hidden h-16 shrink-0 items-center justify-center px-4 md:flex">
        <p className="text-sm font-medium text-[#656D72]">
          {safeIndex + 1} / {images.length}
        </p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="absolute right-6 grid size-11 place-items-center rounded-full text-[#30363A] transition-colors hover:bg-[#F1F3F4]"
          aria-label="關閉圖片燈箱"
        >
          <HiOutlineXMark className="size-7" />
        </button>
      </div>

      {/* 手機：左上關閉 */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute top-[max(1.5rem,env(safe-area-inset-top))] left-5 z-40 grid size-11 place-items-center rounded-full text-white md:hidden"
        aria-label="關閉圖片燈箱"
      >
        <HiOutlineXMark className="size-7" />
      </button>

      {/* 大圖區域 */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-0 py-0 md:px-24 md:py-4"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {images.length > 1 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            className="absolute top-1/2 left-3 z-30 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#DDE3E5] bg-white text-[#30363A] shadow-sm transition-colors hover:bg-[#F5F7F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68BBC3] md:left-6 md:flex"
            aria-label="上一張圖片"
          >
            <HiChevronLeft className="size-7" />
          </button>
        )}

        <div
          className="relative h-full w-full max-w-6xl"
          onClick={(event) => event.stopPropagation()}
        >
          <Image
            src={currentImage.image_url}
            alt={`體驗圖片 ${safeIndex + 1}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            className="absolute top-1/2 right-3 z-30 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#DDE3E5] bg-white text-[#30363A] shadow-sm transition-colors hover:bg-[#F5F7F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68BBC3] md:right-6 md:flex"
            aria-label="下一張圖片"
          >
            <HiChevronRight className="size-7" />
          </button>
        )}
      </div>
      <p className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 text-sm font-medium text-white md:hidden">
        {safeIndex + 1}/{images.length}
      </p>
      {/* 下方縮圖列 */}
      <div
        className="hidden shrink-0 bg-white px-4 py-4 md:block"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex max-w-4xl justify-center gap-2 overflow-x-auto pb-1 md:gap-3">
          {images.map((image, index) => {
            const isActive = index === safeIndex;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => onIndexChange(index)}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all md:h-20 md:w-28 ${
                  isActive
                    ? "border-[#68BBC3] opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`查看第 ${index + 1} 張圖片`}
                aria-current={isActive ? "true" : undefined}
              >
                <Image
                  src={image.image_url}
                  alt={`體驗縮圖 ${index + 1}`}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
