/**
 * =============================================================================
 * 【新手導讀】Blog 型別定義（TypeScript 的「資料長什麼樣」）
 * =============================================================================
 * 為什麼需要？
 *   後端 JSON 若少欄位，TS 會在編譯期提醒，少寫 post.tittle 這種拼錯。
 * 和後端關係：
 *   BlogPost 約略對齊 posts 表 + API 多回的 author_name 等
 *   狀態 status: draft | pending_review | published | rejected
 *   對應後端 mapPost()：express/routes/api-blog.ts
 * =============================================================================
 */
import { pinyin } from "pinyin-pro";

/** 文章狀態（和後端 ALLOWED_STATUS 對齊） */
export type BlogPostStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected";

/** 標題上限（後端 TITLE_MAX = 20） */
export const BLOG_TITLE_MAX = 20;

/** 狀態 → 中文標籤（卡片、管理頁 badge） */
export const BLOG_STATUS_LABEL: Record<BlogPostStatus, string> = {
  draft: "草稿",
  pending_review: "待審核",
  published: "已上架",
  rejected: "被退回",
};

/**
 * 列表頁地區篩選用關鍵字（DB 無 region 欄）
 * 會用「標題／摘要／內文是否包含此字」來 filter
 * 可依實際文章內容調整
 */
export const BLOG_REGIONS = [
  "巴黎",
  "倫敦",
  "阿姆斯特丹",
  "巴塞隆納",
  "慕尼黑",
  "威尼斯",
] as const;

/**
 * 單篇文章（API 回傳形狀）
 * 對應後端 mapPost + posts 表
 */
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  content_image: string | null;
  status: BlogPostStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  author_id: number;
  category_id: number | null;
  category_name?: string | null;
  order_item_id?: number | null;
  experience_id?: number | null;
  experience_title?: string | null;
  city?: string | null;
  /** 綁定的訂單（當「分類」用，新增後通常不可改） */
  order_id?: string | null;
  order_title?: string | null;
  /** 管理者退回時的註解 */
  review_note?: string | null;
  /** JOIN member 時可能有 */
  author_name?: string | null;
  /** 已送出的文章留言總數；公開列表用於熱門文章排序。 */
  comment_count?: number;
}

/**
 * 新增／更新時送出的 body（BlogPostForm → createBlogPost / updateBlogPost）
 */
export interface BlogPostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  cover_image?: string | null;
  content_image?: string | null;
  /** 僅新增時必填：綁哪張已付款訂單 */
  order_id?: string;
  author_id?: number;
  status: BlogPostStatus;
}

/**
 * 可撰寫心得的訂單（GET /api/blog/eligible-orders）
 */
export interface BlogEligibleOrder {
  order_id: string;
  order_title: string;
  final_amount: number;
  created_at: string | null;
  order_status?: string;
}

export interface BlogComment {
  id: number;
  post_id: number;
  member_id: number;
  author_name: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * 顯示商品類型名稱；舊 API 尚未回傳名稱時保留編號作為退回顯示。
 */
export function blogCategoryLabel(
  post: Pick<BlogPost, "category_name" | "category_id">,
): string {
  const categoryName = post.category_name?.trim();
  if (categoryName) return categoryName;
  if (post.category_id != null) return `分類 #${post.category_id}`;
  return "未分類";
}

/** 顯示商品城市；舊 API 沒有 city 時暫由文章文字判斷。 */
export function blogCityLabel(
  post: Pick<BlogPost, "city" | "title" | "excerpt" | "content">,
): string {
  const city = post.city?.trim();
  if (city) return city === "巴賽隆納" ? "巴塞隆納" : city;

  const text = `${post.title}\n${post.excerpt ?? ""}\n${post.content}`;
  const matchedCity = BLOG_REGIONS.find((region) => text.includes(region));
  if (matchedCity) return matchedCity;
  if (text.includes("巴賽隆納")) return "巴塞隆納";
  return "未指定城市";
}

/**
 * 標題 → slug（網址用）
 * 邏輯與後端 slugify 相近；真正唯一性由後端 ensureUniqueSlug 保證
 */
export function slugifyTitle(input: string): string {
  const romanized = pinyin(input, {
    toneType: "none", // 不顯示聲調
    type: "array",
  }).join("-");

  const slug = romanized
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);

  return slug || `post-${Date.now()}`;
}
