"use client";

/**
 * =============================================================================
 * 【新手導讀】會員中心 — 管理／新增文章 `/member/edit-post`
 * =============================================================================
 * Tab「管理」：fetchMyBlogPosts、刪除、篩選狀態
 * Tab「新增」：內嵌 BlogPostEditor（= BlogPostForm）
 * 這是 Blog 在會員區的主入口（/blog/manage 會轉來這裡）
 * =============================================================================
 */
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import BlogMediaImage from "@/app/blog/_components/BlogMediaImage";
import BlogPostEditor from "@/app/blog/_components/BlogPostEditor";
import {
  deleteBlogPost,
  fetchMyBlogPosts,
} from "@/app/blog/_lib/api";
import type { BlogPost, BlogPostStatus } from "@/app/blog/_lib/types";
import {
  BLOG_STATUS_LABEL,
  blogCategoryLabel,
  blogCityLabel,
} from "@/app/blog/_lib/types";

type PageTab = "manage" | "create";
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

function MemberEditPostContent() {
  const searchParams = useSearchParams();
  const { auth, isAuthenticated, authInit } = useAuth();
  const [activeTab, setActiveTab] = useState<PageTab>(
    searchParams.get("tab") === "create" ? "create" : "manage",
  );
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ManageFilter>("all");
  const [keyword, setKeyword] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [notePost, setNotePost] = useState<BlogPost | null>(null);

  const isAdmin = auth.role === "管理者";

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchMyBlogPosts();
      setPosts(Array.isArray(list) ? list : []);
    } catch (e) {
      setPosts([]);
      const message = e instanceof Error ? e.message : "載入文章失敗";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authInit) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    if (isAdmin) {
      setLoading(false);
      return;
    }
    if (activeTab === "manage") {
      void loadPosts();
    }
  }, [authInit, isAuthenticated, isAdmin, activeTab, loadPosts]);

  const counts = useMemo(() => {
    const base = {
      all: posts.length,
      published: 0,
      pending_review: 0,
      draft: 0,
      rejected: 0,
    };
    for (const p of posts) {
      if (p.status === "published") base.published += 1;
      else if (p.status === "pending_review") base.pending_review += 1;
      else if (p.status === "draft") base.draft += 1;
      else if (p.status === "rejected") base.rejected += 1;
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
          (p.order_title ?? "").toLowerCase().includes(q) ||
          (p.experience_title ?? "").toLowerCase().includes(q) ||
          (p.city ?? "").toLowerCase().includes(q) ||
          (p.category_name ?? "").toLowerCase().includes(q) ||
          (p.excerpt ?? "").toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
  }, [posts, filter, keyword]);

  async function handleDelete(post: BlogPost) {
    const ok = window.confirm(
      `確定要刪除「${post.title}」嗎？此操作無法復原。`,
    );
    if (!ok) return;

    setActingId(post.id);
    try {
      await deleteBlogPost(post.id);
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
      toast.success(`「${post.title}」已刪除`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "網路錯誤，請稍後再試");
    } finally {
      setActingId(null);
    }
  }

  if (authInit && isAuthenticated && isAdmin) {
    return (
      <div className="w-full text-gray-800">
        <h1 className="mb-2 text-xl font-bold">文章管理</h1>
        <p className="mb-4 text-sm text-gray-500">
          管理者請使用「文章審查」處理送審內容（僅可檢視／通過／駁回，不可編輯）。
        </p>
        <Link
          href="/member/blog-review"
          className="inline-flex rounded-[12px] bg-[#45cad5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#36b3be]"
        >
          前往文章審查
        </Link>
      </div>
    );
  }

  return (
    <section className="w-full min-w-0 text-gray-800">
      <Toaster position="top-center" />

      {/* 分頁：參考 member/profile 切換樣式 */}
      <div className="border-b border-[#d9d9d9]">
        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => setActiveTab("manage")}
            className={`px-3 pb-3 text-[18px] ${
              activeTab === "manage"
                ? "border-b border-[#7fc4cf] text-[#6fb8c4]"
                : "text-[#d4d4d4]"
            }`}
          >
            管理文章
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`px-3 pb-3 text-[18px] ${
              activeTab === "create"
                ? "border-b border-[#7fc4cf] text-[#6fb8c4]"
                : "text-[#d4d4d4]"
            }`}
          >
            新增文章
          </button>
        </div>
      </div>

      {/* —— 管理文章：列表 —— */}
      {activeTab === "manage" ? (
        <div className="mt-9">
          <p className="mb-4 text-sm text-gray-500">
            僅顯示您自己的文章 · 可撰寫／編輯／刪除
            {!loading ? (
              <span className="ml-2 font-medium text-slate-700">
                · 共 {posts.length} 篇
              </span>
            ) : null}
          </p>

          <div className="mb-4 space-y-3">
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜尋標題、訂單名稱、摘要…"
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
                    className={`rounded-[12px] px-3 py-1.5 text-sm font-medium transition ${
                      active
                        ? "bg-gray-900 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {loadError ? (
            <div className="mb-4 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
              <button
                type="button"
                className="ml-3 font-medium text-teal-700 underline"
                onClick={() => void loadPosts()}
              >
                重試
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-[12px] bg-gray-100"
                />
              ))}
            </div>
          ) : list.length === 0 && !loadError ? (
            <div className="rounded-[12px] border border-dashed border-gray-200 px-6 py-16 text-center">
              <p className="font-medium text-gray-600">尚無文章</p>
              <p className="mt-2 text-sm text-gray-400">
                完成體驗訂單後，即可依訂單撰寫部落格
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className="mt-4 inline-flex rounded-[12px] bg-[#45cad5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#36b3be]"
              >
                新增文章
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {list.map((post) => {
                const busy = actingId === post.id;
                return (
                  <li
                    key={post.id}
                    className="overflow-hidden rounded-[12px] border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row">
                      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-[12px] bg-gray-100 sm:h-24 sm:w-36">
                        <BlogMediaImage
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          className="object-cover object-center"
                          sizes="144px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-[12px] px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[post.status]}`}
                          >
                            {BLOG_STATUS_LABEL[post.status]}
                          </span>
                          <span className="rounded-[12px] bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                            {blogCityLabel(post)}
                          </span>
                          <span className="rounded-[12px] bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            {blogCategoryLabel(post)}
                          </span>
                          <span className="text-xs text-gray-400">
                            更新 {formatDate(post.updated_at)}
                          </span>
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">
                          {post.title}
                        </h2>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {post.excerpt || "（尚無摘要）"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {post.status === "published" ? (
                            <Link
                              href={`/blog/${post.slug}`}
                              className="rounded-[12px] border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                            >
                              查看
                            </Link>
                          ) : null}
                          {post.status === "rejected" ||
                          (post.review_note && post.review_note.trim()) ? (
                            <button
                              type="button"
                              onClick={() => setNotePost(post)}
                              className="rounded-[12px] border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                            >
                              退回原因
                            </button>
                          ) : null}
                          <Link
                            href={`/blog/${post.slug}/edit`}
                            className="rounded-[12px] border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100"
                          >
                            編輯
                          </Link>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleDelete(post)}
                            className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                          >
                            {busy ? "刪除中…" : "刪除"}
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
      ) : null}

      {/* —— 新增文章：框內編輯表單 —— */}
      {activeTab === "create" ? (
        <div className="mt-9">
          <p className="mb-5 text-sm text-gray-500">
            依已完成訂單撰寫文章；封面可裁切調整後再送出審查。
          </p>
          <BlogPostEditor
            mode="create"
            variant="member"
            hideToaster
            onSuccess={() => {
              setActiveTab("manage");
              void loadPosts();
            }}
          />
        </div>
      ) : null}

      {notePost ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-reason-title"
          onClick={() => setNotePost(null)}
        >
          <div
            className="w-full max-w-md rounded-[12px] border border-gray-100 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="reject-reason-title"
              className="text-lg font-bold text-gray-900"
            >
              退回原因
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              文章：{notePost.title}
            </p>
            <div className="mt-4 max-h-60 overflow-y-auto rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-red-800">
              {notePost.review_note?.trim()
                ? notePost.review_note.trim()
                : "管理者尚未填寫退回原因。"}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNotePost(null)}
                className="rounded-[12px] border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                關閉
              </button>
              <Link
                href={`/blog/${notePost.slug}/edit`}
                className="rounded-[12px] bg-[#45cad5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#36b3be]"
                onClick={() => setNotePost(null)}
              >
                去修改
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function MemberEditPostPage() {
  return (
    <Suspense
      fallback={
        <div className="h-48 animate-pulse rounded-[12px] bg-gray-100" />
      }
    >
      <MemberEditPostContent />
    </Suspense>
  );
}
