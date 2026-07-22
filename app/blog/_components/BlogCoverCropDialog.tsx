"use client";

/**
 * =============================================================================
 * 【新手導讀】封面裁切對話框
 * =============================================================================
 * 用 react-easy-crop：使用者拖曳／縮放
 * 確認後 canvas 輸出 21:9 的 File，回傳給 BlogPostForm
 * =============================================================================
 */
import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

interface BlogCoverCropDialogProps {
  imageSrc: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

const OUTPUT_WIDTH = 1600;
const ASPECT = 21 / 9;

async function createCroppedCoverFile(
  imageSrc: string,
  crop: Area,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const outH = Math.round(OUTPUT_WIDTH / ASPECT);
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_WIDTH;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("瀏覽器不支援 Canvas"));
        return;
      }
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        OUTPUT_WIDTH,
        outH,
      );
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("圖片裁切失敗"));
            return;
          }
          resolve(
            new File([blob], `blog-cover-${Date.now()}.jpg`, {
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

export default function BlogCoverCropDialog({
  imageSrc,
  open,
  onCancel,
  onConfirm,
}: BlogCoverCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback(
    (_area: Area, pixels: Area) => {
      setCroppedAreaPixels(pixels);
    },
    [],
  );

  if (!open) return null;

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const file = await createCroppedCoverFile(imageSrc, croppedAreaPixels);
      onConfirm(file);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "裁切失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="裁切封面圖片"
    >
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[12px] bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-5 py-3">
          <h3 className="text-base font-bold text-gray-900">調整封面圖片</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            拖曳移動、拉動縮放，比例固定 21:9
          </p>
        </div>

        <div className="relative h-[min(52vh,360px)] w-full bg-zinc-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="horizontal-cover"
          />
        </div>

        <div className="space-y-3 px-5 py-4">
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <span className="w-10 shrink-0">縮放</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#45cad5]"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-[12px] border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={saving || !croppedAreaPixels}
              className="rounded-[12px] bg-[#45cad5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#36b3be] disabled:opacity-50"
            >
              {saving ? "處理中…" : "套用裁切"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
