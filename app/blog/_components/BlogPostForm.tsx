"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import type { BlogPost, BlogPostInput, BlogPostStatus } from "../_lib/types";
import {
  BLOG_CATEGORY_MAP,
  BLOG_REGIONS,
  BLOG_STATUS_LABEL,
  BLOG_TITLE_MAX,
  slugifyTitle,
} from "../_lib/types";

const CKEditorWrapper = dynamic(
  () => import("@/components/CKEditorWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center rounded-[12px] border border-gray-200 bg-gray-50 text-sm text-gray-400">
        編輯器載入中…
      </div>
    ),
  },
);

interface BlogPostFormProps {
  mode: "create" | "edit";
  initial?: BlogPost;
  onSuccess?: (post: BlogPost) => void;
}

const STATUS_OPTIONS: BlogPostStatus[] = [
  "draft",
  "pending_review",
  "published",
  "rejected",
];

const fieldClass =
  "h-12 w-full rounded-[12px] border border-gray-200 bg-white px-4 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#45cad5] focus:ring-2 focus:ring-[#45cad5]/20";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

export default function BlogPostForm({
  mode,
  initial,
  onSuccess,
}: BlogPostFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(initial?.cover_image ?? "");
  const [contentImage, setContentImage] = useState(
    initial?.content_image ?? "",
  );
  const [region, setRegion] = useState(initial?.region ?? BLOG_REGIONS[0]);
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? 1);
  const [authorId, setAuthorId] = useState(initial?.author_id ?? 1);
  const [content, setContent] = useState(initial?.content ?? "");
  const [status, setStatus] = useState<BlogPostStatus>(
    initial?.status ?? "draft",
  );
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = useMemo(
    () =>
      Object.entries(BLOG_CATEGORY_MAP).map(([id, label]) => ({
        id: Number(id),
        label,
      })),
    [],
  );

  function handleTitleChange(value: string) {
    const next = value.slice(0, BLOG_TITLE_MAX);
    setTitle(next);
    if (!slugTouched) {
      setSlug(slugifyTitle(next));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("請填寫標題");
      return;
    }
    if (title.trim().length > BLOG_TITLE_MAX) {
      toast.error(`標題最多 ${BLOG_TITLE_MAX} 字`);
      return;
    }
    if (!content.trim()) {
      toast.error("請填寫文章內容");
      return;
    }

    const payload: BlogPostInput = {
      title: title.trim(),
      slug: slug.trim() || slugifyTitle(title),
      content,
      excerpt: excerpt.trim() || null,
      cover_image: coverImage.trim() || null,
      content_image: contentImage.trim() || null,
      region: region || null,
      category_id: categoryId,
      author_id: authorId,
      status,
    };

    setSubmitting(true);
    try {
      const url =
        mode === "create" ? "/api/blog" : `/api/blog/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        post?: BlogPost;
        message?: string;
      };

      if (!res.ok || !data.post) {
        toast.error(data.message || "儲存失敗");
        return;
      }

      toast.success(data.message || "已儲存");
      onSuccess?.(data.post);
    } catch {
      toast.error("網路錯誤，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Toaster position="top-center" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <label htmlFor="blog-title" className={labelClass}>
            標題 <span className="text-red-500">*</span>
            <span className="ml-1 font-normal text-gray-400">
              （最多 {BLOG_TITLE_MAX} 字）
            </span>
          </label>
          <input
            id="blog-title"
            type="text"
            className={fieldClass}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="輸入文章標題"
            maxLength={BLOG_TITLE_MAX}
            required
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {title.length}/{BLOG_TITLE_MAX}
          </p>
        </div>

        <div>
          <label htmlFor="blog-slug" className={labelClass}>
            網址別名 <span className="text-red-500">*</span>
          </label>
          <input
            id="blog-slug"
            type="text"
            className={`${fieldClass} font-mono text-sm`}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="my-first-post"
            required
          />
          <p className="mt-1 text-xs text-gray-400">
            用於網址 /blog/別名；中文標題會自動轉成羅馬拼音
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="blog-excerpt" className={labelClass}>
          摘要
          <span className="ml-1 font-normal text-gray-400">
            （列表預覽，可空）
          </span>
        </label>
        <textarea
          id="blog-excerpt"
          className="min-h-24 w-full resize-y rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#45cad5] focus:ring-2 focus:ring-[#45cad5]/20"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="用一兩句話介紹這篇文章"
          maxLength={200}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="blog-author" className={labelClass}>
            作者 ID
          </label>
          <input
            id="blog-author"
            type="number"
            min={1}
            className={fieldClass}
            value={authorId}
            onChange={(e) => setAuthorId(Number(e.target.value) || 1)}
          />
        </div>

        <div>
          <label htmlFor="blog-category" className={labelClass}>
            分類
          </label>
          <select
            id="blog-category"
            className={fieldClass}
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="blog-status" className={labelClass}>
            狀態
          </label>
          <select
            id="blog-status"
            className={fieldClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as BlogPostStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {BLOG_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="blog-region" className={labelClass}>
            地區
          </label>
          <select
            id="blog-region"
            className={fieldClass}
            value={region ?? ""}
            onChange={(e) => setRegion(e.target.value)}
          >
            {BLOG_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <label htmlFor="blog-cover" className={labelClass}>
            封面圖片路徑
            <span className="ml-1 font-normal text-gray-400">（可空）</span>
          </label>
          <input
            id="blog-cover"
            type="text"
            className={fieldClass}
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="/images/carousel1.jpg"
          />
        </div>

        <div>
          <label htmlFor="blog-content-image" className={labelClass}>
            內文頂圖路徑
            <span className="ml-1 font-normal text-gray-400">（可空）</span>
          </label>
          <input
            id="blog-content-image"
            type="text"
            className={fieldClass}
            value={contentImage}
            onChange={(e) => setContentImage(e.target.value)}
            placeholder="/Banner大圖/巴黎/以這張為主.jpg"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          文章內容 <span className="text-red-500">*</span>
        </label>
        <CKEditorWrapper
          data={content}
          onChange={setContent}
          placeholder="撰寫文章內容：支援標題、清單、圖片、表格…"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
        <p className="text-xs text-gray-400">
          狀態設為「已上架」時會記錄上架時間
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[12px] bg-[#45cad5] px-8 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#36b3be] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        >
          {submitting
            ? "儲存中…"
            : mode === "create"
              ? "發布文章"
              : "更新文章"}
        </button>
      </div>
    </form>
  );
}
