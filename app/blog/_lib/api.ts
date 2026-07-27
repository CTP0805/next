/**
 * =============================================================================
 * 【新手導讀】Blog 前端 API 層（只負責「跟後端說話」）
 * =============================================================================
 * 位置：app/blog/_lib/api.ts
 * 對應後端：express/routes/api-blog.ts、api-blog-upload.ts
 *
 * 為什麼獨立一層？
 *   頁面元件不要到處寫 fetch 網址；改呼叫這裡的函式，改 port／路徑只改一處。
 *
 * 慣例：
 *   credentials: "include" → 帶登入 Cookie（Kenny）
 *   cache: "no-store"      → 不要用瀏覽器快取舊資料
 *   成功時通常看 result.success + posts/post 欄位
 *
 * 函式 ↔ 後端：
 *   fetchBlogPosts      → GET  /api/blog
 *   fetchMyBlogPosts    → GET  /api/blog/mine
 *   createBlogPost      → POST /api/blog
 *   updateBlogPost      → PUT  /api/blog/:id
 *   …其餘見下方每個 export 函式註解
 * =============================================================================
 */

// getApiServer：@/config/api-path → 動態後端網址（函式版，每次呼叫重算）
import { getApiServer } from "@/config/api-path";

// 型別：./types.ts（文章、可寫訂單、送出 body）
import type {
  BlogComment,
  BlogEligibleOrder,
  BlogPost,
  BlogPostInput,
} from "./types";

/** 列表 API 回應形狀（後端 { success, posts }） */
type ListResponse = {
  success?: boolean;
  message?: string;
  posts?: BlogPost[];
};

/** 單篇 API 回應 */
type OneResponse = {
  success?: boolean;
  message?: string;
  post?: BlogPost;
};

/** 可撰寫訂單列表回應 */
type OrdersResponse = {
  success?: boolean;
  message?: string;
  orders?: BlogEligibleOrder[];
};

type CommentsResponse = {
  success?: boolean;
  message?: string;
  comments?: BlogComment[];
};

type CommentResponse = {
  success?: boolean;
  message?: string;
  comment?: BlogComment;
};

/**
 * 【內部函式】readJson
 * 用途：把 fetch 的 Response 安全轉成物件
 * 為什麼不用直接 response.json()？
 *   空 body、非 JSON 時較好給中文錯誤
 * 泛型 <T>：呼叫端決定回傳型別
 * response.text()：先當字串讀；JSON.parse：字串→物件
 * 巢狀三元：status===401 ? ... : status===413 ? ... : ...
 */
async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    throw new Error(
      response.status === 401
        ? "請先登入"
        : response.status === 413
          ? "內容過大，請減少內文圖片後再試"
          : `伺服器無回應（HTTP ${response.status}）`,
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      response.status === 413
        ? "內容過大，請減少內文圖片後再試"
        : `伺服器回應格式錯誤（HTTP ${response.status}）`,
    );
  }
}

/** 每次要後端 base URL */
function apiBase(): string {
  return getApiServer();
}

/**
 * 【函式】fetchBlogPosts
 * 對應後端：GET /api/blog（api-blog.ts router.get("/")）
 * 誰用：blog/page.tsx 列表、詳情頁推薦
 * params?：可選查詢；URLSearchParams 組 ?status=&category_id=
 * ?? []：posts 若 undefined 回空陣列，避免 .map 爆掉
 */
