"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import {
  FaAward,
  FaBagShopping,
  FaCamera,
  FaCloudArrowUp,
  FaCommentDots,
  FaHeart,
  FaClockRotateLeft,
  FaTicket,
  FaUser,
  FaXmark,
} from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { API_SERVER } from "@/config/api-path";
import toast from "react-hot-toast";
import { resumeToPipeableStream } from "react-dom/server";

interface MemberList {
  label: string;
  icon: ReactNode;
  href: string;
}



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
  {
    label: "管理文章",
    icon: <FaEdit />,
    href: "/member/edit-post",
  },

];

interface AvatarUploadResponse {
  success: boolean;
  message: string;
  data?: {
    avatarUrl: string;
  };
}

interface ProfileResponse {
  success: boolean;
  data?: {
    avatar_url: string | null;
  };
}

/**
 * 將裁切區域輸出為 500 x 500 的 JPEG File。
 * 這個 File 就是之後要傳給後端的圖片檔案。
 */
function createCroppedImage(imageSrc: string, crop: Area): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      // 大頭貼統一輸出成正方形，方便後端儲存與前端顯示
      canvas.width = 500;
      canvas.height = 500;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("瀏覽器不支援 Canvas"));
        return;
      }

      // 把使用者框選的圖片範圍畫到新的正方形畫布中
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

      // 將畫布轉成真正可上傳的 JPEG 圖片檔
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("圖片裁切失敗"));
            return;
          }

          resolve(
            new File([blob], "avatar.jpg", {
              type: "image/jpeg",
            }),
          );
        },
        "image/jpeg",
        0.9,
      );
    };

    image.onerror = () => {
      reject(new Error("圖片載入失敗"));
    };

    image.src = imageSrc;
  });
}

