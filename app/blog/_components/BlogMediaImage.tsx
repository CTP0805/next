"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  BLOG_IMAGE_PLACEHOLDER,
  resolveBlogMediaUrl,
  shouldUseNextImage,
} from "../_lib/media";

type BlogMediaImageProps = {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

/**
 * 部落格圖片顯示
 * - 無效 seed 路徑（/blog/...）→ 預設圖
 * - 載入失敗 → 預設圖（避免 next/image "received null"）
 * - 僅 /images/... 使用 next/image；其餘用原生 img
 */
export default function BlogMediaImage({
  src,
  alt,
  fill = true,
  className = "object-cover object-center",
  sizes,
  priority,
  width,
  height,
}: BlogMediaImageProps) {
  const resolved = resolveBlogMediaUrl(src);
  const [currentSrc, setCurrentSrc] = useState(resolved);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(resolveBlogMediaUrl(src));
    setFailed(false);
  }, [src]);

  const displaySrc = failed ? BLOG_IMAGE_PLACEHOLDER : currentSrc;
  const useNext =
    !failed && shouldUseNextImage(displaySrc) && displaySrc.startsWith("/");

  function handleError() {
    if (displaySrc !== BLOG_IMAGE_PLACEHOLDER) {
      setFailed(true);
      setCurrentSrc(BLOG_IMAGE_PLACEHOLDER);
    }
  }

  if (!useNext) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displaySrc}
          alt={alt}
          className={`absolute inset-0 h-full w-full ${className}`}
          onError={handleError}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displaySrc}
        alt={alt}
        width={width ?? 800}
        height={height ?? 600}
        className={className}
        onError={handleError}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={displaySrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={displaySrc}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
    />
  );
}
