/**
 * 部落格 — 前端 API 層（對應 Express /api/blog）
 * 一律用 getApiServer()，避免 SSR／打包時 API_SERVER 被寫死成錯誤位址
 */
import { getApiServer } from "@/config/api-path";
import type { BlogPost, BlogPostInput } from "./types";

type ListResponse = {
  success?: boolean;
  message?: string;
  posts?: BlogPost[];
};

type OneResponse = {
  success?: boolean;
  message?: string;
  post?: BlogPost;
};

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

function apiBase(): string {
  return getApiServer();
}

/** GET /api/blog */
export async function fetchBlogPosts(params?: {
  status?: string;
  category_id?: number;
}): Promise<BlogPost[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.category_id != null) {
    qs.set("category_id", String(params.category_id));
  }
  const query = qs.toString();
  const url = `${apiBase()}/api/blog${query ? `?${query}` : ""}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
  } catch {
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

/** GET /api/blog/:id */
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

/** GET /api/blog/slug/:slug — 已上架文章 */
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

/** POST /api/blog（需登入 Cookie） */
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

/** PUT /api/blog/:id（需登入） */
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

/** DELETE /api/blog/:id（需登入） */
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

/** POST /api/blog/upload — multipart field: image */
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
