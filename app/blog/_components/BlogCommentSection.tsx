"use client";

import { FormEvent, useMemo, useState } from "react";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface BlogCommentSectionProps {
  postSlug: string;
}

const seedComments: Comment[] = [
  {
    id: "c1",
    author: "旅人小陳",
    content: "這篇整理得很實用，下次去會照著路線走！",
    createdAt: "2026-06-20T10:30:00Z",
  },
  {
    id: "c2",
    author: "Amy",
    content: "封面照好美，想知道附近有沒有推薦的咖啡店？",
    createdAt: "2026-06-22T15:12:00Z",
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BlogCommentSection({
  postSlug,
}: BlogCommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(seedComments);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const countLabel = useMemo(
    () => `${comments.length} 則留言`,
    [comments.length],
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitted(false);

    const name = author.trim();
    const body = content.trim();

    if (!name || !body) {
      setError("請填寫暱稱與留言內容");
      return;
    }

    if (body.length < 2) {
      setError("留言內容至少 2 個字");
      return;
    }

    const next: Comment = {
      id: `${postSlug}-${Date.now()}`,
      author: name,
      content: body,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [next, ...prev]);
    setAuthor("");
    setContent("");
    setSubmitted(true);
  }

  return (
    <section className="mt-16 border-t border-gray-200 pt-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">留言區</h2>
          <p className="mt-2 text-sm text-gray-500">
            分享你的想法，與其他旅人交流心得
          </p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
          {countLabel}
        </span>
      </div>

      {/* 發表留言 */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-4">
          <label
            htmlFor="comment-author"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            暱稱
          </label>
          <input
            id="comment-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={24}
            placeholder="你的暱稱"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#68BBC3] focus:ring-2 focus:ring-[#68BBC3]/25"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="comment-content"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            留言內容
          </label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="寫下你的留言…"
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#68BBC3] focus:ring-2 focus:ring-[#68BBC3]/25"
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {content.length}/500
          </div>
        </div>

        {error ? (
          <p className="mb-3 text-sm text-red-500">{error}</p>
        ) : null}
        {submitted ? (
          <p className="mb-3 text-sm text-teal-600">留言已送出，感謝分享！</p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-[#45cad5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#36b3be]"
          >
            送出留言
          </button>
        </div>
      </form>

      {/* 留言列表 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-gray-500">
            還沒有留言，成為第一個留言的人吧！
          </p>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-xl border border-gray-100 bg-gray-50/70 px-5 py-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#45cad5]/15 text-sm font-bold text-[#36b3be]">
                  {comment.author.slice(0, 1)}
                </div>
                <span className="font-semibold text-gray-900">
                  {comment.author}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="pl-12 text-[15px] leading-relaxed text-gray-700">
                {comment.content}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