export default function MemberPanel() {
  const pathname = usePathname();

  // 真正的 input 檔案上傳框被隱藏 改用 fileInputRef 控制
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 目前顯示在會員面板上的頭像
  const [avatarUrl, setAvatarUrl] = useState(
    "/images/member-avatar/angry-man.jpg",
  );

  const [name, setName] = useState("");

  // 頁面剛開啟時，向後端拿資料庫已儲存的大頭貼
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const response = await fetch(`${API_SERVER}/api/member/profile`, {
          method: "GET",
          credentials: "include", // 讓瀏覽器帶上登入 Cookie
        });

        const result = (await response.json()) as ProfileResponse;

        setName(result.data.name);

        const absoluteUrl = result.data.avatar_url.trim();
        const isAbsoluteUrl = /^(?:https?:)?\/\//i.test(absoluteUrl);

        if (response.ok && result.success && result.data.avatar_url) {
          // 判斷是否為絕對路徑 是的話直接顯示 不是的話要加 API_SERVER
          // 資料庫儲存的是 /images/xxx.jpg，前面要補上 API_SERVER
          setAvatarUrl(isAbsoluteUrl? `${absoluteUrl}` : `${API_SERVER}${result.data.avatar_url}`);
        }
          
        
        
      } catch (error) {
        console.error("讀取大頭貼失敗：", error);
      }
    };

    void loadAvatar();
  }, []);

  // 使用者已選取、但尚未裁切完成的圖片
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 第一層：選檔／拖放圖片彈窗
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // 拖拉圖片進入上傳區塊時，顯示高亮效果
  const [isDragging, setIsDragging] = useState(false);

  // 裁切框位置
  const [crop, setCrop] = useState<Point>({
    x: 0,
    y: 0,
  });

  // 裁切圖片的縮放倍率
  const [zoom, setZoom] = useState(1);

  // react-easy-crop 算出的實際裁切像素範圍
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // 避免儲存時連續點擊按鈕
  const [isSaving, setIsSaving] = useState(false);

  // 顯示格式錯誤、檔案太大、裁切失敗等訊息
  // const [errorMessage, setErrorMessage] = useState("");

  // 點頭像右下角相機時，先開啟「選檔／拖放」彈窗
  const handleOpenUploadDialog = () => {
    // setErrorMessage("");
    setIsUploadDialogOpen(true);
  };

  // 點擊彈窗中的按鈕後，開啟電腦原生檔案選擇器，模擬真實點擊檔案上傳 input
  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  /**
   * 不管是「電腦選檔」或「拖放圖片」，最後都會走到這裡。
   * 所以檔案格式與大小只需要檢查一次。
   */
  const handleSelectedFile = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      // setErrorMessage("請選擇 JPG、PNG 或 WEBP 格式的圖片");
      toast.error("請選擇 JPG、PNG 或 WEBP 格式的圖片");
      return;
    }

    // 限制最大 2MB，避免圖片上傳太慢
    if (file.size > 2 * 1024 * 1024) {
      // setErrorMessage("圖片大小不可超過 2MB");
      toast.error("圖片大小不可超過 2MB");
      return;
    }

    // setErrorMessage("");

    // 建立暫時網址，讓裁切元件能先顯示本機圖片
    const imageUrl = URL.createObjectURL(file);

    // 關閉第一層選檔視窗，開啟第二層裁切視窗
    setIsUploadDialogOpen(false);
    setSelectedImage(imageUrl);

    // 每次選擇新圖片時，裁切框回到中間、縮放回到原始大小
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // 從電腦檔案選擇器選取圖片
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    handleSelectedFile(file);

    // 清空 input，使用者重新選同一張圖時仍能觸發 change
    event.target.value = "";
  };

  // 拖曳檔案經過區域時，阻止瀏覽器直接開啟圖片
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  // 游標離開拖拉區域時，取消高亮樣式
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // 使用者放開圖片時，取得檔案並進入裁切流程
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleSelectedFile(file);
    }
  };

  // 裁切框移動或縮放完成時，記錄最後的像素範圍
  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedArea: Area) => {
      setCroppedAreaPixels(croppedArea);
    },
    [],
  );

  // 關閉裁切彈窗，不更換頭像
  const handleCancelCrop = () => {
    setSelectedImage(null);
    setCroppedAreaPixels(null);
    // setErrorMessage("");
  };

  const handleSave = async () => {
    if (!selectedImage || !croppedAreaPixels) {
      return;
    }

    try {
      setIsSaving(true);
      // setErrorMessage("");

      // step1. 把裁切區域轉成真正的圖片檔案
      const croppedFile = await createCroppedImage(
        selectedImage,
        croppedAreaPixels,
      );

      // step2. FormData 是專門裝「文字 + 檔案」的包裹
      const formData = new FormData();

      // "avatar" 必須和後端 uploadImage.single("avatar") 一樣
      formData.append("avatar", croppedFile);

      // step3. 將圖片傳到 Express 後端
      const response = await fetch(`${API_SERVER}/api/member/avatar`, {
        method: "POST",
        credentials: "include", // 自動攜帶登入 Cookie

        // 不要手動寫 Content-Type。
        // 瀏覽器會自動加上 multipart/form-data 與必要 boundary。
        body: formData,
      });

      const result = (await response.json()) as AvatarUploadResponse;
      
      // 失敗時丟出錯誤，統一交給 catch 顯示一次 toast
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "大頭貼更新失敗");
      }

      toast.success(result.message || "大頭貼更新成功(前端)")

      // step4. 後端成功存檔與更新資料庫後，才換畫面上的大頭貼
      setAvatarUrl(`${API_SERVER}${result.data.avatarUrl}`);

      // step5. 關閉裁切視窗
      setSelectedImage(null);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error(error);
      // setErrorMessage(error instanceof Error ? error.message : "大頭貼更新失敗，請稍後再試",);
      const message = error instanceof Error ? error.message : "大頭貼更新失敗，請稍後再試";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // 離開裁切流程或元件卸載時，釋放瀏覽器暫存圖片記憶體
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
              onClick={handleOpenUploadDialog}
              className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:scale-105 hover:bg-zinc-100"
            >
              <FaCamera className="text-sm" />
            </button>

            <input
              ref={fileInputRef}
              name="avatar"
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <h4 className="mt-4">{name}</h4>
          {/*  
          {errorMessage && !isUploadDialogOpen && !selectedImage && (
            <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
          )}
          */}
        </div>

        <div className="h-px bg-zinc-200" />

        <nav>
          {memberLists.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-[64px] items-center gap-4 border-b border-zinc-200 px-8 text-[18px] transition hover:bg-zinc-50 ${
                  isActive ? "text-[#68BBC3]" : "text-[#ACACAC]"
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

      {/* 第一層：選檔／拖放圖片彈窗 */}
      {isUploadDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-upload-title"
            className="w-full max-w-[620px] overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
              <div>
                <h5
                  id="avatar-upload-title"
                  className="mt-1 text-xl font-bold text-zinc-900"
                >
                  更新你的個人頭像
                </h5>
              </div>

              <button
                type="button"
                aria-label="關閉上傳視窗"
                onClick={() => {
                  // setErrorMessage("");
                  setIsUploadDialogOpen(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                <FaXmark className="text-xl" />
              </button>
            </div>

            <div className="p-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
                  isDragging
                    ? "border-[#68BBC3] bg-[#68BBC3]/10"
                    : "border-zinc-200 bg-[#F8FAFA] hover:border-[#68BBC3]/60"
                }`}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#68BBC3]/15 text-[#4BA9B2]">
                  <FaCloudArrowUp className="text-3xl" />
                </div>

                <h6 className="mt-5 text-lg font-bold text-zinc-900">
                  放上一張最有辨識度的照片吧
                </h6>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                  直接把圖片拖到這裡，或從電腦中選擇圖片。
                  下一步可以調整頭像的位置與大小。
                </p>

                <button
                  type="button"
                  onClick={handleOpenFilePicker}
                  className="mt-6 rounded-full bg-[#68BBC3] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#53AAB2] focus:ring-4 focus:ring-[#68BBC3]/25 focus:outline-none"
                >
                  選擇圖片
                </button>

                <p className="mt-4 text-xs text-zinc-400">
                  支援 JPG、PNG、WEBP，檔案大小最多 2MB
                </p>
              </div>
              {/*  
              {errorMessage && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </p>
              )}
              */}
              
              <p className="mt-5 text-center text-xs leading-5 text-zinc-400">
                建議使用正面清楚、光線充足的照片。上傳後仍可調整裁切範圍。
              </p>
            </div>
          </section>
        </div>
      )}

      {/* 第二層：裁切圖片彈窗 */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-crop-title"
            className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div>
                <h5
                  id="avatar-crop-title"
                  className="mt-1 font-bold text-zinc-900"
                >
                  調整你的大頭貼
                </h5>
              </div>

              <button
                type="button"
                aria-label="關閉裁切視窗"
                onClick={handleCancelCrop}
                className="text-xl text-zinc-500 transition hover:text-zinc-900"
              >
                <FaXmark />
              </button>
            </div>

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

            <div className="px-6 pt-5">
              <label
                htmlFor="avatar-zoom"
                className="mb-2 block text-sm font-medium text-zinc-600"
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
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full accent-[#68BBC3]"
              />
              {/*  
              {errorMessage && (
                <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
              )}
              */}    
            </div>

            <div className="flex justify-end gap-3 px-6 py-5">
              <button
                type="button"
                onClick={handleCancelCrop}
                className="rounded-lg border border-zinc-300 px-5 py-2 text-zinc-700 transition hover:bg-zinc-100"
              >
                取消
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="rounded-lg bg-[#68BBC3] px-5 py-2 text-white transition hover:bg-[#53AAB2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "處理中..." : "使用這張圖片"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
