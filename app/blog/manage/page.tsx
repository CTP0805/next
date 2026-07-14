"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import type { BlogPost, BlogPostStatus } from "../_lib/types";
import { BLOG_CATEGORY_MAP, BLOG_STATUS_LABEL } from "../_lib/types";

const PLACEHOLDER = "/images/carousel1.jpg";

type ManageFilter = "all" | BlogPostStatus;

const FILTER_OPTIONS: { value: ManageFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "published", label: "已上架" },
  { value: "pending_review", label: "待審核" },
  { value: "draft", label: "草稿" },
  { value: "rejected", label: "被退回" },
];

const STATUS_BADGE: Record<BlogPostStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_review: "bg-amber-100 text-amber-800",
  published: "bg-teal-100 text-teal-700",
  rejected: "bg-red-100 text-red-700",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BlogManagePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ManageFilter>("all");
  const [keyword, setKeyword] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/blog", { cache: "no-store" });
      const data = (await res.json()) as { posts?: BlogPost[] };
      setPosts(data.posts ?? []);
    } catch {
      setPosts([]);
      toast.error("載入文章失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const counts = useMemo(() => {
    const base = {
      all: posts.length,
      published: 0,
      pending_review: 0,
      draft: 0,
      rejected: 0,
    };
    for (const p of posts) {
      base[p.status] += 1;
    }
    return base;
  }, [posts]);

  const list = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return [...posts]
      .filter((p) => (filter === "all" ? true : p.status === filter))
      .filter((p) => {
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.region ?? "").toLowerCase().includes(q) ||
          (p.excerpt ?? "").toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
  }, [posts, filter, keyword]);

  async function updateStatus(post: BlogPost, status: BlogPostStatus) {
    setActingId(post.id);
    try {
      const res = await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          cover_image: post.cover_image,
          content_image: post.content_image,
          region: post.region,
          category_id: post.category_id,
          author_id: post.author_id,
          status,
        }),
      });
      const data = (await res.json()) as {
        post?: BlogPost;
        message?: string;
      };

      if (!res.ok || !data.post) {
        toast.error(data.message || "更新失敗");
        return;
      }

      // 修訂版核准後已由 API 覆蓋原文並刪除副本，清單也同步移除它。
      setPosts((prev) =>
        status === "published" && post.review_of_id
          ? prev.filter((item) => item.id !== post.id)
          : prev.map((item) => (item.id === data.post.id ? data.post : item)),
      );

      if (status === "published") {
        toast.success(`「${post.title}」已上架`);
      } else if (status === "draft") {
        toast.success(`「${post.title}」已下架`);
      } else {
        toast.success(data.message || "已更新");
      }
    } catch {
      toast.error("網路錯誤，請稍後再試");
    } finally {
      setActingId(null);
    }
  }

  async function handleDelete(post: BlogPost) {
    const ok = window.confirm(
      `確定要刪除「${post.title}」嗎？此操作無法復原。`,
    );
    if (!ok) return;

    setActingId(post.id);
    try {
      const res = await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        toast.error(data.message || "刪除失敗");
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      toast.success(`「${post.title}」已刪除`);
    } catch {
      toast.error("網路錯誤，請稍後再試");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <nav className="text-sm text-gray-500" aria-label="麵包屑">
              <Link
                href="/blog"
                className="font-medium text-teal-600 hover:underline"
              >
                部落格
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-700">文章管理</span>
            </nav>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              文章管理
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              管理全部文章：上架、下架與刪除
              <span className="ml-2 font-medium text-slate-700">
                · 共 {posts.length} 篇
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/blog"
              className="rounded-[12px] border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              返回列表
            </Link>
            <Link
              href="/blog/review"
              className="rounded-[12px] border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
            >
              文章審查
            </Link>
            <Link
              href="/blog/new"
              className="rounded-[12px] bg-[#45cad5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#36b3be]"
            >
              新增文章
            </Link>
          </div>
        </div>

        {/* 搜尋 + 篩選 */}
        <div className="mb-6 space-y-3">
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜尋標題、slug、地區、摘要…"
            className="h-11 w-full rounded-[12px] border border-gray-200 bg-white px-4 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#45cad5] focus:ring-2 focus:ring-[#45cad5]/20"
          />
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((opt) => {
              const active = filter === opt.value;
              const count =
                opt.value === "all" ? counts.all : counts[opt.value];
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFilter(opt.value)}
                  className={`rounded-[12px] px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-[12px] bg-white shadow-sm"
              />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
            <p className="text-lg font-medium text-gray-600">
              找不到符合條件的文章
            </p>
            <p className="mt-2 text-sm text-gray-400">
              試試其他篩選，或清除搜尋關鍵字
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {list.map((post) => {
              const busy = actingId === post.id;
              const isPublished = post.status === "published";

              return (
                <li
                  key={post.id}
                  className="overflow-hidden rounded-[12px] border border-gray-100 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                    <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-[12px] bg-gray-100 sm:h-28 sm:w-40">
                      <Image
                        src={post.cover_image || PLACEHOLDER}
                        alt={post.title}
                        fill
                        className="object-cover object-center"
                        sizes="160px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-[12px] px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[post.status]}`}
                        >
                          {BLOG_STATUS_LABEL[post.status]}
                        </span>
                        {post.region ? (
                          <span className="rounded-[12px] bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                            {post.region}
                          </span>
                        ) : null}
                        <span className="rounded-[12px] bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          {BLOG_CATEGORY_MAP[post.category_id] || "其他"}
                        </span>
                        <span className="text-xs text-gray-400">
                          更新 {formatDate(post.updated_at)}
                        </span>
                        {post.published_at ? (
                          <span className="text-xs text-gray-400">
                            · 上架 {formatDate(post.published_at)}
                          </span>
                        ) : null}
                      </div>

                      <h2 className="text-lg font-semibold text-gray-900">
                        {post.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {post.excerpt || "（尚無摘要）"}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">
                        ID：{post.id} · slug：
                        <span className="font-mono">{post.slug}</span>
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="rounded-[12px] border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                        >
                          預覽
                        </Link>
                        <Link
                          href={`/blog/${post.slug}/edit`}
                          className="rounded-[12px] border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                        >
                          編輯
                        </Link>

                        {isPublished ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void updateStatus(post, "draft")}
                            className="rounded-[12px] border border-slate-300 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                          >
                            {busy ? "處理中…" : "下架"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void updateStatus(post, "published")}
                            className="rounded-[12px] bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
                          >
                            {busy ? "處理中…" : "上架"}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleDelete(post)}
                          className="rounded-[12px] border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
