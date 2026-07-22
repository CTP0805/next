"use client";

/**
 * 【新手】留言區（目前為前端 mock／本機 state，未接後端 API）
 * postSlug 用來區分不同文章的本機留言 key
 */
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

const fieldClass =
  "w-full rounded-[12px] border border-gray-200 bg-white px-4 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#45cad5] focus:ring-2 focus:ring-[#45cad5]/20";

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
            分享你的想法，與其他旅人交流心得
          </p>
        </div>
        <span className="rounded-[12px] bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
          {countLabel}
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-[12px] border border-gray-100 bg-gray-50/80 p-4 sm:p-6"
      >
        <div className="mb-4">
          <label
            htmlFor="comment-author"
            className="mb-1.5 block text-sm font-medium text-gray-700"
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
            className={`h-11 ${fieldClass}`}
          />
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
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="寫下你的留言…"
            className={`resize-y py-3 ${fieldClass}`}
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {content.length}/500
          </div>
        </div>

        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        {submitted ? (
          <p className="mb-3 text-sm text-teal-600">留言已送出，感謝分享！</p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-[12px] bg-[#45cad5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#36b3be]"
          >
            送出留言
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
            還沒有留言，成為第一個留言的人吧！
          </p>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-[12px] border border-gray-100 bg-gray-50/60 px-4 py-4 sm:px-5"
            >
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#45cad5]/15 text-sm font-bold text-[#36b3be]">
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
