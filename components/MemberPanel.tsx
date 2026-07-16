"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import {
  FaUser,
  FaAward,
  FaBagShopping,
  FaTicket,
  FaCommentDots,
  FaHeart,
  FaClockRotateLeft,
  FaCamera,
  FaXmark,
} from "react-icons/fa6";

type MemberList = {
  label: string;
  icon: ReactNode;
  href: string;
};

const memberLists: MemberList[] = [
  {
    label: "會員資料",
    icon: <FaUser />,
    href: "/member/profile",
  },
  {
    label: "會員等級",
    icon: <FaAward />,
    href: "/member/level",
  },
  {
    label: "我的訂單",
    icon: <FaBagShopping />,
    href: "/member/order",
  },
  {
    label: "我的優惠",
    icon: <FaTicket />,
    href: "/member/coupon",
  },
  {
    label: "我的評價",
    icon: <FaCommentDots />,
    href: "/member/review",
  },
  {
    label: "心願清單",
    icon: <FaHeart />,
    href: "/member/favorites",
  },
  {
    label: "最近瀏覽",
    icon: <FaClockRotateLeft />,
    href: "/member/recently-viewed",
  },
];

type MemberPanelProps = {
  /**
   * 裁切完成後的圖片檔案。
   *
   * 如果你還沒有後端 API，可以先不傳這個 props。
   * 這樣圖片會先顯示在畫面上，但重新整理後會消失。
   */
  onAvatarChange?: (file: File) => Promise<void> | void;
};

// 把圖片網址轉成可以上傳的 File
function createCroppedImage(
  imageSrc: string,
  crop: Area,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    // 圖片載入完成後才開始裁切
    image.onload = () => {
      // 建立一個看不見的畫布
      const canvas = document.createElement("canvas");

      // 大頭貼輸出成 500 x 500 的正方形
      canvas.width = 500;
      canvas.height = 500;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("瀏覽器不支援 Canvas"));
        return;
      }

      // 把裁切範圍內的圖片畫到畫布上
      context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        500,
        500,
      );

      // 把畫布轉成 JPEG 圖片
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("圖片裁切失敗"));
            return;
          }

          // 將 Blob 包成可以上傳的 File
          const file = new File(
            [blob],
            "avatar.jpg",
            {
              type: "image/jpeg",
            },
          );

          resolve(file);
        },
        "image/jpeg",
        0.9,
      );
    };

    // 圖片載入失敗時顯示錯誤
    image.onerror = () => {
      reject(new Error("圖片載入失敗"));
    };

    image.src = imageSrc;
  });
}

