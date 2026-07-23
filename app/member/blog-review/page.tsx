"use client";

/**
 * =============================================================================
 * 【新手導讀】文章審查（管理者）`/member/blog-review`
 * =============================================================================
 * fetchPendingReviewPosts → 待審列表
 * reviewBlogPost(id, approve|reject, note) → 通過或退回
 * 不可改作者內文，只能看 + 寫 review_note
 * =============================================================================
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import BlogMediaImage from "@/app/blog/_components/BlogMediaImage";
import BlogRichTextContent from "@/app/blog/_components/BlogRichTextContent";
import {
  fetchPendingReviewPosts,
  reviewBlogPost,
} from "@/app/blog/_lib/api";
import type { BlogPost } from "@/app/blog/_lib/types";
import { blogCategoryLabel } from "@/app/blog/_lib/types";

export default function MemberBlogReviewPage() {
  const { auth, authInit, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const isAdmin = auth.role === "管理者";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchPendingReviewPosts("pending_review");
      setPosts(list);
      setSelected((prev) => {
        if (!prev) return list[0] ?? null;
        return list.find((p) => p.id === prev.id) ?? list[0] ?? null;
      });
    } catch (e) {
      setPosts([]);
      setSelected(null);
      toast.error(e instanceof Error ? e.message : "載入審查佇列失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authInit || !isAuthenticated) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    void load();
  }, [authInit, isAuthenticated, isAdmin, load]);

  useEffect(() => {
    setNote(selected?.review_note ?? "");
  }, [selected?.id, selected?.review_note]);

  async function handleReview(action: "approve" | "reject") {
    if (!selected) return;
    if (action === "reject" && !note.trim()) {
      toast.error("駁回時請填寫註解說明原因");
      return;
    }
    setActing(true);
    try {
      const updated = await reviewBlogPost(selected.id, action, note.trim());
      toast.success(
        action === "approve"
          ? `「${updated.title}」已通過上架`
          : `「${updated.title}」已駁回`,
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失敗");
    } finally {
      setActing(false);
    }
  }

  if (authInit && isAuthenticated && !isAdmin) {
    return (
      <div className="w-full text-gray-800">
        <h1 className="mb-2 text-xl font-bold">文章審查</h1>
        <p className="text-sm text-gray-500">
          此頁僅限管理者。您目前身分為「{auth.role ?? "會員"}」。
        </p>
        <Link
          href="/member/edit-post"
          className="mt-4 inline-flex text-sm font-medium text-teal-600 hover:underline"
        >
          前往我的文章管理
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full text-gray-800">
      <Toaster position="top-center" />

      <div className="mb-6 border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-900">文章審查</h1>
        <p className="mt-1 text-sm text-gray-500">
          查看會員送審文章 · 可註解 · 通過或駁回（不可編輯內容）
          {posts.length > 0 ? (
            <span className="ml-2 font-medium text-amber-700">
              · 待審 {posts.length} 篇
            </span>
          ) : null}
        </p>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-gray-400">載入中…</p>
      ) : posts.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-gray-200 px-6 py-16 text-center text-gray-500">
          目前沒有待審核文章
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <ul className="space-y-2 lg:col-span-4">
            {posts.map((post) => {
              const active = selected?.id === post.id;
              return (
                <li key={post.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(post)}
                    className={`w-full rounded-[12px] border px-3 py-3 text-left transition ${
                      active
                        ? "border-teal-300 bg-teal-50 shadow-sm"
                        : "border-gray-100 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className="line-clamp-1 text-sm font-semibold text-gray-900">
                      {post.title}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                      {post.author_name
                        ? `作者：${post.author_name}`
                        : `作者 ID ${post.author_id}`}
                      {" · "}
                      {blogCategoryLabel(post)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          {selected ? (
            <div className="rounded-[12px] border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-8">
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-[12px] bg-amber-100 px-2.5 py-0.5 font-medium text-amber-800">
                  待審核
                </span>
                <span className="rounded-[12px] bg-slate-100 px-2.5 py-0.5 text-slate-600">
                  {blogCategoryLabel(selected)}
                </span>
                <span className="text-gray-400">
                  作者：
                  {selected.author_name || `ID ${selected.author_id}`}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                {selected.title}
              </h2>
              {selected.excerpt ? (
                <p className="mt-2 text-sm text-gray-500">{selected.excerpt}</p>
              ) : null}

              {(selected.content_image || selected.cover_image) && (
                <div className="relative mt-4 aspect-[21/9] w-full overflow-hidden rounded-[12px] bg-gray-100">
                  <BlogMediaImage
                    src={selected.content_image || selected.cover_image}
                    alt={selected.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              )}

              <div className="prose prose-sm mt-6 max-w-none text-gray-800">
                <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  文章內容（僅供檢視）
                </p>
                <BlogRichTextContent content={selected.content} />
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4">
                <label
                  htmlFor="review-note"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  審查註解
                </label>
                <textarea
                  id="review-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="可填寫給作者的說明；駁回時建議必填"
                  className="w-full resize-y rounded-[12px] border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#45cad5] focus:ring-2 focus:ring-[#45cad5]/20"
                />
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => void handleReview("reject")}
                    className="rounded-[12px] border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    {acting ? "處理中…" : "駁回"}
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => void handleReview("approve")}
                    className="rounded-[12px] bg-[#45cad5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#36b3be] disabled:opacity-60"
                  >
                    {acting ? "處理中…" : "通過"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
