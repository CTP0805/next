import { pinyin } from "pinyin-pro";

/**
 * 部落格文章 — 對齊 DB posts 表
 * ⭐ 阿偉：order_id／order_title 綁已完成訂單；review_note 管理者註解
 */

export type BlogPostStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected";

export const BLOG_STATUS_LABEL: Record<BlogPostStatus, string> = {
  draft: "草稿",
  pending_review: "待審核",
  published: "已上架",
  rejected: "被退回",
};

/** 標題 VARCHAR(20) */
export const BLOG_TITLE_MAX = 20;

export interface BlogPost {
  id: number;
  author_id: number;
  category_id: number | null;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  content_image: string | null;
  published_at: string | null;
  updated_at: string;
  created_at?: string;
  status: BlogPostStatus;
  /** 綁定 order_main.id */
  order_id?: string | null;
  /** 訂單／體驗名稱（分類顯示，不可改） */
  order_title?: string | null;
  /** 管理者審查註解 */
  review_note?: string | null;
  author_name?: string | null;
}

export const BLOG_REGIONS = [
  "倫敦",
  "巴黎",
  "慕尼黑",
  "阿姆斯特丹",
  "羅馬",
  "巴賽隆納",
] as const;

/** 舊分類（相容顯示） */
export const BLOG_CATEGORY_MAP: Record<number, string> = {
  1: "古蹟巡禮",
  2: "藝文導覽",
  3: "美饌饗宴",
  4: "戶外探索",
  5: "專人攝影",
  6: "娛樂與夜生活",
};

export type BlogEligibleOrder = {
  order_id: string;
  order_title: string;
  final_amount: number;
  created_at: string | null;
  order_status: string;
};

export type BlogPostInput = {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string | null;
  cover_image?: string | null;
  content_image?: string | null;
  /** 新建必填：已完成訂單 */
  order_id?: string;
  category_id?: number | null;
  status?: BlogPostStatus;
  author_id?: number;
};

const HAS_CJK = /[\u4e00-\u9fff]/;

export function slugifyTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return `post-${Date.now()}`;

  let source = trimmed;

  if (HAS_CJK.test(trimmed)) {
    source = pinyin(trimmed, { toneType: "none", type: "array" }).join("-");
  }

  let base = source
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!base && HAS_CJK.test(trimmed)) {
    base = encodeURIComponent(trimmed)
      .toLowerCase()
      .replace(/[^a-z0-9%]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  return base || `post-${Date.now()}`;
}

/** 顯示分類：優先訂單名稱 */
export function blogCategoryLabel(post: BlogPost): string {
  if (post.order_title?.trim()) return post.order_title.trim();
  return BLOG_CATEGORY_MAP[post.category_id ?? 0] || "其他";
}
