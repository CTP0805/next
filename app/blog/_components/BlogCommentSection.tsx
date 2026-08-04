"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getApiServer } from "@/config/api-path";
import { useAuth } from "@/contexts/auth-context";
import {
  createBlogComment,
  deleteBlogComment,
  fetchBlogComments,
  updateBlogComment,
} from "../_lib/api";
import type { BlogComment } from "../_lib/types";

interface BlogCommentSectionProps {
  postSlug: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const fieldClass =
  "w-full rounded-[12px] border border-gray-200 bg-white px-4 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#45cad5] focus:ring-2 focus:ring-[#45cad5]/20";

function resolveAvatarUrl(avatarUrl?: string | null) {
  const value = avatarUrl?.trim();
  if (!value) return null;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${getApiServer()}${value.startsWith("/") ? value : `/${value}`}`;
}

function MemberAvatar({
  name,
  avatarUrl,
  sizeClass = "h-9 w-9",
}: {
  name: string;
  avatarUrl?: string | null;
  sizeClass?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedAvatar =
    resolveAvatarUrl(avatarUrl) ?? "/images/member-avatar/angry-man.jpg";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#45cad5]/15 text-sm font-bold text-[#36b3be] ${sizeClass}`}
    >
      {!imageFailed ? (
        // 頭貼可能來自 Express 上傳目錄或 Google，因此使用原生 img。
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedAvatar}
          alt={`${name}的頭貼`}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden>{name.trim().slice(0, 1) || "旅"}</span>
      )}
    </div>
  );
}

