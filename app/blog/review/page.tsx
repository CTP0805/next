"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import type { BlogPost, BlogPostStatus } from "../_lib/types";
import {
  BLOG_CATEGORY_MAP,
  BLOG_STATUS_LABEL,
} from "../_lib/types";

const PLACEHOLDER = "/images/carousel1.jpg";

type ReviewFilter = "pending_review" | "rejected" | "draft" | "all";

const FILTER_OPTIONS: { value: ReviewFilter; label: string }[] = [
  { value: "pending_review", label: "待審核" },
  { value: "rejected", label: "被退回" },
  { value: "draft", label: "草稿" },
  { value: "all", label: "全部（非上架）" },
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

export default function BlogReviewPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewFilter>("pending_review");
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

  const pendingCount = useMemo(
    () => posts.filter((p) => p.status === "pending_review").length,
    [posts],
  );

  const reviewQueue = useMemo(() => {
    const nonPublished = posts.filter((p) => p.status !== "published");
    const list =
      filter === "all"
        ? nonPublished
        : nonPublished.filter((p) => p.status === filter);

    return [...list].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  }, [posts, filter]);

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

      setPosts((prev) =>
        prev.map((p) => (p.id === data.post!.id ? data.post! : p)),
      );

      if (status === "published") {
        toast.success(`「${post.title}」已通過並上架`);
      } else if (status === "rejected") {
        toast.success(`「${post.title}」已退回`);
      } else {
        toast.success(data.message || "已更新");
      }
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
              <span className="text-gray-700">文章審查</span>
            </nav>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              文章審查
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              審核待上架內容：通過後前台可見，退回後作者可再修改
              {pendingCount > 0 ? (
                <span className="ml-2 font-medium text-amber-700">
                  · 待審核 {pendingCount} 篇
                </span>
              ) : null}
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
              href="/blog/new"
              className="rounded-[12px] bg-[#45cad5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#36b3be]"
            >
              新增文章
            </Link>
          </div>
        </div>

        {/* 篩選 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
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
                {opt.label}
                {opt.value === "pending_review" && pendingCount > 0
                  ? ` (${pendingCount})`
                  : ""}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-[12px] bg-white shadow-sm"
              />
            ))}
          </div>
        ) : reviewQueue.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
            <p className="text-lg font-medium text-gray-600">
              目前沒有需要審查的文章
            </p>
            <p className="mt-2 text-sm text-gray-400">
              當作者將狀態設為「待審核」後，會出現在此列表
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {reviewQueue.map((post) => {
              const busy = actingId === post.id;
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
                      </div>

                      <h2 className="text-lg font-semibold text-gray-900">
                        {post.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {post.excerpt || "（尚無摘要）"}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">
                        作者 ID：{post.author_id} · slug：
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

                        {post.status !== "published" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void updateStatus(post, "published")
                            }
                            className="rounded-[12px] bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
                          >
                            {busy ? "處理中…" : "通過上架"}
                          </button>
                        ) : null}

                        {post.status !== "rejected" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void updateStatus(post, "rejected")}
                            className="rounded-[12px] border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                          >
                            退回
                          </button>
                        ) : null}

                        {post.status === "draft" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void updateStatus(post, "pending_review")
                            }
                            className="rounded-[12px] border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
                          >
                            標為待審核
                          </button>
                        ) : null}
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
