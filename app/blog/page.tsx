"use client";

/**
 * =============================================================================
 * 【新手導讀】Blog 公開列表頁 `/blog`
 * =============================================================================
 * 角色：訪客可看已上架文章；用地區關鍵字篩選
 * 資料：fetchBlogPosts() → GET /api/blog（後端預設 published）
 * 子元件：BlogPostCard、BlogMediaImage、BlogOwnerEditLink
 * =============================================================================
 */
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogBackToTopButton } from "./_components/BlogBackToTopButton";
import BlogMediaImage from "./_components/BlogMediaImage";
import BlogOwnerEditLink from "./_components/BlogOwnerEditLink";
import BlogPostCard from "./_components/BlogPostCard";
import { fetchBlogPosts } from "./_lib/api";
import type { BlogPost } from "./_lib/types";
import { BLOG_REGIONS, blogCategoryLabel, blogCityLabel } from "./_lib/types";
import { useAuth } from "@/contexts/auth-context";

/** 是否已上架（列表精選只用 published） */
function isPublished(post: BlogPost) {
  return post.status === "published";
}

function formatDate(iso: string | null) {
  if (!iso) return "未上架";
  return new Date(iso).toLocaleDateString("zh-TW");
}

function postTimestamp(post: BlogPost) {
  const timestamp = new Date(
    post.published_at ?? post.updated_at ?? post.created_at,
  ).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
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
  // ---------- 畫面狀態 ----------
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showAllLatestPosts, setShowAllLatestPosts] = useState(false);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  // ---------- 進頁載入列表（cancelled 避免卸載後還 setState）----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 公開列表：後端預設只回 published
        const posts = await fetchBlogPosts();
        if (!cancelled) setAllPosts(Array.isArray(posts) ? posts : []);
      } catch (e) {
        console.error("[blog list]", e);
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

  /** 優先使用 API 城市欄位；舊資料退回標題／摘要／內文關鍵字比對。 */
  const filteredPosts = useMemo(() => {
    if (!selectedCountry) return publishedPosts;
    return publishedPosts.filter((post) => {
      if (post.city) {
        return blogCityLabel(post) === selectedCountry;
      }
      const hay = `${post.title}\n${post.excerpt ?? ""}\n${post.content}`;
      return hay.includes(selectedCountry);
    });
  }, [publishedPosts, selectedCountry]);

  /** 精選：每個城市各取最新一篇；有地區篩選時顯示該城市全部文章。 */
  const featuredPosts = useMemo(() => {
    const postsByNewest = [...publishedPosts].sort(
      (a, b) => postTimestamp(b) - postTimestamp(a),
    );

    if (selectedCountry) {
      return [...filteredPosts].sort(
        (a, b) => postTimestamp(b) - postTimestamp(a),
      );
    }

    return BLOG_REGIONS.map((city) =>
      postsByNewest.find((post) => blogCityLabel(post) === city),
    ).filter((post): post is BlogPost => post != null);
  }, [filteredPosts, publishedPosts, selectedCountry]);

  const latestPosts = useMemo(() => {
    if (selectedCountry) return [];
    const sorted = [...publishedPosts].sort(
      (a, b) => postTimestamp(b) - postTimestamp(a),
    );
    return showAllLatestPosts ? sorted : sorted.slice(0, 8);
  }, [publishedPosts, selectedCountry, showAllLatestPosts]);

  /** 經典推薦：留言數由多至少；同票時較新的文章優先。 */
  const popularPosts = useMemo(() => {
    if (selectedCountry) return [];
    return [...publishedPosts]
      .sort(
        (a, b) =>
          (b.comment_count ?? 0) - (a.comment_count ?? 0) ||
          postTimestamp(b) - postTimestamp(a),
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
          src="/images/carousel1.jpeg"
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
          {/* 管理／新增：會員中心分頁；部落格仍可走獨立撰寫頁 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {(auth?.role === "管理者" || auth?.role === "會員") && ( 
            <>
            <Link href="/member/edit-post" className="inline-flex items-center gap-1.5 rounded-[12px] border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
              管理文章
            </Link>
            {auth?.role === "會員" && (
            <Link href="/member/edit-post?tab=create" className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#45cad5] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#36b3be] hover:shadow-lg">
              <span aria-hidden>+</span> 新增文章
            </Link>) }
            </>
            )}
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
                      <BlogOwnerEditLink
                        authorId={post.author_id}
                        href={`/member/edit-post?tab=create&draft=${post.id}`}
                        className="text-xs font-medium text-teal-600 hover:underline"
                      >
                        編輯文章
                      </BlogOwnerEditLink>
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
                  href="/member/edit-post?tab=create"
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
                        <BlogMediaImage
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          className="object-cover object-center transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 240px"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col py-0.5 sm:py-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-[12px] bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                            {blogCityLabel(post)}
                          </span>
                          <span className="rounded-[12px] bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            {blogCategoryLabel(post)}
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
              {!showAllLatestPosts && publishedPosts.length > 8 ? (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllLatestPosts(true)}
                    className="rounded-[12px] border border-[#45cad5] bg-white px-6 py-2.5 text-sm font-semibold text-[#259aa5] transition hover:bg-[#effcfd]"
                  >
                    瀏覽全部文章
                  </button>
                </div>
              ) : null}
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
                        className="w-10 shrink-0 text-2xl font-bold text-teal-100 tabular-nums transition group-hover:text-teal-300"
                        aria-hidden
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="text-teal-600">
                            {blogCityLabel(post)}
                          </span>
                          <span className="text-gray-300" aria-hidden>
                            ·
                          </span>
                          <span className="text-amber-600">
                            {blogCategoryLabel(post)}
                          </span>
                        </div>
                        <h4 className="line-clamp-2 text-base leading-snug font-medium text-gray-900 transition-colors group-hover:text-teal-600">
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
      <BlogBackToTopButton />
    </div>
  );
}
