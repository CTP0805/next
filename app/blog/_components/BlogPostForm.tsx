"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  createBlogPost,
  fetchEligibleOrders,
  updateBlogPost,
  uploadBlogImage,
} from "../_lib/api";
import { persistContentImagesInHtml } from "../_lib/content-images";
import { resolveBlogMediaUrl, rewriteBlogContentMedia } from "../_lib/media";
import type {
  BlogEligibleOrder,
  BlogPost,
  BlogPostInput,
  BlogPostStatus,
} from "../_lib/types";
import { BLOG_TITLE_MAX, slugifyTitle } from "../_lib/types";
import BlogCoverCropDialog from "./BlogCoverCropDialog";
import BlogRichTextContent from "./BlogRichTextContent";

const CKEditorWrapper = dynamic(() => import("@/components/CKEditorWrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center rounded-[12px] border border-gray-200 bg-gray-50 text-sm text-gray-400">
      載入編輯器中…
    </div>
  ),
});

export interface BlogPostFormProps {
  mode: "create" | "edit";
  initial?: BlogPost;
  onSuccess?: (post: BlogPost) => void;
  /**
   * member：嵌在會員中心框內（不重複 Toaster 可選）
   * standalone：部落格獨立頁
   */
  variant?: "member" | "standalone";
  /** 嵌在會員中心時不渲染第二個 Toaster */
  hideToaster?: boolean;
}

const fieldClass =
  "h-12 w-full rounded-[12px] border border-gray-200 bg-white px-4 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#45cad5] focus:ring-2 focus:ring-[#45cad5]/20";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
];

/** 判斷 CKEditor 是否只有空段落 */
function hasMeaningfulContent(html: string): boolean {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}

/**
 * =============================================================================
 * 【新手導讀】文章編輯表單（Blog 最重要的寫入 UI）
 * =============================================================================
 * 掛在哪：
 *   - /blog/new、/blog/[slug]/edit
 *   - /member/edit-post（會員中心內嵌）
 * 做什麼：
 *   填標題／摘要／封面／選訂單／CKEditor 內文
 *   按「草稿」或「送出審查」→ createBlogPost / updateBlogPost
 * 封面流程：選檔 → BlogCoverCropDialog 裁切 → 送審時 uploadBlogImage
 * 內文圖片：persistContentImagesInHtml（base64 → 上傳）
 * =============================================================================
 */