export async function fetchBlogPosts(params?: {
  status?: string;
  category_id?: number;
}): Promise<BlogPost[]> {
  // URLSearchParams：瀏覽器內建，專門組 query string
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.category_id != null) {
    qs.set("category_id", String(params.category_id));
  }
  const query = qs.toString();
  // 有 query 才加 ?
  const url = `${apiBase()}/api/blog${query ? `?${query}` : ""}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    // 網路層失敗（後端沒開）：fetch 會 throw，不是 HTTP 4xx
    throw new Error(
      `無法連線後端 ${apiBase()}，請確認 Express 已啟動（預設 port 3001）`,
    );
  }

  const data = await readJson<ListResponse>(response);
  if (!response.ok) {
    throw new Error(data.message || "讀取文章失敗");
  }
  return data.posts ?? [];
}

export async function fetchBlogComments(
  postSlug: string,
): Promise<BlogComment[]> {
  const response = await fetch(
    `${apiBase()}/api/blog/slug/${encodeURIComponent(postSlug)}/comments`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );
  const data = await readJson<CommentsResponse>(response);
  if (!response.ok) {
    throw new Error(data.message || "讀取留言失敗");
  }
  return data.comments ?? [];
}

export async function createBlogComment(
  postSlug: string,
  content: string,
): Promise<BlogComment> {
  const response = await fetch(
    `${apiBase()}/api/blog/slug/${encodeURIComponent(postSlug)}/comments`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    },
  );
  const data = await readJson<CommentResponse>(response);
  if (!response.ok || !data.comment) {
    throw new Error(data.message || "送出留言失敗");
  }
  return data.comment;
}

/**
 * 【函式】fetchMyBlogPosts
 * 對應：GET /api/blog/mine（需登入）
 * 誰用：member/edit-post、blog/[slug]/edit
 */
export async function fetchMyBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch(`${apiBase()}/api/blog/mine`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const data = await readJson<ListResponse>(response);
  if (!response.ok) {
    throw new Error(data.message || "讀取我的文章失敗");
  }
  return data.posts ?? [];
}

/**
 * 【函式】fetchPendingReviewPosts
 * 對應：GET /api/blog/pending-review
 * 誰用：member/blog-review（管理者）
 * 預設參數 status = "pending_review"：呼叫端可省略
 */
export async function fetchPendingReviewPosts(
  status = "pending_review",
): Promise<BlogPost[]> {
  const qs = new URLSearchParams({ status });
  const response = await fetch(
    `${apiBase()}/api/blog/pending-review?${qs}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );
  const data = await readJson<ListResponse>(response);
  if (!response.ok) {
    throw new Error(data.message || "讀取審查佇列失敗");
  }
  return data.posts ?? [];
}

/**
 * 【函式】fetchEligibleOrders
 * 對應：GET /api/blog/eligible-orders
 * 誰用：BlogPostForm 新增時下拉「選訂單」
 */
export async function fetchEligibleOrders(): Promise<BlogEligibleOrder[]> {
  const response = await fetch(`${apiBase()}/api/blog/eligible-orders`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const data = await readJson<OrdersResponse>(response);
  if (!response.ok) {
    throw new Error(data.message || "讀取可撰寫訂單失敗");
  }
  return data.orders ?? [];
}

/**
 * 【函式】fetchBlogPostById
 * 對應：GET /api/blog/:id
 * 模板字串把 id 拼進路徑
 */
export async function fetchBlogPostById(id: number): Promise<BlogPost> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}/api/blog/${id}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new Error(`無法連線後端 ${apiBase()}`);
  }
  const data = await readJson<OneResponse>(response);
  if (!response.ok || !data.post) {
    throw new Error(data.message || "找不到文章");
  }
  return data.post;
}

