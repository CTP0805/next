import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "../_lib/types";
import { BLOG_CATEGORY_MAP, BLOG_STATUS_LABEL } from "../_lib/types";

interface BlogPostCardProps {
  post: BlogPost;
  footer?: ReactNode;
}

const PLACEHOLDER = "/images/carousel1.jpg";

/**
 * 等高校牌：固定圖片比例 + 標題/摘要固定行數 + 底部標籤貼底
 */
export default function BlogPostCard({ post, footer }: BlogPostCardProps) {
  const category = BLOG_CATEGORY_MAP[post.category_id] || "其他";
  const cover = post.cover_image || PLACEHOLDER;
  const dateLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString("zh-TW")
    : BLOG_STATUS_LABEL[post.status];

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[12px] border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <Link
        href={`/blog/${post.slug}`}
        className="group flex min-h-0 flex-1 flex-col"
      >
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gray-100">
          <Image
            src={cover}
            alt={post.title}
            fill
            className="object-cover object-center transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          {post.region ? (
            <span className="absolute bottom-3 left-3 rounded-[12px] bg-white/95 px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm backdrop-blur">
              {post.region}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="mb-2 line-clamp-2 min-h-[3.25rem] text-lg font-semibold leading-snug text-gray-900 transition-colors group-hover:text-teal-600 sm:min-h-[3.5rem] sm:text-xl">
            {post.title}
          </h3>

          <p className="mb-4 line-clamp-3 min-h-[4rem] text-sm leading-relaxed text-gray-600 sm:text-[15px]">
            {post.excerpt || "點擊閱讀全文…"}
          </p>

          <div className="mt-auto">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-[12px] bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                {category}
              </span>
              {post.status !== "published" ? (
                <span className="inline-flex items-center rounded-[12px] bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                  {BLOG_STATUS_LABEL[post.status]}
                </span>
              ) : null}
            </div>
            <div className="mt-3 text-xs text-gray-400">{dateLabel}</div>
          </div>
        </div>
      </Link>

      {footer ? (
        <div className="border-t border-gray-100 px-5 py-2.5 sm:px-6">
          {footer}
        </div>
      ) : null}
    </article>
  );
}
