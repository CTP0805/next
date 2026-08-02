"use client";

/**
 * 會員評價頁：以條列方式顯示已付款的訂單明細，並在單筆明細下方展開評價表單。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import toast from "react-hot-toast";
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiStar,
} from "react-icons/hi";
import { z } from "zod";
import { getApiServer } from "@/config/api-path";

const reviewImageSchema = z.object({
  id: z.coerce.number(),
  image_url: z.string(),
  sort_order: z.coerce.number(),
});

const reviewSchema = z.object({
  id: z.coerce.number(),
  rating: z.coerce.number(),
  comment: z.string(),
  images: z.array(reviewImageSchema),
  created_at: z.string().nullable(),
});

const orderItemSchema = z.object({
  id: z.coerce.number(),
  experience_id: z.coerce.number(),
  title: z.string(),
  city: z.string().nullable(),
  quantity: z.coerce.number(),
  subtotal: z.coerce.number(),
  item_status: z.string(),
  session_start: z.string().nullable(),
  image_url: z.string().nullable(),
  has_review: z.boolean(),
  review: reviewSchema.nullable(),
});

const memberOrderSchema = z.object({
  id: z.string(),
  order_status: z.string(),
  payment_label: z.string(),
  created_at: z.string().nullable(),
  items: z.array(orderItemSchema),
});

const ordersResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z
    .object({
      orders: z.array(memberOrderSchema),
    })
    .optional(),
});

const actionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  path: z.string().optional(),
});

type MemberOrder = z.infer<typeof memberOrderSchema>;
type OrderItem = z.infer<typeof orderItemSchema>;
type ReviewTab = "pending" | "completed";
type ReviewPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type CropJob = {
  id: string;
  file: File;
};

interface ReviewEntry {
  order: MemberOrder;
  item: OrderItem;
}

const REVIEW_IMAGE_ASPECT = 4 / 3;
const REVIEW_IMAGE_WIDTH = 1200;
const REVIEW_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024;

function formatDate(value: string | null): string {
  if (!value) return "未提供";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("zh-TW");
}

function resolveImageUrl(path: string | null): string {
  if (!path) return "/images/experiences/bastille-market.jpg";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  if (path.startsWith("/images/")) return path;
  return `${getApiServer()}${path.startsWith("/") ? path : `/${path}`}`;
}

function getMessage(payload: unknown, fallback: string): string {
  const parsed = actionResponseSchema.safeParse(payload);
  return parsed.success ? parsed.data.message || fallback : fallback;
}

async function fetchMemberOrders(): Promise<MemberOrder[]> {
  const response = await fetch(`${getApiServer()}/api/member-order`, {
    credentials: "include",
  });
  const payload: unknown = await response.json();
  const parsed = ordersResponseSchema.safeParse(payload);

  if (!response.ok || !parsed.success || !parsed.data.success) {
    throw new Error(
      parsed.success
        ? parsed.data.message || "無法取得評價訂單"
        : "訂單資料格式不正確",
    );
  }

  return parsed.data.data?.orders ?? [];
}

async function createCroppedReviewFile(
  imageSrc: string,
  croppedArea: Area,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = REVIEW_IMAGE_WIDTH;
      canvas.height = Math.round(REVIEW_IMAGE_WIDTH / REVIEW_IMAGE_ASPECT);
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("瀏覽器不支援圖片裁切"));
        return;
      }

      context.drawImage(
        image,
        croppedArea.x,
        croppedArea.y,
        croppedArea.width,
        croppedArea.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("圖片裁切失敗"));
            return;
          }

          resolve(
            new File([blob], `review-${Date.now()}.jpg`, {
              type: "image/jpeg",
            }),
          );
        },
        "image/jpeg",
        0.9,
      );
    };
    image.onerror = () => reject(new Error("圖片載入失敗"));
    image.src = imageSrc;
  });
}

export default function ReviewPage() {
  const [orders, setOrders] = useState<MemberOrder[]>([]);
  const [activeTab, setActiveTab] = useState<ReviewTab>("pending");
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState<ReviewPhoto[]>([]);
  const [cropQueue, setCropQueue] = useState<CropJob[]>([]);
  const [activeCropJob, setActiveCropJob] = useState<CropJob | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applyingCrop, setApplyingCrop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const handledQueryRef = useRef(false);

  const applyOrders = useCallback((nextOrders: MemberOrder[]) => {
    setOrders(nextOrders);

    if (!handledQueryRef.current) {
      handledQueryRef.current = true;
      const experienceId = Number(
        new URLSearchParams(window.location.search).get("id"),
      );
      const matchingItem = nextOrders
        .flatMap((order) => (order.order_status === "paid" ? order.items : []))
        .find(
          (item) =>
            item.experience_id === experienceId &&
            item.item_status !== "cancelled" &&
            !item.has_review,
        );

      if (matchingItem) {
        setExpandedItemId(matchingItem.id);
      }
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoadError("");

    try {
      const nextOrders = await fetchMemberOrders();
      applyOrders(nextOrders);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "無法取得評價訂單");
    } finally {
      setLoading(false);
    }
  }, [applyOrders]);

  useEffect(() => {
    let cancelled = false;

    void fetchMemberOrders()
      .then((nextOrders) => {
        if (!cancelled) applyOrders(nextOrders);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "無法取得評價訂單",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applyOrders]);

  useEffect(
    () => () => {
      if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    },
    [cropSourceUrl],
  );

  useEffect(() => {
    if (activeCropJob || cropQueue.length === 0) return;

    const [nextJob, ...remainingJobs] = cropQueue;

    setCropQueue(remainingJobs);
    setActiveCropJob(nextJob);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropSourceUrl(URL.createObjectURL(nextJob.file));
  }, [activeCropJob, cropQueue]);

  const entries = useMemo<ReviewEntry[]>(
    () =>
      orders.flatMap((order) =>
        order.order_status === "paid"
          ? order.items
              .filter((item) => item.item_status !== "cancelled")
              .map((item) => ({ order, item }))
          : [],
      ),
    [orders],
  );

  const pendingEntries = entries.filter((entry) => !entry.item.has_review);
  const completedEntries = entries.filter((entry) => entry.item.has_review);
  const visibleEntries =
    activeTab === "pending" ? pendingEntries : completedEntries;

  function clearSelectedImage() {
    reviewPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));

    setReviewPhotos([]);
    setCropQueue([]);
    setActiveCropJob(null);
    setCropSourceUrl(null);
    setCroppedAreaPixels(null);
  }

  function resetReviewForm() {
    setRating(5);
    setComment("");
    clearSelectedImage();
  }

  function toggleReview(itemId: number) {
    if (expandedItemId === itemId) {
      setExpandedItemId(null);
      resetReviewForm();
      return;
    }

    setExpandedItemId(itemId);
    resetReviewForm();
  }

  function handleSelectedImages(files: FileList | null) {
    if (!files) return;

    const selectedFiles = Array.from(files);
    const availableCount =
      6 - reviewPhotos.length - cropQueue.length - (activeCropJob ? 1 : 0);

    if (availableCount <= 0) {
      toast.error("最多可選擇 6 張圖片");
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      if (!REVIEW_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} 格式不支援`);
        return false;
      }

      if (file.size > MAX_REVIEW_IMAGE_SIZE) {
        toast.error(`${file.name} 超過 5MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length > availableCount) {
      toast.error(`最多可選擇 6 張圖片，這次只加入前 ${availableCount} 張`);
    }

    setCropQueue((current) => [
      ...current,
      ...validFiles.slice(0, availableCount).map((file) => ({
        id: crypto.randomUUID(),
        file,
      })),
    ]);
  }

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    [],
  );

  async function applyImageCrop() {
    if (!cropSourceUrl || !croppedAreaPixels) return;

    setApplyingCrop(true);
    try {
      const croppedFile = await createCroppedReviewFile(
        cropSourceUrl,
        croppedAreaPixels,
      );
      if (croppedFile.size > MAX_REVIEW_IMAGE_SIZE) {
        throw new Error("裁切後圖片仍超過 5MB，請改選較小的圖片");
      }

      if (!activeCropJob) return;

      setReviewPhotos((current) => [
        ...current,
        {
          id: activeCropJob.id,
          file: croppedFile,
          previewUrl: URL.createObjectURL(croppedFile),
        },
      ]);

      setActiveCropJob(null);
      setCropSourceUrl(null);
      toast.success("已套用圖片裁切");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "圖片裁切失敗");
    } finally {
      setApplyingCrop(false);
    }
  }

  async function uploadReviewImages(): Promise<string[]> {
    const paths: string[] = [];

    for (const photo of reviewPhotos) {
      const formData = new FormData();
      formData.append("image", photo.file);

      const response = await fetch(
        `${getApiServer()}/api/member-order/review-image`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const payload: unknown = await response.json();
      const parsed = actionResponseSchema.safeParse(payload);

      if (!response.ok || !parsed.success || !parsed.data.success) {
        throw new Error(getMessage(payload, "評價圖片上傳失敗"));
      }

      if (!parsed.data.path) {
        throw new Error("上傳成功但未取得圖片路徑");
      }

      paths.push(parsed.data.path);
    }

    return paths;
  }

  async function submitReview(itemId: number) {
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      toast.error("請填寫留言內容");
      return;
    }
    if (trimmedComment.length > 300) {
      toast.error("留言最多 300 字");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls = await uploadReviewImages();
      const response = await fetch(
        `${getApiServer()}/api/member-order/items/${itemId}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            rating,
            comment: trimmedComment,
            image_urls: imageUrls,
          }),
        },
      );
      const payload: unknown = await response.json();
      const parsed = actionResponseSchema.safeParse(payload);

      if (!response.ok || !parsed.success || !parsed.data.success) {
        throw new Error(getMessage(payload, "送出評價失敗"));
      }

      toast.success(parsed.data.message || "評價已送出");
      setExpandedItemId(null);
      resetReviewForm();
      await loadOrders();
      setActiveTab("completed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "送出評價失敗");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full text-gray-800">
      <div className="border-b border-[#d9d9d9]">
        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => {
              setActiveTab("pending");
              setExpandedItemId(null);
              resetReviewForm();
            }}
            className={`px-3 pb-3 text-[18px] ${
              activeTab === "pending"
                ? "border-b border-[#7fc4cf] text-[#6fb8c4]"
                : "text-[#d4d4d4]"
            }`}
          >
            待評價（{pendingEntries.length}）
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("completed");
              setExpandedItemId(null);
              resetReviewForm();
            }}
            className={`px-3 pb-3 text-[18px] ${
              activeTab === "completed"
                ? "border-b border-[#7fc4cf] text-[#6fb8c4]"
                : "text-[#d4d4d4]"
            }`}
          >
            已評價（{completedEntries.length}）
          </button>
        </div>
      </div>

      <p className="mt-6 mb-4 text-sm text-gray-500">
        選擇訂單後展開留言板，分享你的旅遊體驗。
      </p>

      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400">
          載入訂單中…
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="text-sm text-red-600">{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadOrders();
            }}
            className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            重新載入
          </button>
        </div>
      ) : visibleEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-sm font-medium text-gray-500">
            {activeTab === "pending"
              ? "目前沒有待評價的已付款訂單"
              : "目前還沒有已完成的評價"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {visibleEntries.map(({ order, item }, index) => {
            const isExpanded = expandedItemId === item.id;
            const imageUrl = resolveImageUrl(item.image_url);

            return (
              <article
                key={`${order.id}-${item.id}`}
                className={index > 0 ? "border-t border-gray-200" : ""}
              >
                <div
                  role={activeTab === "completed" ? "button" : undefined}
                  tabIndex={activeTab === "completed" ? 0 : undefined}
                  aria-expanded={
                    activeTab === "completed" ? isExpanded : undefined
                  }
                  aria-controls={
                    activeTab === "completed"
                      ? `completed-review-${item.id}`
                      : undefined
                  }
                  onClick={
                    activeTab === "completed"
                      ? () => toggleReview(item.id)
                      : undefined
                  }
                  onKeyDown={(event) => {
                    if (
                      activeTab === "completed" &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      toggleReview(item.id);
                    }
                  }}
                  className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5 ${
                    activeTab === "completed"
                      ? "cursor-pointer transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#45cad5]"
                      : ""
                  }`}
                >
                  <div
                    role="img"
                    aria-label={item.title}
                    className="h-24 w-full shrink-0 rounded-lg bg-gray-100 bg-cover bg-center sm:h-20 sm:w-28"
                    style={{ backgroundImage: `url("${imageUrl}")` }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="truncate font-bold text-gray-900">
                        {item.title}
                      </h5>
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                        已付款
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>訂單：{order.id}</span>
                      <span>體驗日期：{formatDate(item.session_start)}</span>
                      <span>數量：{item.quantity}</span>
                      <span>
                        NT$ {Number(item.subtotal).toLocaleString("zh-TW")}
                      </span>
                    </div>
                  </div>

                  {activeTab === "pending" ? (
                    <button
                      type="button"
                      onClick={() => toggleReview(item.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`review-form-${item.id}`}
                      className="button-main flex shrink-0 items-center gap-2 sm:gap-3"
                    >
                      {isExpanded ? "收合留言板" : "撰寫評價"}
                      {isExpanded ? (
                        <HiOutlineChevronUp className="size-4" />
                      ) : (
                        <HiOutlineChevronDown className="size-4" />
                      )}
                    </button>
                  ) : (
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="flex items-center gap-1 text-sm font-bold text-[#FFA938]">
                        <HiStar className="size-5" />
                        {item.review?.rating ?? 0}
                      </div>
                      {isExpanded ? (
                        <HiOutlineChevronUp className="size-4 text-gray-400" />
                      ) : (
                        <HiOutlineChevronDown className="size-4 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {activeTab === "pending" && isExpanded ? (
                  <div
                    id={`review-form-${item.id}`}
                    className="border-t border-gray-100 bg-gray-50/80 p-4 sm:p-6"
                  >
                    <div className="mb-5">
                      <span className="mb-2 block text-sm font-semibold text-gray-700">
                        體驗評分
                      </span>
                      <div
                        className="flex gap-1"
                        role="radiogroup"
                        aria-label="體驗評分"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={rating === value}
                            aria-label={`${value} 星`}
                            onClick={() => setRating(value)}
                            className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#45cad5]"
                          >
                            <HiStar
                              className={`size-7 ${
                                value <= rating
                                  ? "text-[#FFA938]"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <label
                      htmlFor={`review-comment-${item.id}`}
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      留言內容
                    </label>
                    <textarea
                      id={`review-comment-${item.id}`}
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      maxLength={300}
                      rows={4}
                      placeholder="寫下這次旅遊體驗的心得…"
                      className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 transition outline-none placeholder:text-gray-400 focus:border-[#45cad5] focus:ring-2 focus:ring-[#45cad5]/20"
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">
                      {comment.length}/300
                    </p>

                    <div className="mt-4">
                      <span className="mb-2 block text-sm font-semibold text-gray-700">
                        附加照片（選填，最多 6 張，每張 5MB）
                      </span>

                      {reviewPhotos.length > 0 && (
                        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {reviewPhotos.map((photo, index) => (
                            <div
                              key={photo.id}
                              className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
                            >
                              <div
                                role="img"
                                aria-label={`第 ${index + 1} 張評價圖片`}
                                className="aspect-[4/3] bg-gray-100 bg-cover bg-center"
                                style={{
                                  backgroundImage: `url("${photo.previewUrl}")`,
                                }}
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  URL.revokeObjectURL(photo.previewUrl);
                                  setReviewPhotos((current) =>
                                    current.filter(
                                      (item) => item.id !== photo.id,
                                    ),
                                  );
                                }}
                                className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white hover:bg-black/80"
                              >
                                移除
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <label
                        htmlFor={`review-image-${item.id}`}
                        className={`flex items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-sm font-semibold transition ${
                          reviewPhotos.length >= 6
                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                            : "cursor-pointer border-gray-300 bg-white text-gray-500 hover:border-[#45cad5] hover:bg-teal-50 hover:text-teal-700"
                        }`}
                      >
                        {reviewPhotos.length >= 6
                          ? "已達 6 張上限"
                          : `選擇圖片並依序裁切（${reviewPhotos.length}/6）`}
                      </label>

                      <input
                        id={`review-image-${item.id}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={reviewPhotos.length >= 6}
                        onChange={(event) => {
                          handleSelectedImages(event.target.files);
                          event.currentTarget.value = "";
                        }}
                        className="sr-only"
                      />
                    </div>

                    <div className="mt-5 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedItemId(null);
                          resetReviewForm();
                        }}
                        disabled={submitting}
                        className="button-white"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={() => void submitReview(item.id)}
                        disabled={submitting || !comment.trim()}
                        className="button-main"
                      >
                        {submitting ? "送出中…" : "送出評價"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {activeTab === "completed" && item.review && isExpanded ? (
                  <div
                    id={`completed-review-${item.id}`}
                    className="border-t border-gray-100 bg-gray-50/80 px-4 py-4 sm:px-6"
                  >
                    {item.review.images.length > 0 ? (
                      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {item.review.images.map((image) => (
                          <div
                            key={image.id}
                            role="img"
                            aria-label={`${item.title}的評論圖片`}
                            className="aspect-[4/3] rounded-xl bg-gray-100 bg-cover bg-center"
                            style={{
                              backgroundImage: `url("${resolveImageUrl(image.image_url)}")`,
                            }}
                          />
                        ))}
                      </div>
                    ) : null}
                    <p className="text-sm leading-6 text-gray-700">
                      {item.review.comment}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      評價於 {formatDate(item.review.created_at)}
                    </p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {cropSourceUrl ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-crop-title"
        >
          <section className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 id="review-crop-title" className="font-bold text-gray-900">
                預覽並裁切評價圖片
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                拖曳圖片調整位置，使用滑桿縮放，裁切比例固定為 4:3。
              </p>
            </div>

            <div className="relative h-[min(56vh,420px)] w-full bg-zinc-950">
              <Cropper
                image={cropSourceUrl}
                crop={crop}
                zoom={zoom}
                aspect={REVIEW_IMAGE_ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                objectFit="horizontal-cover"
              />
            </div>

            <div className="space-y-4 px-5 py-4">
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <span className="shrink-0 font-medium">縮放</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full accent-[#45cad5]"
                />
              </label>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCropJob(null);
                    setCropSourceUrl(null);
                  }}
                  disabled={applyingCrop}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void applyImageCrop()}
                  disabled={applyingCrop || !croppedAreaPixels}
                  className="rounded-lg bg-[#45cad5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#36b3be] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {applyingCrop ? "裁切中…" : "套用裁切"}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
