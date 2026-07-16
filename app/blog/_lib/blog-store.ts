import { promises as fs } from "fs";
import path from "path";
import type {
  BlogPost,
  BlogPostInput,
  BlogPostStatus,
  BlogPostsFile,
} from "./types";
import { BLOG_TITLE_MAX, resolvePublishedAt, slugifyTitle } from "./types";
import { storePostImages } from "./post-image-store";

const DATA_PATH = path.join(process.cwd(), "data", "blogPosts.json");

function normalizePost(raw: Partial<BlogPost> & { id: number }): BlogPost {
  const status = (raw.status as BlogPostStatus) || "published";
  return {
    id: raw.id,
    author_id: raw.author_id ?? 1,
    category_id: raw.category_id ?? 1,
    title: (raw.title ?? "").slice(0, BLOG_TITLE_MAX),
    slug: raw.slug ?? `post-${raw.id}`,
    content: raw.content ?? "",
    excerpt: raw.excerpt ?? null,
    cover_image: raw.cover_image ?? null,
    content_image: raw.content_image ?? null,
    published_at: status === "published" ? (raw.published_at ?? null) : null,
    updated_at: raw.updated_at ?? new Date().toISOString(),
    status,
    review_of_id: raw.review_of_id ?? null,
    region: raw.region ?? null,
  };
}

//這裡是用來讀取和寫入部落格文章資料的函式庫，使用 JSON 檔案作為資料儲存。提供了以下功能：
//1. 讀取所有文章：getAllPosts()
//2. 讀取已上架文章：getPublishedPosts()
//3. 根據 slug 取得文章：getPostBySlug(slug)
//4. 根據 id 取得文章：getPostById(id)
//5. 建立新文章：createPost(input)
//6. 更新文章：updatePost(id, input)
//7. 刪除文章：deletePost(id)
async function readFile(): Promise<BlogPostsFile> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const data = JSON.parse(raw) as BlogPostsFile;
  return {
    posts: (data.posts ?? []).map((p) => normalizePost(p)),
  };
}

async function writeFile(data: BlogPostsFile): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const data = await readFile();
  return data.posts;
}

