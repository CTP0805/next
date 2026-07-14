import { pinyin } from "pinyin-pro";

/**
 * 部落格文章 — 對齊 DB posts 表
 *
 * id            INT PK 自動遞增
 * author_id     INT FK → 會員 member.id
 * category_id   INT FK → 商品／文章類型
 * title         VARCHAR(20) 必填
 * slug          TEXT 必填、唯一
 * content       TEXT 必填（Markdown）
 * excerpt       TEXT 可空（列表摘要）
 * cover_image   TEXT 可空（封面圖）
 * content_image TEXT 可空（內文最上方圖）
 * published_at  DATETIME 可空（審核通過／上架時填入）
 * updated_at    DATETIME 必填
 * status        VARCHAR(20) draft | pending_review | published | rejected
 *
 * region：前端列表篩選用（非 DB 規格，可選）
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
  /** FK 會員 member.id */
  author_id: number;
  /** FK 商品／文章類型 */
  category_id: number;
  title: string;
  slug: string;
  /** Markdown 內文 */
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  /** 內文最上方圖片 */
  content_image: string | null;
  /** 上架時間；未上架為 null */
  published_at: string | null;
  updated_at: string;
  status: BlogPostStatus;
  /**
   * 列表地區篩選（前端用；正式 DB 若無此欄可之後移除）
   */
  region?: string | null;
}

export interface BlogPostsFile {
  posts: BlogPost[];
}

export const BLOG_REGIONS = [
  "倫敦",
  "巴黎",
  "慕尼黑",
  "阿姆斯特丹",
  "羅馬",
  "巴賽隆納",
] as const;

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
  region?: string | null;
  category_id: number;
  status?: BlogPostStatus;
  author_id?: number;
};

const HAS_CJK = /[\u4e00-\u9fff]/;

/**
 * 標題 → 網址別名
 * - 含中文：轉無聲調羅馬拼音（例：大英博物館 → da-ying-bo-wu-guan）
 * - 拼音結果為空時：用 percent-encoding 後備（% 符號會保留於別名中）
 * - 英文／數字：正規化為 kebab-case
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

  // 拼音無法產生有效別名時，改用 percent-encoding
  if (!base && HAS_CJK.test(trimmed)) {
    base = encodeURIComponent(trimmed)
      .toLowerCase()
      .replace(/[^a-z0-9%]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  return base || `post-${Date.now()}`;
}

/** 上架才寫 published_at */
export function resolvePublishedAt(
  status: BlogPostStatus,
  previous: string | null | undefined,
  nowIso: string,
): string | null {
  if (status === "published") {
    return previous ?? nowIso;
  }
  return null;
}