export default function MemberPanel({
  onAvatarChange,
}: MemberPanelProps) {
  const pathname = usePathname();

  // 控制隱藏的檔案選擇器
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 目前顯示的大頭貼
  const [avatarUrl, setAvatarUrl] = useState(
    "/images/avatar-test.png",
  );

  // 被選取、但尚未裁切的圖片
  const [selectedImage, setSelectedImage] = useState<
    string | null
  >(null);

  // 裁切框的位置
  const [crop, setCrop] = useState<Point>({
    x: 0,
    y: 0,
  });

  // 圖片縮放倍率
  const [zoom, setZoom] = useState(1);

  // 裁切完成後的實際像素範圍
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null);

  // 控制是否正在儲存
  const [isSaving, setIsSaving] = useState(false);

  // 顯示錯誤訊息
  const [errorMessage, setErrorMessage] = useState("");

  // 按下相機按鈕，打開檔案選擇器
  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  // 使用者選擇圖片後執行
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // 只接受圖片
    if (!file.type.startsWith("image/")) {
      setErrorMessage("請選擇圖片檔案");
      return;
    }

    // 避免使用者上傳過大的圖片
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("圖片大小不能超過 5MB");
      return;
    }

    setErrorMessage("");

    // 把圖片檔案轉成瀏覽器暫時可以讀取的網址
    const imageUrl = URL.createObjectURL(file);

    // 顯示裁切視窗
    setSelectedImage(imageUrl);

    // 每次選新圖片時，重設裁切位置與縮放比例
    setCrop({ x: 0, y: 0 });
    setZoom(1);

    // 讓同一張圖片重新選取時，也能觸發 change
    event.target.value = "";
  };

  // react-easy-crop 每次裁切框改變時會執行
  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  // 按下「取消」
  const handleCancel = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }

    setSelectedImage(null);
    setCroppedAreaPixels(null);
    setErrorMessage("");
  };

  // 按下「使用這張圖片」
  const handleSave = async () => {
    if (!selectedImage || !croppedAreaPixels) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      // 產生裁切後的圖片 File
      const croppedFile = await createCroppedImage(
        selectedImage,
        croppedAreaPixels,
      );

      // 先立即在畫面上顯示裁切後的圖片
      const newAvatarUrl = URL.createObjectURL(croppedFile);
      setAvatarUrl(newAvatarUrl);

      // 如果外層有傳入 API 函式，就把圖片交給外層上傳
      if (onAvatarChange) {
        await onAvatarChange(croppedFile);
      }

      // 關閉裁切視窗
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("圖片處理失敗，請重新嘗試");
    } finally {
      setIsSaving(false);
    }
  };

  // 元件被移除時，釋放暫時圖片網址
  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  return (
    <>
      <aside className="min-h-screen w-full overflow-hidden bg-white md:min-h-0 md:w-[340px] md:rounded-xl md:border md:border-zinc-200 md:shadow-xl">
        {/* 會員頭像區 */}
        <div className="flex flex-col items-center px-6 pt-10 pb-8">
          <div className="relative">
            <img
              src={avatarUrl}
              alt="會員頭像"
              className="h-[105px] w-[105px] rounded-full object-cover"
            />

            <button
              type="button"
              aria-label="更換會員頭像"
              onClick={handleOpenFilePicker}
              className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:scale-105 hover:bg-zinc-100"
            >
              <FaCamera className="text-sm" />
            </button>

            {/* 真正的檔案選擇器隱藏起來，由相機按鈕觸發 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <h4 className="mt-4 ">王大明</h4>

          {errorMessage && (
            <p className="mt-3 text-sm text-red-500">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="h-px bg-zinc-200" />

        {/* 會員功能選單 */}
        <nav>
          {memberLists.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-[64px] items-center gap-4 border-b border-zinc-200 px-8 text-[18px] transition hover:bg-zinc-50 ${
                  isActive
                    ? "text-[#68BBC3]"
                    : "text-[#ACACAC]"
                }`}
              >
                <span className="flex w-6 items-center justify-center text-xl">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 裁切視窗 */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* 標題列 */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <h5>裁切大頭貼</h5>

              <button
                type="button"
                aria-label="關閉裁切視窗"
                onClick={handleCancel}
                className="text-xl text-zinc-500 hover:text-zinc-900"
              >
                <FaXmark />
              </button>
            </div>

            {/* Cropper 必須放在 relative 容器裡 */}
            <div className="relative h-[360px] w-full bg-zinc-950">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            {/* 縮放控制 */}
            <div className="px-6 pt-5">
              <label
                htmlFor="avatar-zoom"
                className="mb-2 block text-sm text-zinc-600"
              >
                放大圖片
              </label>

              <input
                id="avatar-zoom"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) =>
                  setZoom(Number(event.target.value))
                }
                className="w-full accent-[#68BBC3]"
              />
            </div>

            {/* 按鈕 */}
            <div className="flex justify-end gap-3 px-6 py-5">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-zinc-300 px-5 py-2 text-zinc-700 hover:bg-zinc-100"
              >
                取消
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="rounded-lg bg-[#68BBC3] px-5 py-2 text-white hover:bg-[#53aab2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "處理中..." : "使用這張圖片"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}