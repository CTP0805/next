/**
 * =============================================================================
 * 【新手導讀】文章詳情頁 `/blog/[slug]`（Server Component）
 * =============================================================================
 * 沒有 "use client"：在伺服器端就 fetch，HTML 直接帶資料出去
 * params.slug = 網址那一段（例如 /blog/my-trip → "my-trip"）
 * 資料：fetchBlogPostBySlug + 列表做「相關推薦」
 * =============================================================================
 */
import React from "react";
import Link from "next/link";
import { BlogBackToTopButton } from "../_components/BlogBackToTopButton";
import BlogCommentSection from "../_components/BlogCommentSection";
import BlogMediaImage from "../_components/BlogMediaImage";
import BlogOwnerEditLink from "../_components/BlogOwnerEditLink";
import BlogRichTextContent from "../_components/BlogRichTextContent";
import { fetchBlogPostBySlug, fetchBlogPosts } from "../_lib/api";
import {
  BLOG_STATUS_LABEL,
  blogCategoryLabel,
  blogCityLabel,
} from "../_lib/types";
import type { BlogPost } from "../_lib/types";

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next.js 新版 params 是 Promise，要 await
  const { slug } = await params;

  let allPosts: BlogPost[] = [];
  let post: BlogPost | null = null;

  try {
    // 推薦區需要列表；詳情用 slug 精準取一篇
    allPosts = await fetchBlogPosts();
    try {
      post = await fetchBlogPostBySlug(slug);
    } catch {
      post = null;
    }
  } catch {
    allPosts = [];
    post = null;
  }

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <p className="mb-2 text-sm font-medium tracking-wide text-teal-600 uppercase">
          404
        </p>
        <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
          文章不存在
        </h1>
        <p className="mb-8 max-w-md text-gray-500">
          找不到這篇文章，可能已下架或網址有誤
        </p>
        <Link
          href="/blog"
          className="rounded-[12px] bg-[#45cad5] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#36b3be]"
        >
          返回文章列表
        </Link>
      </div>
    );
  }

  const recommendations = allPosts
    .filter(
      (p) =>
        p.status === "published" &&
        p.slug !== post.slug &&
        (post.category_id != null
          ? p.category_id === post.category_id
          : true),
    )
    .slice(0, 5);

  /** 詳情頁只顯示文章上方圖（content_image，與 cover 同值） */
  const topImage = post.content_image || post.cover_image;
  const publishedLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const categoryLabel = blogCategoryLabel(post);
  const cityLabel = blogCityLabel(post);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <nav
          aria-label="麵包屑"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500"
        >
          <Link
            href="/blog"
            className="font-medium text-teal-600 hover:underline"
          >
            部落格
          </Link>
          <span className="text-gray-300" aria-hidden>
            /
          </span>
          <span className="line-clamp-1 max-w-[12rem] text-gray-700 sm:max-w-xs">
            {post.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <article className="overflow-hidden rounded-[12px] border border-gray-100 bg-white shadow-sm">
              <div className="px-5 py-8 sm:px-8 sm:py-10 md:px-10">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="rounded-[12px] bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 sm:text-sm">
                    {cityLabel}
                  </span>
                  <span className="rounded-[12px] bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 sm:text-sm">
                    {categoryLabel}
                  </span>
                  {post.status !== "published" ? (
                    <span className="rounded-[12px] bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {BLOG_STATUS_LABEL[post.status]}
                    </span>
                  ) : null}
                  <BlogOwnerEditLink
                    authorId={post.author_id}
                    href={`/member/edit-post?tab=create&draft=${post.id}`}
                    className="ml-auto text-sm font-medium text-teal-600 hover:underline"
                  >
                    編輯此文
                  </BlogOwnerEditLink>
                </div>

                <h1 className="mb-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-[2.5rem] md:leading-tight">
                  {post.title}
                </h1>

                <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-gray-100 pb-6 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">
                    作者：{post.author_name?.trim() || `會員 #${post.author_id}`}
                  </span>
                  <span
                    className="hidden h-1 w-1 rounded-[12px] bg-gray-300 sm:inline-block"
                    aria-hidden
                  />
                  {publishedLabel ? (
                    <time dateTime={post.published_at ?? undefined}>
                      {publishedLabel}
                    </time>
                  ) : (
                    <span>尚未上架</span>
                  )}
                  <span
                    className="hidden h-1 w-1 rounded-[12px] bg-gray-300 sm:inline-block"
                    aria-hidden
                  />
                  <span>
                    更新於{" "}
                    {new Date(post.updated_at).toLocaleDateString("zh-TW")}
                  </span>
                </div>

                {topImage ? (
                  <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-[12px] bg-gray-100">
                    <BlogMediaImage
                      src={topImage}
                      alt={post.title}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      priority
                    />
                  </div>
                ) : null}

                <div className="prose prose-lg prose-headings:font-bold prose-a:text-teal-600 max-w-none text-gray-800">
                  <BlogRichTextContent content={post.content} />
                </div>
              </div>
            </article>

            <div className="mt-8">
              <BlogCommentSection postSlug={post.slug} />
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-[12px] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-gray-900">
                <span
                  className="h-6 w-1.5 rounded-[12px] bg-[#45cad5]"
                  aria-hidden
                />
                推薦閱讀
              </h2>

              <div className="space-y-6">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <Link
                      href={`/blog/${rec.slug}`}
                      key={rec.id}
                      className="group block"
                    >
                      <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-[12px] bg-gray-100">
                        <BlogMediaImage
                          src={rec.content_image || rec.cover_image}
                          alt={rec.title}
                          fill
                          className="object-cover object-center transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      </div>
                      <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-teal-600">
                          {blogCityLabel(rec)}
                        </span>
                        <span className="text-gray-300" aria-hidden>
                          ·
                        </span>
                        <span className="text-amber-600">
                          {blogCategoryLabel(rec)}
                        </span>
                      </div>
                      <h3 className="line-clamp-2 text-base leading-snug font-semibold text-gray-900 transition-colors group-hover:text-teal-600">
                        {rec.title}
                      </h3>
                      {rec.excerpt ? (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {rec.excerpt}
                        </p>
                      ) : null}
                    </Link>
                  ))
                ) : (
                  <p className="rounded-[12px] bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    目前沒有更多推薦文章
                  </p>
                )}
              </div>

              <Link
                href="/blog"
                className="mt-8 block rounded-[12px] border border-teal-200 py-2.5 text-center text-sm font-medium text-teal-700 transition hover:bg-teal-50"
              >
                瀏覽全部文章
              </Link>
            </div>
          </aside>
        </div>
      </div>
      <BlogBackToTopButton />
    </div>
  );
}
