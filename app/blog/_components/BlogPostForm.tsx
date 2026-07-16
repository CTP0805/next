"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import type { BlogPost, BlogPostInput, BlogPostStatus } from "../_lib/types";
import {
  BLOG_CATEGORY_MAP,
  BLOG_REGIONS,
  BLOG_TITLE_MAX,
  slugifyTitle,
} from "../_lib/types";

const CKEditorWrapper = dynamic(() => import("@/components/CKEditorWrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center rounded-[12px] border border-gray-200 bg-gray-50 text-sm text-gray-400">
      載入編輯器中…
    </div>
  ),
});

interface BlogPostFormProps {
  mode: "create" | "edit";
  initial?: BlogPost;
  onSuccess?: (post: BlogPost) => void;
}

const fieldClass =
  "h-12 w-full rounded-[12px] border border-gray-200 bg-white px-4 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#45cad5] focus:ring-2 focus:ring-[#45cad5]/20";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

//這裡是部落格文章表單元件，提供建立與編輯文章的功能。使用者可以輸入標題、摘要、內文，選擇分類與地區，並上傳或設定封面圖。表單會驗證必填欄位，並在送出時呼叫 API 儲存文章。
export default function BlogPostForm({
  mode,
  initial,
  onSuccess,
}: BlogPostFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [contentImage, setContentImage] = useState(
    initial?.content_image ?? initial?.cover_image ?? "",
  );
  const [region, setRegion] = useState(initial?.region ?? BLOG_REGIONS[0]);
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? 1);
  const [authorId, setAuthorId] = useState(initial?.author_id ?? 1);
  const [content, setContent] = useState(initial?.content ?? "");
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = useMemo(
    () =>
      Object.entries(BLOG_CATEGORY_MAP).map(([id, label]) => ({
        id: Number(id),
        label,
      })),
    [],
  );

  /** 將使用者選取的檔案轉為 Base64，交由儲存 API 寫入 public/posts。 */
  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0];
    if (!image) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setContentImage(reader.result);
    };
    reader.readAsDataURL(image);
  }

  /** 草稿與送審共用驗證與送出流程，按鈕決定文章狀態。 */
  //這裡是部落格文章表單元件，提供建立與編輯文章的功能。使用者可以輸入標題、摘要、內文，選擇分類與地區，並上傳或設定封面圖。表單會驗證必填欄位，並在送出時呼叫 API 儲存文章。
  async function handleSubmit(status: BlogPostStatus) {
    if (!title.trim()) {
      toast.error("請填寫文章標題");
      return;
    }
    if (!content.trim()) {
      toast.error("請填寫文章內容");
      return;
    }

    const payload: BlogPostInput = {
      title: title.trim(),
      slug: slugifyTitle(title),
      content,
      excerpt: excerpt.trim() || null,
      // 封面圖直接沿用內文頂圖，列表會以 object-cover 顯示成縮圖。
      cover_image: contentImage.trim() || null,
      content_image: contentImage.trim() || null,
      region: region || null,
      category_id: categoryId,
      author_id: authorId,
      status,
    };

    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/blog" : `/api/blog/${initial?.id}`;
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
        toast.error(data.message || "文章儲存失敗");
        return;
      }

      toast.success(data.message || "文章已儲存");
      onSuccess?.(data.post);
    } catch {
      toast.error("網路連線失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit("draft");
      }}
      className="space-y-6"
    >
      <Toaster position="top-center" />

      {mode === "edit" && initial?.status === "published" ? (
        <p className="rounded-[12px] bg-amber-50 px-4 py-3 text-sm text-amber-800">
          此文章已上架；儲存草稿或送出審查都會另存版本，公開頁將持續顯示目前版本。
        </p>
      ) : null}

      {/* 標題會自動產生別名，使用者不可直接編輯。 */}
      <div>
        <label htmlFor="blog-title" className={labelClass}>
          文章標題 <span className="text-red-500">*</span>
        </label>
        <input
          id="blog-title"
          type="text"
          className={fieldClass}
          value={title}
          onChange={(event) =>
            setTitle(event.target.value.slice(0, BLOG_TITLE_MAX))
          }
          maxLength={BLOG_TITLE_MAX}
          required
        />
        <p className="mt-1 text-xs text-gray-400">
          別名將依文章標題自動建立：{slugifyTitle(title)}
        </p>
      </div>

      <div>
        <label htmlFor="blog-excerpt" className={labelClass}>
          摘要
        </label>
        <textarea
          id="blog-excerpt"
          className="min-h-24 w-full resize-y rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#45cad5] focus:ring-2 focus:ring-[#45cad5]/20"
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          maxLength={200}
        />
      </div>

      {/* 分類與地區選項從 JSON 對照資料以 map 產生。 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
            onChange={(event) => setAuthorId(Number(event.target.value) || 1)}
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
            onChange={(event) => setCategoryId(Number(event.target.value))}
          >
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
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
            onChange={(event) => setRegion(event.target.value)}
          >
            {BLOG_REGIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 頂圖可由上傳或網址設定；封面圖會自動使用同一張頂圖。 */}
      <div className="space-y-3 rounded-[12px] border border-gray-200 p-4">
        <div>
          <p className={labelClass}>內文頂圖／封面縮圖</p>
          <p className="text-xs text-gray-400">
            上傳後會在儲存文章時寫入 public/posts；封面會沿用這張圖片。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-[12px] file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700"
          />
          <input
            id="blog-content-image"
            type="url"
            className={fieldClass}
            value={contentImage}
            onChange={(event) => setContentImage(event.target.value)}
            placeholder="https://example.com/cover.jpg"
          />
        </div>
      </div>

      {/* 頁首的預覽文章連結會開啟完整文章頁預覽模式。 */}
      <div>
        <label className={labelClass}>
          文章內容 <span className="text-red-500">*</span>
        </label>
        <CKEditorWrapper data={content} onChange={setContent} />
      </div>

      {/* 儲存僅建立草稿；送出才會進入待審查佇列。 */}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[12px] border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          儲存草稿
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleSubmit("pending_review")}
          className="rounded-[12px] bg-[#45cad5] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#36b3be] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        >
          送出審查
        </button>
      </div>
    </form>
  );
}
