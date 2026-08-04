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

/** 將編輯器 HTML 整理成可用於標題與摘要的純文字。 */
function getPlainTextFromHtml(html: string): string {
  const document = new DOMParser().parseFromString(html, "text/html");
  return (document.body.textContent ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

/** 以內文第一個完整句子產生精簡標題。 */
function createTitleFromContent(text: string): string {
  const firstSentence = text.split(/[。！？!?\n]/, 1)[0]?.trim() ?? "";
  const titleCandidate = firstSentence
    .replace(/^[「『【（(\s]+|[」』】）)\s]+$/g, "")
    .split(/[，,：:；;]/, 1)[0]
    ?.trim();

  return truncateText(titleCandidate || text, BLOG_TITLE_MAX);
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
  const [eligibleOrders, setEligibleOrders] = useState<BlogEligibleOrder[]>([]);
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
      const timeoutId = window.setTimeout(() => setOrdersLoading(false), 0);
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
          toast.error(e instanceof Error ? e.message : "無法載入可撰寫訂單");
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

  function handleAutoFillArticleInfo() {
    setTitle(createTitleFromContent(`一次收藏最浪漫的英倫風景`));
    setExcerpt(truncateText(`走進倫敦最具代表性的城市風景，以經典大笨鐘與壯麗倫敦眼為旅拍背景。從復古優雅的英倫街景，到泰晤士河畔的浪漫光影，用鏡頭記錄專屬於你的倫敦故事。`, 200));
    setContent(`
  <div style="max-width: 860px; margin: 0 auto; color: #334155; font-size: 17px; line-height: 2;">

    <p style="margin: 0 0 16px; color: #45aeb8; font-size: 14px; font-weight: 700; letter-spacing: 3px; text-align: center;">
      LONDON TRAVEL STORY
    </p>

    <h2 style="margin: 0 0 24px; color: #172033; font-size: 34px; line-height: 1.4; text-align: center;">
      在倫敦，把旅行拍成一段<br>
      屬於自己的故事
    </h2>

    <p style="max-width: 680px; margin: 0 auto 42px; color: #64748b; font-size: 18px; line-height: 2; text-align: center;">
      從大笨鐘的古典輪廓，到倫敦眼映照在泰晤士河上的光影，
      跟著城市的節奏慢慢散步，收藏專屬於你的英倫回憶。
    </p>

    <figure class="image" style="margin: 0 0 44px;">
      <img
        src="/London/London15.jpg"
        alt="大笨鐘與泰晤士河景色"
        style="display: block; width: 100%; border-radius: 18px;"
      />
      <figcaption style="padding-top: 12px; color: #94a3b8; font-size: 14px; text-align: center;">
        泰晤士河畔的經典景色，是認識倫敦最迷人的起點。
      </figcaption>
    </figure>

    <div style="margin: 0 0 48px; padding: 28px 32px; border-left: 5px solid #45cad5; border-radius: 0 16px 16px 0; background: #f0fbfc;">
      <p style="margin: 0; color: #247f87; font-size: 20px; font-weight: 600; line-height: 1.9;">
        「最好的旅行照片，不只是記錄你去了哪裡，
        而是保存當時的光線、心情，以及走在城市裡的自己。」
      </p>
    </div>

    <p style="margin: 0 0 10px; color: #45aeb8; font-size: 14px; font-weight: 700; letter-spacing: 2px;">
      STOP 01
    </p>

    <h3 style="margin: 0 0 20px; color: #172033; font-size: 27px; line-height: 1.5;">
      大笨鐘與西敏寺：走進經典英倫風景
    </h3>

    <p style="margin: 0 0 22px;">
      旅程從西敏一帶開始。沿著河岸散步，可以將大笨鐘、國會大廈與橋上的城市日常，
      一起收入畫面。雄偉的哥德式建築帶著濃厚歷史感，無論遠景或近距離取景，
      都能呈現倫敦獨有的優雅氣質。
    </p>

    <p style="margin: 0 0 44px;">
      不需要刻意擺出複雜姿勢，只要自然行走、輕輕回頭，或停在河畔眺望風景，
      就能捕捉輕鬆而真實的旅行瞬間。上午與日落前的光線較柔和，
      也更容易拍出溫暖且具有層次的照片。
    </p>

    <p style="margin: 0 0 22px;">
      西敏一帶最吸引人的地方，在於每走幾步就會出現不同的畫面。轉身是歷史悠久的國會大廈，
      往前則是穿梭於橋面的雙層巴士與黑色計程車。這些熟悉的英倫元素不必全部塞進同一張照片，
      分段記錄反而能讓整組影像更有旅行故事的節奏。
    </p>

    <p style="margin: 0 0 44px;">
      如果是第一次面對鏡頭，可以先從散步開始，讓攝影師在稍遠的位置捕捉互動。
      等習慣鏡頭之後，再慢慢加入靠牆、整理外套或看向遠方等簡單動作，表情通常會比刻意微笑更加自然。
    </p>

    <hr style="margin: 0 0 44px; border: 0; border-top: 1px solid #e2e8f0;" />

    <p style="margin: 0 0 10px; color: #45aeb8; font-size: 14px; font-weight: 700; letter-spacing: 2px;">
      STOP 02
    </p>

    <h3 style="margin: 0 0 20px; color: #172033; font-size: 27px; line-height: 1.5;">
      倫敦眼：在河岸捕捉城市的浪漫光影
    </h3>

    <p style="margin: 0 0 30px;">
      穿過西敏橋後，巨大的倫敦眼會逐漸出現在眼前。
      摩天輪俐落的圓形線條與泰晤士河的寬闊景色，能為照片帶來豐富的空間感。
      河岸沿途還有長椅、階梯與街頭表演，讓旅拍不只有地標，也保留城市真實的生活氣息。
    </p>

    <p style="margin: 0 0 22px;">
      想拍出更有變化的畫面，可以將倫敦眼安排在人物側後方，利用河岸欄杆作為延伸線條；
      也可以走到較低的階梯，以仰角帶入完整摩天輪。若是雙人或多人同行，並肩散步、聊天與互相整理衣服，
      都比整齊站成一排更有溫度。
    </p>

    <p style="margin: 0 0 38px;">
      河岸的風通常比市區明顯，輕薄外套、圍巾與自然飄動的髮絲，都能成為畫面的一部分。
      與其一直等待完全無風的瞬間，不如順著天氣留下倫敦原本的樣子，照片也會更有身歷其境的感覺。
    </p>

    <figure class="image" style="margin: 0 0 44px;">
      <img
        src="/London/London10.jpg"
        alt="倫敦眼與泰晤士河"
        style="display: block; width: 100%; border-radius: 18px;"
      />
      <figcaption style="padding-top: 12px; color: #94a3b8; font-size: 14px; text-align: center;">
        以倫敦眼為背景，畫面既有辨識度，也充滿現代城市感。
      </figcaption>
    </figure>

    <div style="margin: 0 0 48px; padding: 26px 30px; border: 1px solid #d8f0f2; border-radius: 18px; background: linear-gradient(135deg, #f7feff 0%, #eefafa 100%);">
      <h4 style="margin: 0 0 14px; color: #247f87; font-size: 19px;">
        拍攝小技巧
      </h4>

      <ul style="margin: 0; padding-left: 22px;">
        <li style="margin-bottom: 8px;">走動時將視線望向河面，畫面會更加自然。</li>
        <li style="margin-bottom: 8px;">利用橋梁與摩天輪線條，增加照片的延伸感。</li>
        <li>陰天也不必擔心，柔和光線反而很有倫敦電影氛圍。</li>
      </ul>
    </div>

    <p style="margin: 0 0 10px; color: #45aeb8; font-size: 14px; font-weight: 700; letter-spacing: 2px;">
      STOP 03
    </p>

    <h3 style="margin: 0 0 20px; color: #172033; font-size: 27px; line-height: 1.5;">
      塔橋夕陽：等待倫敦亮起燈光
    </h3>

    <p style="margin: 0 0 30px;">
      傍晚是倫敦最迷人的時刻之一。天空從淡藍色逐漸染上金色與粉紫色，
      建築輪廓、橋梁燈光與河面倒影也開始變得溫暖。放慢腳步等待城市點燈，
      就能拍下與白天截然不同的浪漫氛圍。
    </p>

    <p style="margin: 0 0 22px;">
      塔橋附近同時擁有寬闊河景、磚牆街道與帶有工業感的橋體結構，特別適合作為旅程後半段的拍攝場景。
      白天可以呈現建築細節，入夜後則能利用路燈與水面倒影，拍出帶有電影感的城市人像。
    </p>

    <p style="margin: 0 0 38px;">
      日落前後的光線變化很快，建議預留足夠時間，不急著一次完成所有照片。
      先欣賞景色、感受河畔氣氛，再挑選最喜歡的角度拍攝，往往能留下比打卡照更耐看的回憶。
    </p>

    <figure class="image" style="margin: 0 0 44px;">
      <img
        src="/London/London20.jpg"
        alt="夕陽下的倫敦塔橋"
        style="display: block; width: 100%; border-radius: 18px;"
      />
      <figcaption style="padding-top: 12px; color: #94a3b8; font-size: 14px; text-align: center;">
        當夕陽落在泰晤士河上，倫敦展現出沉穩又浪漫的一面。
      </figcaption>
    </figure>

<div style="clear: both; width: 100%; margin: 56px 0 48px;">

  <figure class="image" style="clear: both; width: 100%; margin: 0 0 40px;">
    <img
      src="/London/London01.jpg"
      alt="倫敦城市天際線"
      style="display: block; width: 100%; height: auto; border-radius: 18px;"
    />
    <figcaption style="padding: 14px 10px; color: #94a3b8; font-size: 14px; text-align: center;">
      古典建築與現代城市交錯而成的倫敦天際線
    </figcaption>
  </figure>

  <figure class="image" style="clear: both; width: 100%; margin: 0 0 48px;">
    <img
      src="/London/London30.jpg"
      alt="泰晤士河畔街景"
      style="display: block; width: 100%; height: auto; border-radius: 18px;"
    />
    <figcaption style="padding: 14px 10px; color: #94a3b8; font-size: 14px; text-align: center;">
      藏在橋下與泰晤士河岸之間的倫敦日常
    </figcaption>
  </figure>

</div>

<div style="clear: both; margin: 0 0 52px;">
  <p style="margin: 0 0 10px; color: #45aeb8; font-size: 14px; font-weight: 700; letter-spacing: 2px;">
    STOP 04
  </p>

  <h3 style="margin: 0 0 20px; color: #172033; font-size: 27px; line-height: 1.5;">
    離開地標之後，遇見倫敦真正的日常
  </h3>

  <p style="margin: 0 0 22px;">
    經典地標能交代旅行的目的地，但真正讓照片產生個人風格的，往往是途中那些沒有特別安排的片刻。
    可能是橋下灑落的一束光、擦身而過的紅色巴士，也可能是咖啡店窗邊短暫的休息。
    把這些細節留進文章與照片裡，整趟旅程就不再只是景點清單。
  </p>

  <p style="margin: 0 0 22px;">
    倫敦同時擁有古老與現代、熱鬧與安靜。主街上的節奏快速，轉進巷弄後卻可能立刻遇見安靜的住宅、
    小型花園與歷史建築。旅拍不妨保留一段沒有明確目的地的散步時間，讓城市主動帶來意想不到的背景。
  </p>

  <p style="margin: 0;">
    當你不再只注意鏡頭，而是開始與同行的人聊天、觀察街景或享受當下，表情會自然放鬆。
    這些不經意的畫面，通常也是多年後重新翻閱時，最能喚起旅行記憶的照片。
  </p>
</div>

<div
  style="
    clear: both;
    display: block;
    width: 100%;
    box-sizing: border-box;
    margin: 0 0 56px;
    padding: 36px 40px;
    border-radius: 20px;
    background: #172033;
    color: #ffffff;
  "
>
  <p style="margin: 0 0 10px; color: #67dce5; font-size: 13px; font-weight: 700; letter-spacing: 3px;">
    TRAVEL CHECKLIST
  </p>

  <h3 style="margin: 0 0 26px; color: #ffffff; font-size: 25px; line-height: 1.5;">
    倫敦旅拍準備清單
  </h3>

  <div style="margin: 0 0 14px; padding: 15px 18px; border-radius: 12px; background: #253047;">
    <p style="margin: 0; color: #ffffff; line-height: 1.8;">
      ✓ 選擇米色、深藍、酒紅等具有英倫感的服裝色系
    </p>
  </div>

  <div style="margin: 0 0 14px; padding: 15px 18px; border-radius: 12px; background: #253047;">
    <p style="margin: 0; color: #ffffff; line-height: 1.8;">
      ✓ 攜帶輕便雨具，從容面對倫敦多變的天氣
    </p>
  </div>

  <div style="margin: 0 0 14px; padding: 15px 18px; border-radius: 12px; background: #253047;">
    <p style="margin: 0; color: #ffffff; line-height: 1.8;">
      ✓ 清晨避開人潮，傍晚捕捉柔和光線與城市夜景
    </p>
  </div>

  <div style="padding: 15px 18px; border-radius: 12px; background: #253047;">
    <p style="margin: 0; color: #ffffff; line-height: 1.8;">
      ✓ 穿著適合步行的鞋子，讓整個拍攝過程更加自在
    </p>
  </div>
</div>

<div style="clear: both; margin: 0; padding: 42px 34px; border-radius: 20px; background: #f8fafc; text-align: center;">
  <p style="margin: 0 0 12px; color: #45aeb8; font-size: 13px; font-weight: 700; letter-spacing: 3px;">
    KEEP YOUR LONDON MOMENT
  </p>

  <h3 style="margin: 0 0 20px; color: #172033; font-size: 28px; line-height: 1.5;">
    準備好走進倫敦了嗎？
  </h3>

  <p style="max-width: 680px; margin: 0 auto 18px; color: #64748b; line-height: 2;">
    一趟值得記住的旅程，不一定需要追趕很多景點。選擇幾個真正喜歡的地方，
    為散步、停留與拍照保留時間，才能更完整地感受城市，也讓每張照片擁有不同的情緒。
  </p>

  <p style="max-width: 680px; margin: 0 auto; color: #64748b; line-height: 2;">
    讓大笨鐘、倫敦眼與泰晤士河成為故事背景，把笑容、同行者與當天的光線留在畫面裡。
    當旅程結束後，這些照片仍會帶你回到那一天，想起倫敦的風、河岸的聲音，以及當時自在前行的自己。
  </p>
</div>
`);
  
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
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <label
            htmlFor="blog-title"
            className="block text-sm font-medium text-gray-700"
          >
            文章標題 <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleAutoFillArticleInfo}
            disabled={busy}
            className="inline-flex shrink-0 h-5 w-10 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-teal-700 transition hover:border-[#45cad5] \"
            title="依文章內容自動產生標題與摘要"
          >
          </button>
        </div>
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
        <p className="mt-1 text-xs text-gray-400">最多 {BLOG_TITLE_MAX} 字</p>
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

      <div  >
        <label className={labelClass}>
          文章內容 <span className="text-red-500">*</span>
        </label>
        <CKEditorWrapper
          data={content}
          onChange={setContent}
          size={variant === "member" ? "large" : "default"}
        />
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
              <p className="font-semibold text-gray-900">
                文章預覽（尚未儲存）
              </p>
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
