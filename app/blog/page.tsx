"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BlogPostCard from "./_components/BlogPostCard";
import type { BlogPost } from "./_lib/types";
import { BLOG_CATEGORY_MAP, BLOG_REGIONS } from "./_lib/types";

const PLACEHOLDER = "/images/carousel1.jpg";

function isPublished(post: BlogPost) {
  return post.status === "published";
}

function formatDate(iso: string | null) {
  if (!iso) return "未上架";
  return new Date(iso).toLocaleDateString("zh-TW");
}

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[12px] bg-white shadow-md">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="space-y-3 p-6">
        <div className="h-6 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-5/6 rounded bg-gray-100" />
        <div className="mt-4 flex gap-2">
          <div className="h-6 w-14 rounded-[12px] bg-gray-100" />
          <div className="h-6 w-16 rounded-[12px] bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function BlogListPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/blog", { cache: "no-store" });
        const data = (await res.json()) as { posts?: BlogPost[] };
        if (!cancelled) setAllPosts(data.posts ?? []);
      } catch {
        if (!cancelled) setAllPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** 前台列表以已上架為主；草稿等僅在篩選時一併顯示（方便編輯） */
  const publishedPosts = useMemo(
    () => allPosts.filter(isPublished),
    [allPosts],
  );

  const filteredPosts = useMemo(() => {
    const base = selectedCountry
      ? allPosts.filter((post) => post.region === selectedCountry)
      : publishedPosts;
    return base;
  }, [allPosts, publishedPosts, selectedCountry]);

  /** 精選：六個地區各取一篇最新已上架文章 */
  const featuredPosts = useMemo(() => {
    if (selectedCountry) return filteredPosts;

    return BLOG_REGIONS.map((region) => {
      const regionPosts = publishedPosts.filter(
        (post) => post.region === region,
      );
      if (regionPosts.length === 0) return null;

      return [...regionPosts].sort(
        (a, b) =>
          new Date(b.published_at ?? b.updated_at).getTime() -
          new Date(a.published_at ?? a.updated_at).getTime(),
      )[0];
    }).filter((post): post is BlogPost => post !== null);
  }, [filteredPosts, publishedPosts, selectedCountry]);

  const latestPosts = useMemo(() => {
    if (selectedCountry) return [];
    return [...publishedPosts]
      .sort(
        (a, b) =>
          new Date(b.published_at ?? b.updated_at).getTime() -
          new Date(a.published_at ?? a.updated_at).getTime(),
      )
      .slice(0, 8);
  }, [publishedPosts, selectedCountry]);

  /** 熱門：取較早上架的精選（與最新錯開） */
  const popularPosts = useMemo(() => {
    if (selectedCountry) return [];
    return [...publishedPosts]
      .sort(
        (a, b) =>
          new Date(a.published_at ?? a.updated_at).getTime() -
          new Date(b.published_at ?? b.updated_at).getTime(),
      )
      .slice(0, 5);
  }, [publishedPosts, selectedCountry]);

  const sectionTitle = selectedCountry
    ? `${selectedCountry} 旅遊文章`
    : "精選旅遊情報";

  const resultCount = selectedCountry
    ? filteredPosts.length
    : featuredPosts.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <header className="relative h-[360px] overflow-hidden sm:h-[400px] md:h-[440px]">
        <Image
          src="/images/carousel1.jpg"
          alt="全球旅遊攻略"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/50 to-black/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-white sm:px-6">
          <p className="mb-3 text-xs font-medium tracking-[0.2em] text-white/80 uppercase sm:text-sm">
            Travel Journal
          </p>
          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            全球旅遊攻略
          </h1>
          <p className="mb-8 max-w-lg text-base text-white/90 sm:text-lg md:text-xl">
            選擇目的地，探索專屬旅行靈感
          </p>

          <div className="flex max-w-4xl flex-wrap justify-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSelectedCountry(null)}
              className={`rounded-[12px] px-4 py-2 text-sm font-medium shadow-md transition-all duration-300 sm:px-5 sm:py-2.5 sm:text-base ${
                selectedCountry === null
                  ? "scale-105 bg-white text-teal-700 shadow-lg"
                  : "border border-white/35 bg-white/15 text-white backdrop-blur hover:bg-white/25"
              }`}
            >
              全部
            </button>
            {BLOG_REGIONS.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() =>
                  setSelectedCountry(
                    country === selectedCountry ? null : country,
                  )
                }
                className={`rounded-[12px] px-4 py-2 text-sm font-medium shadow-md transition-all duration-300 sm:px-5 sm:py-2.5 sm:text-base ${
                  selectedCountry === country
                    ? "scale-105 bg-white text-teal-700 shadow-lg"
                    : "border border-white/35 bg-white/15 text-white backdrop-blur hover:bg-white/25"
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        {/* 區段標題列 */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {sectionTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? "載入中…" : `共 ${resultCount} 篇文章`}
              {selectedCountry ? (
                <button
                  type="button"
                  onClick={() => setSelectedCountry(null)}
                  className="ml-3 font-medium text-teal-600 hover:underline"
                >
                  清除篩選
                </button>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/blog/manage"
              className="inline-flex items-center gap-1.5 rounded-[12px] border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              文章管理
            </Link>
            <Link
              href="/blog/review"
              className="inline-flex items-center gap-1.5 rounded-[12px] border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100"
            >
              文章審查
            </Link>
            <Link
              href="/blog/new"
              className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#45cad5] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#36b3be] hover:shadow-lg"
            >
              <span aria-hidden>+</span> 新增文章
            </Link>
          </div>
        </div>

        {/* 精選／篩選結果 */}
        {loading ? (
          <section className="mb-16">
            <div className="grid grid-cols-1 items-stretch gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-16 sm:mb-20">
            <div className="grid grid-cols-1 items-stretch gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <div key={post.id} className="h-full min-h-0">
                  <BlogPostCard
                    post={post}
                    footer={
                      <Link
                        href={`/blog/${post.slug}/edit`}
                        className="text-xs font-medium text-teal-600 hover:underline"
                      >
                        編輯文章
                      </Link>
                    }
                  />
                </div>
              ))}
            </div>
            {featuredPosts.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
                <p className="text-lg font-medium text-gray-600">
                  目前沒有符合條件的文章
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  試試其他目的地，或寫一篇新文章
                </p>
                <Link
                  href="/blog/new"
                  className="mt-6 inline-flex rounded-[12px] bg-[#45cad5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#36b3be]"
                >
                  寫一篇新文章
                </Link>
              </div>
            ) : null}
          </section>
        )}

        {/* 最新 + 熱門（未篩選時） */}
        {!selectedCountry && !loading && publishedPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-10">
            <section className="lg:col-span-2">
              <div className="mb-6 flex items-center gap-3 sm:mb-8">
                <span
                  className="h-7 w-1.5 rounded-[12px] bg-[#45cad5]"
                  aria-hidden
                />
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  最新旅遊攻略
                </h2>
              </div>
              <div className="space-y-6 sm:space-y-8">
                {latestPosts.map((post) => (
                  <Link
                    href={`/blog/${post.slug}`}
                    key={post.id}
                    className="group block rounded-[12px] bg-white p-3 shadow-sm transition hover:shadow-md sm:p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-6">
                      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-[12px] bg-gray-100 sm:h-auto sm:min-h-[9.5rem] sm:w-52 md:w-60">
                        <Image
                          src={post.cover_image || PLACEHOLDER}
                          alt={post.title}
                          fill
                          className="object-cover object-center transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 240px"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col py-0.5 sm:py-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {post.region ? (
                            <span className="rounded-[12px] bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                              {post.region}
                            </span>
                          ) : null}
                          <span className="rounded-[12px] bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            {BLOG_CATEGORY_MAP[post.category_id] || "其他"}
                          </span>
                          <span className="text-xs text-gray-400 sm:ml-auto">
                            {formatDate(post.published_at)}
                          </span>
                        </div>
                        <h3 className="mb-1.5 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-teal-600 sm:text-xl">
                          {post.title}
                        </h3>
                        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-gray-600 sm:line-clamp-3 sm:text-[15px]">
                          {post.excerpt || "點擊閱讀全文…"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <aside>
              <div className="sticky top-28 rounded-[12px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="h-7 w-1.5 rounded-[12px] bg-[#45cad5]"
                    aria-hidden
                  />
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    經典推薦
                  </h2>
                </div>
                <div className="space-y-5">
                  {popularPosts.map((post, idx) => (
                    <Link
                      href={`/blog/${post.slug}`}
                      key={post.id}
                      className="group flex gap-3 border-b border-gray-50 pb-5 last:border-0 last:pb-0"
                    >
                      <div
                        className="w-10 shrink-0 text-2xl font-bold tabular-nums text-teal-100 transition group-hover:text-teal-300"
                        aria-hidden
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
                          {post.region ? (
                            <span className="font-medium text-teal-600">
                              {post.region}
                            </span>
                          ) : null}
                          <span className="text-amber-600">
                            {post.region ? "・" : ""}
                            {BLOG_CATEGORY_MAP[post.category_id] || "其他"}
                          </span>
                        </div>
                        <h4 className="line-clamp-2 text-base font-medium leading-snug text-gray-900 transition-colors group-hover:text-teal-600">
                          {post.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