/**
 * 【函式】fetchBlogPostBySlug
 * 對應：GET /api/blog/slug/:slug
 * 誰用：blog/[slug]/page.tsx 詳情
 * encodeURIComponent：把中文/特殊字編碼進 URL，避免壞網址
 */
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  let response: Response;
  try {
    response = await fetch(
      `${apiBase()}/api/blog/slug/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );
  } catch {
    throw new Error(`無法連線後端 ${apiBase()}`);
  }
  const data = await readJson<OneResponse>(response);
  if (!response.ok || !data.post) {
    throw new Error(data.message || "找不到文章");
  }
  return data.post;
}

/**
 * 【函式】createBlogPost
 * 對應：POST /api/blog
 * 誰用：BlogPostForm mode="create"
 * body：BlogPostInput 整包 JSON
 */
export async function createBlogPost(
  input: BlogPostInput,
): Promise<BlogPost> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}/api/blog`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error(
      `無法連線後端 ${apiBase()}，請確認 Express 已啟動（預設 port 3001）`,
    );
  }

  const data = await readJson<OneResponse>(response);
  if (response.status === 401) {
    throw new Error(data.message || "請先登入後再儲存文章");
  }
  if (!response.ok || !data.post) {
    throw new Error(data.message || "儲存文章失敗");
  }
  return data.post;
}

/**
 * 【函式】updateBlogPost
 * 對應：PUT /api/blog/:id
 * 誰用：BlogPostForm mode="edit"
 * PUT：更新既有資源的慣例
 */
export async function updateBlogPost(
  id: number,
  input: BlogPostInput,
): Promise<BlogPost> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}/api/blog/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error(
      `無法連線後端 ${apiBase()}，請確認 Express 已啟動（預設 port 3001）`,
    );
  }

  const data = await readJson<OneResponse>(response);
  if (response.status === 401) {
    throw new Error(data.message || "請先登入後再更新文章");
  }
  if (!response.ok || !data.post) {
    throw new Error(data.message || "更新失敗");
  }
  return data.post;
}

/**
 * 【函式】reviewBlogPost
 * 對應：POST /api/blog/:id/review
 * 誰用：member/blog-review
 * action 聯合型別只能是 "approve" | "reject"
 */
export async function reviewBlogPost(
  id: number,
  action: "approve" | "reject",
  note?: string,
): Promise<BlogPost> {
  const response = await fetch(`${apiBase()}/api/blog/${id}/review`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, note: note ?? "" }),
  });
  const data = await readJson<OneResponse>(response);
  if (!response.ok || !data.post) {
    throw new Error(data.message || "審查操作失敗");
  }
  return data.post;
}

/**
 * 【函式】deleteBlogPost
 * 對應：DELETE /api/blog/:id
 * 誰用：member/edit-post 刪文
 * Promise<void>：成功不特別回資料，失敗 throw
 */
export async function deleteBlogPost(id: number): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}/api/blog/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    throw new Error(`無法連線後端 ${apiBase()}`);
  }
  const data = await readJson<{ success?: boolean; message?: string }>(
    response,
  );
  if (response.status === 401) {
    throw new Error(data.message || "請先登入");
  }
  if (!response.ok) {
    throw new Error(data.message || "刪除失敗");
  }
}

type UploadResponse = {
  success?: boolean;
  message?: string;
  path?: string;
  url?: string;
};

/**
 * 【函式】uploadBlogImage
 * 對應：POST /api/blog/upload（api-blog-upload.ts）
 * 誰用：BlogPostForm 封面、content-images 內文圖
 *
 * FormData：瀏覽器「表單上傳檔案」格式（不是 JSON）
 * form.append("image", file)：欄位名必須叫 image（後端 multer.single("image")）
 * 注意：用 FormData 時不要自己設 Content-Type，瀏覽器會加 boundary
 * 回傳 path：如 /uploads/blog/xxx.jpg（給 DB cover_image）
 */
export async function uploadBlogImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);

  let response: Response;
  try {
    response = await fetch(`${apiBase()}/api/blog/upload`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
  } catch {
    throw new Error(
      `無法連線後端 ${apiBase()}，圖片上傳失敗（請確認 Express 在 3001）`,
    );
  }

  const data = await readJson<UploadResponse>(response);
  if (response.status === 401) {
    throw new Error(data.message || "請先登入再上傳圖片");
  }
  if (!response.ok || !data.success || !data.path) {
    throw new Error(data.message || "圖片上傳失敗");
  }
  return data.path;
}
