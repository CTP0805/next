import React from "react";
import Link from "next/link";
import Image from "next/image";
import RichTextContent from "@/components/RichTextContent";
import BlogCommentSection from "../_components/BlogCommentSection";
import { getAllPosts, getPostBySlug } from "../_lib/blog-store";
import { BLOG_CATEGORY_MAP, BLOG_STATUS_LABEL } from "../_lib/types";

const PLACEHOLDER = "/images/carousel1.jpg";

export default async function BlogDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  const allPosts = await getAllPosts();
  const post = isPreview
    ? (allPosts.find((item) => item.slug === slug) ?? null)
    : await getPostBySlug(slug);

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
        (post.region ? p.region === post.region : true),
    )
    .slice(0, 5);

  const cover = post.cover_image || PLACEHOLDER;
  const contentTopImage = post.content_image;
  const publishedLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // 預覽模式只保留文章主要閱讀範圍，不顯示留言與推薦內容。
  if (isPreview) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">
        <article className="mx-auto max-w-3xl overflow-hidden rounded-[12px] border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 text-sm sm:px-8">
            <span className="font-medium text-amber-700">預覽模式</span>
            <Link
              href={`/blog/${slug}/edit`}
              className="text-teal-700 hover:underline"
            >
              回到編輯
            </Link>
          </div>
          <div className="relative aspect-[16/9] w-full bg-gray-100">
            <Image
              src={cover}
              alt={post.title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
          <div className="px-5 py-8 sm:px-8 sm:py-10">
            <h1 className="mb-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {post.title}
            </h1>
            {contentTopImage ? (
              <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-[12px] bg-gray-100">
                <Image
                  src={contentTopImage}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            ) : null}
            <div className="prose prose-lg prose-headings:font-bold prose-a:text-teal-600 max-w-none text-gray-800">
              <RichTextContent content={post.content} />
            </div>
          </div>
        </article>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* 麵包屑 */}
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
          {post.region ? (
            <>
              <span className="text-gray-300" aria-hidden>
                /
              </span>
              <span>{post.region}</span>
            </>
          ) : null}
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
              {/* 封面 */}
              <div className="relative aspect-[16/9] w-full bg-gray-100">
                <Image
                  src={cover}
                  alt={post.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>

              <div className="px-5 py-8 sm:px-8 sm:py-10 md:px-10">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {post.region ? (
                    <span className="rounded-[12px] bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 sm:text-sm">
                      {post.region}
                    </span>
                  ) : null}
                  <span className="rounded-[12px] bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 sm:text-sm">
                    {BLOG_CATEGORY_MAP[post.category_id] || "其他"}
                  </span>
                  {post.status !== "published" ? (
                    <span className="rounded-[12px] bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {BLOG_STATUS_LABEL[post.status]}
                    </span>
                  ) : null}
                  <Link
                    href={`/blog/${post.slug}/edit`}
                    className="ml-auto text-sm font-medium text-teal-600 hover:underline"
                  >
                    編輯此文
                  </Link>
                </div>

                <h1 className="mb-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-[2.5rem] md:leading-tight">
                  {post.title}
                </h1>

                <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-gray-100 pb-6 text-sm text-gray-500">
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

                {contentTopImage ? (
                  <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-[12px] bg-gray-100">
                    <Image
                      src={contentTopImage}
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                ) : null}

                <div className="prose prose-lg prose-headings:font-bold prose-a:text-teal-600 max-w-none text-gray-800">
                  <RichTextContent content={post.content} />
                </div>
              </div>
            </article>

            <div className="mt-8">
              <BlogCommentSection postSlug={post.slug} />
            </div>
          </div>

          {/* 側欄推薦 */}
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
                        <Image
                          src={rec.cover_image || PLACEHOLDER}
                          alt={rec.title}
                          fill
                          className="object-cover object-center transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      </div>
                      <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
                        {rec.region ? (
                          <span className="font-medium text-teal-600">
                            {rec.region}
                          </span>
                        ) : null}
                        <span className="text-amber-600">
                          {rec.region ? "・" : ""}
                          {BLOG_CATEGORY_MAP[rec.category_id] || "其他"}
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
    </div>
  );
}
