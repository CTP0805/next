import { pinyin } from "pinyin-pro";

/**
 * 部落格文章 — 對齊 DB posts 表（express/databases/schema.sql）
 *
 * id            BIGINT PK 自動遞增
 * author_id     INT FK → member.id
 * category_id   INT（邏輯對應 experience_categories）
 * title         VARCHAR(20)
 * slug          VARCHAR(255) UNIQUE
 * content       LONGTEXT
 * excerpt       TEXT NULL
 * cover_image   TEXT NULL
 * content_image TEXT NULL
 * status        VARCHAR(20) draft | pending_review | published | rejected
 * published_at  DATETIME NULL
 * updated_at    DATETIME
 * created_at    DATETIME
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
}

export const BLOG_REGIONS = [
  "倫敦",
  "巴黎",
  "慕尼黑",
  "阿姆斯特丹",
  "羅馬",
  "巴賽隆納",
] as const;

/** 對齊 experience_categories seed */
export const BLOG_CATEGORY_MAP: Record<number, string> = {
  1: "古蹟巡禮",
  2: "藝文導覽",
  3: "美饌饗宴",
  4: "戶外探索",
  5: "專人攝影",
  6: "娛樂與夜生活",
};

export type BlogPostInput = {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string | null;
  cover_image?: string | null;
  content_image?: string | null;
  category_id: number;
  status?: BlogPostStatus;
  author_id?: number;
};

const HAS_CJK = /[\u4e00-\u9fff]/;

/**
 * 標題 → 網址別名
 * - 含中文：轉無聲調羅馬拼音
 * - 英文／數字：kebab-case
 */
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