/** 前台列表：僅已上架 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((p) => p.status === "published");
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug && p.status === "published") ?? null;
}

export async function getPostById(id: number): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.id === id) ?? null;
}
//這裡是用來確保文章的 slug 唯一性，避免重複的 slug 造成路由衝突。
function uniqueSlug(
  posts: BlogPost[],
  desired: string,
  excludeId?: number,
): string {
  let slug = desired || `post-${Date.now()}`;
  let n = 2;
  while (posts.some((p) => p.slug === slug && p.id !== excludeId)) {
    slug = `${desired}-${n}`;
    n += 1;
  }
  return slug;
}
//這裡是用來將空字串或只包含空白的字串轉換為 null，方便在資料庫中儲存。
function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const t = value.trim();
  return t ? t : null;
}
//這裡是用來建立新文章的函式，會自動產生唯一的 slug，並將文章內容中的圖片儲存到指定位置。
export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const data = await readFile();
  const now = new Date().toISOString();
  const nextId = data.posts.reduce((max, p) => Math.max(max, p.id), 0) + 1;

  const title = input.title.trim().slice(0, BLOG_TITLE_MAX);
  if (!title) throw new Error("標題不可為空");
  if (!input.content?.trim()) throw new Error("內容不可為空");

  const status: BlogPostStatus = input.status ?? "draft";
  const desired = input.slug?.trim()
    ? slugifyTitle(input.slug)
    : slugifyTitle(title);
  const slug = uniqueSlug(data.posts, desired);
  const images = await storePostImages(
    {
      content: input.content,
      coverImage: input.cover_image,
      contentImage: input.content_image,
    },
    slug,
  );
  //這裡是用來建立新文章的函式，會自動產生唯一的 slug，並將文章內容中的圖片儲存到指定位置。
  const post: BlogPost = {
    id: nextId,
    author_id: input.author_id ?? 1,
    category_id: input.category_id,
    title,
    slug,
    content: images.content,
    excerpt: emptyToNull(input.excerpt),
    cover_image: emptyToNull(images.coverImage),
    content_image: emptyToNull(images.contentImage),
    published_at: resolvePublishedAt(status, null, now),
    updated_at: now,
    status,
    region: emptyToNull(input.region),
  };

  data.posts.unshift(post);
  await writeFile(data);
  return post;
}
//這裡是用來更新文章的函式，會根據文章的狀態決定是否覆蓋原本的公開內容，或是另存為草稿或待審查修訂版本。
export async function updatePost(
  id: number,
  input: BlogPostInput,
): Promise<BlogPost | null> {
  const data = await readFile();
  const index = data.posts.findIndex((p) => p.id === id);
  if (index < 0) return null;

  const prev = data.posts[index];
  const title = input.title.trim().slice(0, BLOG_TITLE_MAX);
  if (!title) throw new Error("標題不可為空");
  if (!input.content?.trim()) throw new Error("內容不可為空");

  let status: BlogPostStatus = input.status ?? prev.status;
  const now = new Date().toISOString();

  // 草稿或退件文章不能直接上架，必須先回到待審查佇列。
  if (
    status === "published" &&
    (prev.status === "draft" || prev.status === "rejected")
  ) {
    status = "pending_review";
  }

  // 審核通過時，才用待審查版本覆蓋原本公開中的文章。
  if (
    prev.status === "pending_review" &&
    status === "published" &&
    prev.review_of_id
  ) {
    const originalIndex = data.posts.findIndex(
      (post) => post.id === prev.review_of_id,
    );
    if (originalIndex < 0) return null;

    const original = data.posts[originalIndex];
    const published: BlogPost = {
      ...prev,
      id: original.id,
      status: "published",
      review_of_id: null,
      published_at: original.published_at ?? now,
      updated_at: now,
    };

    data.posts[originalIndex] = published;
    data.posts = data.posts.filter((post) => post.id !== prev.id);
    await writeFile(data);
    return published;
  }

  const desired = input.slug?.trim()
    ? slugifyTitle(input.slug)
    : slugifyTitle(title);

  // 已上架文章的編輯不會直接改公開內容，而是另存草稿或待審查修訂版本。
  if (prev.status === "published") {
    const existingRevisionIndex = data.posts.findIndex(
      (post) => post.review_of_id === prev.id,
    );
    const revision =
      existingRevisionIndex >= 0 ? data.posts[existingRevisionIndex] : null;
    const revisionId =
      revision?.id ??
      data.posts.reduce((max, post) => Math.max(max, post.id), 0) + 1;
    const slug = uniqueSlug(data.posts, desired, revision?.id);
    const images = await storePostImages(
      {
        content: input.content,
        coverImage: input.cover_image,
        contentImage: input.content_image,
      },
      slug,
    );
    const pendingRevision: BlogPost = {
      ...(revision ?? prev),
      id: revisionId,
      title,
      slug,
      content: images.content,
      excerpt: emptyToNull(input.excerpt),
      cover_image: emptyToNull(images.coverImage) ?? prev.cover_image,
      content_image: emptyToNull(images.contentImage),
      category_id: input.category_id,
      region: emptyToNull(input.region) ?? prev.region,
      status: status === "draft" ? "draft" : "pending_review",
      published_at: null,
      updated_at: now,
      author_id: input.author_id ?? prev.author_id,
      review_of_id: prev.id,
    };

    if (existingRevisionIndex >= 0) {
      data.posts[existingRevisionIndex] = pendingRevision;
    } else {
      data.posts.unshift(pendingRevision);
    }
    await writeFile(data);
    return pendingRevision;
  }

  const slug = uniqueSlug(data.posts, desired, id);
  const images = await storePostImages(
    {
      content: input.content,
      coverImage: input.cover_image,
      contentImage: input.content_image,
    },
    slug,
  );
  // 這裡是用來更新文章的函式，會根據文章的狀態決定是否覆蓋原本的公開內容，或是另存為草稿或待審查修訂版本。
  const updated: BlogPost = {
    ...prev,
    title,
    slug,
    content: images.content,
    excerpt: emptyToNull(input.excerpt),
    cover_image: emptyToNull(images.coverImage) ?? prev.cover_image,
    content_image: emptyToNull(images.contentImage),
    category_id: input.category_id,
    region: emptyToNull(input.region) ?? prev.region,
    status,
    published_at: resolvePublishedAt(status, prev.published_at, now),
    updated_at: now,
    author_id: input.author_id ?? prev.author_id,
    review_of_id: prev.review_of_id ?? null,
  };

  data.posts[index] = updated;
  await writeFile(data);
  return updated;
}
// 這裡是用來刪除文章的函式，會根據文章的 id 將其從資料中移除，並回傳刪除是否成功。
export async function deletePost(id: number): Promise<boolean> {
  const data = await readFile();
  const index = data.posts.findIndex((p) => p.id === id);
  if (index < 0) return false;

  data.posts.splice(index, 1);
  await writeFile(data);
  return true;
}