export default function BlogPostForm({
  mode,
  initial,
  onSuccess,
  variant = "standalone",
  hideToaster = false,
}: BlogPostFormProps) {
  const { auth, isAuthenticated, authInit } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [savedImageRef, setSavedImageRef] = useState(
    initial?.content_image ?? initial?.cover_image ?? "",
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>("");
  /** 裁切用：原始本機圖 object URL */
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  /** ⭐ 分類改為訂單名稱（create 可選；edit 鎖定） */
  const [orderId, setOrderId] = useState(initial?.order_id ?? "");
  const [orderTitle, setOrderTitle] = useState(initial?.order_title ?? "");
  const [eligibleOrders, setEligibleOrders] = useState<BlogEligibleOrder[]>(
    [],
  );
  const [ordersLoading, setOrdersLoading] = useState(mode === "create");
  // DB 內文圖片存成 /uploads/blog/...；載入 CKEditor 前必須接上 Express
  // 網域，否則瀏覽器會錯向 Next.js :3000 請求而顯示白色區塊。
  const [content, setContent] = useState(() =>
    rewriteBlogContentMedia(initial?.content ?? ""),
  );
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    return () => {
      if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    };
  }, [cropSourceUrl]);

  useEffect(() => {
    if (mode !== "create" || !authInit || !isAuthenticated) {
      const timeoutId = window.setTimeout(
        () => setOrdersLoading(false),
        0,
      );
      return () => window.clearTimeout(timeoutId);
    }
    let cancelled = false;
    (async () => {
      setOrdersLoading(true);
      try {
        const list = await fetchEligibleOrders();
        if (!cancelled) setEligibleOrders(list);
      } catch (e) {
        if (!cancelled) {
          setEligibleOrders([]);
          toast.error(
            e instanceof Error ? e.message : "無法載入可撰寫訂單",
          );
        }
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, authInit, isAuthenticated]);

  const selectedOrderLabel = useMemo(() => {
    if (mode === "edit") return orderTitle || orderId || "（未綁定訂單）";
    const found = eligibleOrders.find((o) => o.order_id === orderId);
    return found?.order_title ?? "";
  }, [mode, orderId, orderTitle, eligibleOrders]);

  const previewSrc = localPreviewUrl
    ? localPreviewUrl
    : savedImageRef.trim()
      ? resolveBlogMediaUrl(savedImageRef)
      : "";

  function revokeLocalPreview() {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl("");
  }

  function handleImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;

    if (!ACCEPT_TYPES.includes(image.type)) {
      toast.error("僅支援 PNG、JPG、WebP、GIF、AVIF");
      return;
    }
    if (image.size > MAX_IMAGE_BYTES) {
      toast.error("圖片不可超過 5MB");
      return;
    }

    // 進入裁切：先釋放上一張裁切來源
    if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    setCropSourceUrl(URL.createObjectURL(image));
  }

  function handleCropConfirm(file: File) {
    if (cropSourceUrl) {
      URL.revokeObjectURL(cropSourceUrl);
      setCropSourceUrl(null);
    }
    revokeLocalPreview();
    setLocalPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
    setSavedImageRef("");
    toast.success("封面已裁切預覽（送出審查時上傳）");
  }

  function handleCropCancel() {
    if (cropSourceUrl) {
      URL.revokeObjectURL(cropSourceUrl);
      setCropSourceUrl(null);
    }
  }

  function clearImage() {
    revokeLocalPreview();
    setPendingFile(null);
    setSavedImageRef("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleExternalUrlChange(value: string) {
    if (pendingFile || localPreviewUrl) {
      revokeLocalPreview();
      setPendingFile(null);
    }
    setSavedImageRef(value);
  }

  /**
   * 解析最終寫入 DB 的圖片路徑
   * - 草稿或送審 + 本機檔 → 先 upload，確保封面可重新載入
   * - 外連／已上傳路徑 → 直接使用
   */
  async function resolveImageForSubmit(): Promise<string | null> {
    if (pendingFile) {
      setUploading(true);
      try {
        const path = await uploadBlogImage(pendingFile);
        setSavedImageRef(path);
        revokeLocalPreview();
        setPendingFile(null);
        return path;
      } finally {
        setUploading(false);
      }
    }

    const ref = savedImageRef.trim();
    if (!ref) return null;
    if (ref.startsWith("data:") || ref.startsWith("blob:")) {
      throw new Error("封面請使用本機選圖或 https 網址");
    }
    return ref;
  }

  async function handleSubmit(status: BlogPostStatus) {
    if (!authInit) {
      toast.error("登入狀態確認中，請稍候再試");
      return;
    }
    if (!isAuthenticated) {
      toast.error("請先登入後再儲存文章");
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("請填寫文章標題");
      return;
    }
    if (trimmedTitle.length > BLOG_TITLE_MAX) {
      toast.error(`標題最多 ${BLOG_TITLE_MAX} 字`);
      return;
    }
    if (!hasMeaningfulContent(content)) {
      toast.error("請填寫文章內容");
      return;
    }

    if (mode === "create" && !orderId.trim()) {
      toast.error("請選擇訂單（作為文章分類，選定後不可改）");
      return;
    }

    setSubmitting(true);
    try {
      // 1) 內文 base64 圖 → 先上傳 Express public，再替成 /uploads/blog/...
      let contentToSave = content;
      if (contentToSave.includes("data:image")) {
        toast.loading("正在處理內文圖片…", { id: "blog-content-images" });
        contentToSave = await persistContentImagesInHtml(
          contentToSave,
          (done, total) => {
            toast.loading(`內文圖片上傳中 ${done}/${total}`, {
              id: "blog-content-images",
            });
          },
        );
        toast.success("內文圖片已轉成連結", { id: "blog-content-images" });
        // 同步回編輯器狀態，避免之後再送一次 base64
        setContent(contentToSave);
      }

      // 2) 封面本機檔（草稿與送審都上傳）
      const imageValue = await resolveImageForSubmit();

      const payload: BlogPostInput = {
        title: trimmedTitle.slice(0, BLOG_TITLE_MAX),
        slug: slugifyTitle(trimmedTitle),
        content: contentToSave,
        excerpt: excerpt.trim() || null,
        cover_image: imageValue,
        content_image: imageValue,
        order_id: mode === "create" ? orderId.trim() : undefined,
        author_id: auth.id,
        status,
      };

      const post =
        mode === "create"
          ? await createBlogPost(payload)
          : await updateBlogPost(initial!.id, payload);

      toast.success(
        status === "draft"
          ? "草稿、封面與內文圖片已儲存"
          : "已送出審查並寫入資料庫",
      );
      onSuccess?.(post);
    } catch (e) {
      toast.dismiss("blog-content-images");
      const msg = e instanceof Error ? e.message : "文章儲存失敗";
      toast.error(msg);
      console.error("[BlogPostForm] save failed:", e);
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || uploading;
  const hasPendingLocal = Boolean(pendingFile);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit("draft");
      }}
      className="space-y-6"
    >
      {!hideToaster ? <Toaster position="top-center" /> : null}

      {cropSourceUrl ? (
        <BlogCoverCropDialog
          open
          imageSrc={cropSourceUrl}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      ) : null}

      {!authInit ? (
        <p className="rounded-[12px] bg-slate-50 px-4 py-3 text-sm text-gray-500">
          正在確認登入狀態…
        </p>
      ) : !isAuthenticated ? (
        <p className="rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">
          尚未登入：儲存文章需要登入。請先到登入頁登入。
        </p>
      ) : variant === "standalone" ? (
        <p className="rounded-[12px] bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          已登入：{auth.name || auth.email}（ID {auth.id}）
        </p>
      ) : null}

      {mode === "edit" && initial?.status === "published" ? (
        <p className="rounded-[12px] bg-amber-50 px-4 py-3 text-sm text-amber-800">
          此文章已上架；修改後若「送出審查」將進入待審狀態。
        </p>
      ) : null}

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
          最多 {BLOG_TITLE_MAX} 字
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="blog-order" className={labelClass}>
            分類（訂單名稱） <span className="text-red-500">*</span>
          </label>
          {mode === "edit" ? (
            <input
              id="blog-order"
              type="text"
              className={fieldClass}
              value={selectedOrderLabel}
              disabled
              readOnly
            />
          ) : (
            <select
              id="blog-order"
              className={fieldClass}
              value={orderId}
              onChange={(event) => {
                const id = event.target.value;
                setOrderId(id);
                const found = eligibleOrders.find((o) => o.order_id === id);
                setOrderTitle(found?.order_title ?? "");
              }}
              disabled={ordersLoading || busy || !isAuthenticated}
              required
            >
              <option value="">
                {ordersLoading
                  ? "載入可撰寫訂單…"
                  : eligibleOrders.length === 0
                    ? "目前沒有可撰寫的已完成訂單"
                    : "請選擇訂單"}
              </option>
              {eligibleOrders.map((order) => (
                <option key={order.order_id} value={order.order_id}>
                  {order.order_title}（{order.order_id}）
                </option>
              ))}
            </select>
          )}
          <p className="mt-1 text-xs text-gray-400">
            僅已完成訂單且尚未撰寫的文章可選；選定後不可修改。
          </p>
        </div>
        <div>
          <label className={labelClass}>作者</label>
          <input
            type="text"
            className={fieldClass}
            value={
              isAuthenticated
                ? `${auth.name || "會員"}（ID ${auth.id} · ${auth.role ?? "會員"}）`
                : "未登入"
            }
            disabled
            readOnly
          />
        </div>
      </div>

      <div className="space-y-3 rounded-[12px] border border-gray-200 p-4">
        <p className={labelClass}>內文頂圖／封面縮圖</p>

        {previewSrc ? (
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[12px] bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="封面預覽"
              className="h-full w-full object-cover object-center"
            />
            {hasPendingLocal ? (
              <span className="absolute top-3 left-3 rounded-[12px] bg-amber-500/90 px-2.5 py-1 text-[11px] font-medium text-white shadow">
                已裁切 · 尚未上傳
              </span>
            ) : null}
            <button
              type="button"
              onClick={clearImage}
              disabled={busy}
              className="absolute top-3 right-3 rounded-[12px] bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/70 disabled:opacity-50"
            >
              移除圖片
            </button>
          </div>
        ) : (
          <div className="flex aspect-[21/9] w-full items-center justify-center rounded-[12px] border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
            尚未選擇圖片
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex h-12 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_TYPES.join(",")}
              onChange={handleImagePick}
              disabled={busy}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="rounded-full bg-[#68BBC3] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#53AAB2] focus:ring-4 focus:ring-[#68BBC3]/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              選擇圖片
            </button>
          </div>
          <input
            id="blog-content-image"
            type="text"
            className={fieldClass}
            value={hasPendingLocal ? "" : savedImageRef}
            onChange={(event) => handleExternalUrlChange(event.target.value)}
            placeholder={
              hasPendingLocal
                ? `預覽中：${pendingFile?.name ?? "本機檔案"}`
                : "或貼上 https://… 圖片網址"
            }
            disabled={busy || hasPendingLocal}
          />
        </div>
        {uploading ? (
          <p className="text-xs text-teal-600">正在上傳封面…</p>
        ) : hasPendingLocal ? (
          <p className="text-xs text-amber-600">
            本機預覽中；儲存草稿時會一併上傳並保留封面。
          </p>
        ) : savedImageRef.startsWith("/uploads/") ? (
          <p className="text-xs text-gray-400">已存伺服器：{savedImageRef}</p>
        ) : null}
      </div>

      <div>
        <label className={labelClass}>
          文章內容 <span className="text-red-500">*</span>
        </label>
        <CKEditorWrapper data={content} onChange={setContent} />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-6">
        <button
          type="submit"
          disabled={busy || !authInit || !isAuthenticated}
          className="button-white"
        >
          {submitting && !uploading ? "儲存中…" : "儲存草稿"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setPreviewOpen(true)}
          className="button-white"
        >
          預覽
        </button>
        <button
          type="button"
          disabled={busy || !authInit || !isAuthenticated}
          onClick={() => void handleSubmit("pending_review")}
          className="button-main"
        >
          {uploading ? "上傳封面中…" : "送出審查"}
        </button>
      </div>

      {previewOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="文章預覽"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewOpen(false);
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[12px] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <p className="font-semibold text-gray-900">文章預覽（尚未儲存）</p>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-[12px] px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
              >
                關閉
              </button>
            </div>
            <article className="px-5 py-8 sm:px-10">
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-[12px] bg-teal-50 px-3 py-1 text-teal-700">
                  {selectedOrderLabel || "尚未選擇分類"}
                </span>
                <span className="rounded-[12px] bg-gray-100 px-3 py-1 text-gray-600">
                  預覽
                </span>
              </div>
              <h1 className="mb-3 text-3xl font-bold text-gray-900">
                {title.trim() || "尚未填寫文章標題"}
              </h1>
              {excerpt.trim() ? (
                <p className="mb-6 text-gray-500">{excerpt.trim()}</p>
              ) : null}
              {previewSrc ? (
                <div className="mb-8 aspect-[21/9] overflow-hidden rounded-[12px] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc}
                    alt={title.trim() || "文章封面"}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              ) : null}
              <div className="max-w-none text-gray-800">
                {content ? (
                  <BlogRichTextContent content={content} />
                ) : (
                  <p className="text-gray-400">尚未填寫文章內容</p>
                )}
              </div>
            </article>
          </div>
        </div>
      ) : null}
    </form>
  );
}