export default function BlogCommentSection({
  postSlug,
}: BlogCommentSectionProps) {
  const { auth, authInit, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetchBlogComments(postSlug)
      .then((items) => {
        if (!cancelled) {
          setComments(items);
          setLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setComments([]);
          setLoadError(error instanceof Error ? error.message : "讀取留言失敗");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postSlug]);

  const countLabel = useMemo(
    () => `${comments.length} 則留言`,
    [comments.length],
  );
  const ownComment = useMemo(
    () => comments.find((comment) => comment.member_id === auth.id),
    [auth.id, comments],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setSubmitted(false);

    if (!isAuthenticated) {
      setSubmitError("請先登入後再留言");
      return;
    }

    const body = content.trim();
    if (body.length < 2 || body.length > 500) {
      setSubmitError("留言內容需為 2 至 500 個字");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createBlogComment(postSlug, body);
      setComments((previous) => [created, ...previous]);
      setContent("");
      setSubmitted(true);
      toast.success("留言送出成功");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "送出留言失敗");
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(comment: BlogComment) {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setActionError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditContent("");
    setActionError("");
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingId == null) return;

    const body = editContent.trim();
    if (body.length < 2 || body.length > 500) {
      setActionError("留言內容需為 2 至 500 個字");
      return;
    }

    setActionId(editingId);
    setActionError("");
    try {
      const updated = await updateBlogComment(editingId, body);
      setComments((previous) =>
        previous.map((comment) =>
          comment.id === updated.id ? updated : comment,
        ),
      );
      setEditingId(null);
      setEditContent("");
      toast.success("留言編輯成功");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "更新留言失敗");
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(commentId: number) {
    setActionId(commentId);
    setActionError("");
    try {
      await deleteBlogComment(commentId);
      setComments((previous) =>
        previous.map((comment) =>
          comment.id === commentId
            ? { ...comment, status: "deleted" as const }
            : comment,
        ),
      );
      if (editingId === commentId) {
        setEditingId(null);
        setEditContent("");
      }
      setDeleteConfirmId(null);
      toast.success("留言刪除成功");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "刪除留言失敗");
    } finally {
      setActionId(null);
    }
  }



  const loginHref = `/auth/login?next=${encodeURIComponent(
    `/blog/${postSlug}`,
  )}`;

  return (
    <section className="rounded-[12px] border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
        <div>
          <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 sm:text-2xl">
            <span
              className="h-6 w-1.5 rounded-[12px] bg-[#45cad5]"
              aria-hidden
            />
            留言區
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            登入後即可分享想法，留言名稱會使用會員帳號名稱
          </p>
        </div>
        <span className="rounded-[12px] bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
          {loading ? "載入中…" : countLabel}
        </span>
      </div>

      {!authInit ? (
        <div className="mb-8 rounded-[12px] border border-gray-100 bg-gray-50 px-5 py-6 text-sm text-gray-500">
          正在確認登入狀態…
        </div>
      ) : !isAuthenticated ? (
        <div className="mb-8 rounded-[12px] border border-teal-100 bg-teal-50/70 px-5 py-6">
          <p className="font-medium text-gray-800">登入後才能留言</p>
          <p className="mt-1 text-sm text-gray-500">
            留言會顯示會員帳號名稱，不能自行輸入或更改暱稱。
          </p>
          <Link
            href={loginHref}
            className="mt-4 inline-flex rounded-[12px] bg-[#45cad5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#36b3be]"
          >
            前往登入
          </Link>
        </div>
      ) : ownComment ? (
        <div className="mb-8 rounded-[12px] border border-teal-100 bg-teal-50/70 px-5 py-6 text-sm font-medium text-teal-700">
          {ownComment.status === "deleted"
            ? "您曾在這篇文章留言，同一篇文章不能重複留言。"
            : "您已留言過，同一篇文章不能重複留言；如需調整內容，請編輯原留言。"}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-[12px] border border-gray-100 bg-gray-50/80 p-4 sm:p-6"
        >
          <div className="mb-4 flex items-center gap-3 text-sm">
            <MemberAvatar
              name={auth.name}
              avatarUrl={auth.avatar_url}
              sizeClass="h-10 w-10"
            />
            <div>
              <span className="block text-xs text-gray-500">留言身分</span>
              <span className="font-semibold text-gray-800">{auth.name}</span>
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="comment-content"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              留言內容
            </label>
            <textarea
              id="comment-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              maxLength={500}
              placeholder="寫下你的留言…"
              className={`resize-y py-3 ${fieldClass}`}
            />
            <div className="mt-1 text-right text-xs text-gray-400">
              {content.length}/500
            </div>
          </div>

          {submitError ? (
            <p className="mb-3 text-sm text-red-500">{submitError}</p>
          ) : null}
          {submitted ? (
            <p className="mb-3 text-sm text-teal-600">留言已送出，感謝分享！</p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="button-main"
            >
              {submitting ? "送出中…" : "送出留言"}
            </button>
          </div>
        </form>
      )}

      {loadError ? (
        <p className="mb-3 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {loadError}
        </p>
      ) : null}

      {actionError ? (
        <p className="mb-3 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </p>
      ) : null}

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-[12px] bg-gray-100"
              />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
            還沒有留言，成為第一個留言的人吧！
          </p>
        ) : (
          comments.map((comment) => {
            const isDeleted = comment.status === "deleted";

            return (
            <article
              key={comment.id}
              className={`rounded-[12px] border px-4 py-4 sm:px-5 ${
                isDeleted
                  ? "border-dashed border-gray-200 bg-gray-50"
                  : "border-gray-100 bg-gray-50/60"
              }`}
            >
              {isDeleted ? (
                <p className="py-2 text-center text-sm font-medium text-gray-400">
                  該筆留言已被刪除
                </p>
              ) : (
                <>
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <MemberAvatar
                  name={comment.author_name}
                  avatarUrl={comment.author_avatar}
                />
                <span className="font-semibold text-gray-900">
                  {comment.author_name}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(comment.created_at)}
                </span>
                {auth.id === comment.member_id ? (
                  <div className="ml-auto flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => startEditing(comment)}
                      disabled={actionId === comment.id}
                      className="font-medium text-[#36b3be] transition hover:text-[#258d95] disabled:opacity-50"
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(comment.id)}
                      disabled={actionId === comment.id}
                      className="font-medium text-red-500 transition hover:text-red-600 disabled:opacity-50"
                    >
                      刪除
                    </button>
                  </div>
                ) : null}
              </div>
              {editingId === comment.id ? (
                <form onSubmit={handleUpdate} className="pl-12">
                  <textarea
                    value={editContent}
                    onChange={(event) => setEditContent(event.target.value)}
                    rows={3}
                    maxLength={500}
                    className={`resize-y py-3 ${fieldClass}`}
                    aria-label="編輯留言內容"
                  />
                  <div className="mt-1 text-right text-xs text-gray-400">
                    {editContent.length}/500
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={actionId === comment.id}
                      className="button-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={actionId === comment.id}
                      className="button-main px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#36b3be] disabled:opacity-50"
                    >
                      {actionId === comment.id ? "儲存中…" : "儲存"}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="pl-12 text-[15px] leading-relaxed whitespace-pre-wrap text-gray-700">
                  {comment.content}
                </p>
              )}
                </>
              )}
            </article>
            );
          })
        )}
      </div>

      {deleteConfirmId !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && actionId === null) {
              setDeleteConfirmId(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-comment-title"
            className="w-full max-w-sm rounded-[16px] bg-white p-6 shadow-2xl"
          >
            <h3
              id="delete-comment-title"
              className="text-lg font-bold text-gray-900"
            >
              確認刪除留言
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              確定要刪除這則留言嗎？刪除後將無法復原。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={actionId === deleteConfirmId}
                className="button-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(deleteConfirmId)}
                disabled={actionId === deleteConfirmId}
                className="button-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionId === deleteConfirmId ? "刪除中…" : "確認刪除"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
