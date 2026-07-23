"use client";

/**
 * 訂單／評價共用：向下展開的填寫評論框 or 查看評論
 * - 圖片：本機上傳 + react-easy-crop 裁切後再上傳
 */
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { API_SERVER } from "@/config/api-path";
import type { MemberOrder, MemberOrderItem } from "./types";
import { formatDateTime, resolveMediaUrl } from "./utils";
import { submitOrderItemReview } from "./api";
import ImageCropDialog from "./ImageCropDialog";

function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={`text-2xl leading-none ${
            n <= value ? "text-yellow-400" : "text-gray-300"
          } ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          aria-label={`${n} 星`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export type ReviewExpandMode = "review-form" | "view-review";

interface ReviewExpandPanelProps {
  order: MemberOrder;
  mode: ReviewExpandMode;
  onClose: () => void;
  onOrderUpdated: (order: MemberOrder) => void;
  /** 送出後是否自動切到查看模式（由父層處理也可） */
  onSubmitted?: (order: MemberOrder) => void;
}

async function uploadReviewImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const response = await fetch(`${API_SERVER}/api/member-order/review-image`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    path?: string;
  };
  if (!response.ok || !result.success || !result.path) {
    throw new Error(result.message || "圖片上傳失敗");
  }
  return result.path;
}

export default function ReviewExpandPanel({
  order,
  mode,
  onClose,
  onOrderUpdated,
  onSubmitted,
}: ReviewExpandPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reviewable = order.items.filter(
    (it) =>
      order.order_status === "paid" &&
      it.item_status !== "cancelled" &&
      !it.has_review,
  );
  const reviewedItems = order.items.filter((it) => it.has_review);

  const [activeItemId, setActiveItemId] = useState<number | null>(() => {
    if (mode === "review-form") return reviewable[0]?.id ?? null;
    return reviewedItems[0]?.id ?? null;
  });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "review-form") {
      setActiveItemId(reviewable[0]?.id ?? null);
      setRating(5);
      setComment("");
      setImagePath(null);
      setLocalPreview(null);
    } else {
      setActiveItemId(reviewedItems[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 僅 mode / order.id 切換時重置
  }, [mode, order.id]);

  useEffect(() => {
    return () => {
      if (localPreview?.startsWith("blob:")) URL.revokeObjectURL(localPreview);
      if (cropSource) URL.revokeObjectURL(cropSource);
    };
  }, [localPreview, cropSource]);

  const viewingItem: MemberOrderItem | null =
    order.items.find((it) => it.id === activeItemId) ??
    reviewedItems[0] ??
    null;

  function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("僅支援 JPG、PNG、WebP、GIF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("圖片不可超過 5MB");
      return;
    }
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource(URL.createObjectURL(file));
  }

  async function handleCropConfirm(file: File) {
    if (cropSource) {
      URL.revokeObjectURL(cropSource);
      setCropSource(null);
    }
    setUploading(true);
    try {
      const path = await uploadReviewImage(file);
      setImagePath(path);
      if (localPreview?.startsWith("blob:")) URL.revokeObjectURL(localPreview);
      setLocalPreview(URL.createObjectURL(file));
      toast.success("照片已裁切並上傳");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上傳失敗");
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    if (localPreview?.startsWith("blob:")) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setImagePath(null);
  }

  async function handleSubmit() {
    const itemId = activeItemId ?? reviewable[0]?.id;
    if (itemId == null) {
      toast.error("找不到可評價的項目");
      return;
    }
    if (!comment.trim()) {
      toast.error("請填寫使用心得");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await submitOrderItemReview(itemId, {
        rating,
        comment: comment.trim(),
        image_url: imagePath,
      });
      onOrderUpdated(updated);
      toast.success("評價已送出，感謝您！");
      onSubmitted?.(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "送出失敗");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50/80 px-6 py-5">
      {cropSource ? (
        <ImageCropDialog
          open
          imageSrc={cropSource}
          aspect={1}
          title="調整評價照片"
          onCancel={() => {
            URL.revokeObjectURL(cropSource);
            setCropSource(null);
          }}
          onConfirm={(file) => void handleCropConfirm(file)}
        />
      ) : null}

      {mode === "review-form" ? (
        <div className="mx-auto max-w-xl space-y-4">
          <h5 className="text-sm font-bold text-gray-700">撰寫評價</h5>
          {reviewable.length > 1 ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                選擇項目
              </label>
              <select
                className="h-10 w-full rounded-[12px] border border-gray-200 bg-white px-3 text-sm"
                value={activeItemId ?? ""}
                onChange={(e) => setActiveItemId(Number(e.target.value))}
              >
                {reviewable.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              項目：{reviewable[0]?.title ?? order.title}
            </p>
          )}

          <div>
            <span className="mb-1 block text-xs font-bold text-gray-500">
              商品評分
            </span>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-500">
              使用心得
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 300))}
              placeholder="分享您的使用心得，描述旅遊體驗過程..."
              className="h-28 w-full resize-y rounded-[12px] border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#45cad5] focus:ring-2 focus:ring-[#45cad5]/20"
            />
            <p className="mt-1 text-right text-[11px] text-gray-400">
              {comment.length}/300
            </p>
          </div>

          <div>
            <span className="mb-1 block text-xs font-bold text-gray-500">
              上傳照片（可裁切）
            </span>
            {localPreview || imagePath ? (
              <div className="relative mb-2 h-28 w-28 overflow-hidden rounded-xl border bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    localPreview ||
                    resolveMediaUrl(imagePath)
                  }
                  alt="評價預覽"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
                >
                  移除
                </button>
              </div>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handlePickFile}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-400 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="text-xl">📷</span>
              <span className="text-[10px]">
                {uploading ? "上傳中…" : "選擇並裁切"}
              </span>
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[12px] border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-white"
            >
              取消
            </button>
            <button
              type="button"
              disabled={submitting || uploading}
              onClick={() => void handleSubmit()}
              className="rounded-[12px] bg-[#45cad5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#36b3be] disabled:opacity-50"
            >
              {submitting ? "送出中…" : "送出評價"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-xl space-y-3">
          <h5 className="text-sm font-bold text-gray-700">您的評價</h5>
          {reviewedItems.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {reviewedItems.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setActiveItemId(it.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    activeItemId === it.id
                      ? "bg-[#45cad5] text-white"
                      : "bg-white text-gray-600 ring-1 ring-gray-200"
                  }`}
                >
                  {it.title}
                </button>
              ))}
            </div>
          ) : null}
          {viewingItem?.review ? (
            <div className="rounded-[12px] border border-gray-100 bg-white p-4">
              <p className="mb-1 text-xs text-gray-400">{viewingItem.title}</p>
              <StarRating value={viewingItem.review.rating} readOnly />
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                {viewingItem.review.comment}
              </p>
              {viewingItem.review.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(viewingItem.review.image_url)}
                  alt="評價照片"
                  className="mt-3 max-h-48 rounded-lg object-cover"
                />
              ) : null}
              <p className="mt-2 text-[11px] text-gray-400">
                {formatDateTime(viewingItem.review.created_at)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">尚無評價內容</p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-500 underline"
          >
            收起
          </button>
        </div>
      )}
    </div>
  );
}
