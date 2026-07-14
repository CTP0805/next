import { promises as fs } from "fs";
import path from "path";
import type {
  BlogPost,
  BlogPostInput,
  BlogPostStatus,
  BlogPostsFile,
} from "./types";
import {
  BLOG_TITLE_MAX,
  resolvePublishedAt,
  slugifyTitle,
} from "./types";

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
    published_at:
      status === "published" ? (raw.published_at ?? null) : null,
    updated_at: raw.updated_at ?? new Date().toISOString(),
    status,
    region: raw.region ?? null,
  };
}

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
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getPostById(id: number): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.id === id) ?? null;
}

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

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const t = value.trim();
  return t ? t : null;
}

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

  const post: BlogPost = {
    id: nextId,
    author_id: input.author_id ?? 1,
    category_id: input.category_id,
    title,
    slug: uniqueSlug(data.posts, desired),
    content: input.content,
    excerpt: emptyToNull(input.excerpt),
    cover_image: emptyToNull(input.cover_image),
    content_image: emptyToNull(input.content_image),
    published_at: resolvePublishedAt(status, null, now),
    updated_at: now,
    status,
    region: emptyToNull(input.region),
  };

  data.posts.unshift(post);
  await writeFile(data);
  return post;
}

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

  const status: BlogPostStatus = input.status ?? prev.status;
  const now = new Date().toISOString();
  const desired = input.slug?.trim()
    ? slugifyTitle(input.slug)
    : slugifyTitle(title);

  const updated: BlogPost = {
    ...prev,
    title,
    slug: uniqueSlug(data.posts, desired, id),
    content: input.content,
    excerpt: emptyToNull(input.excerpt),
    cover_image: emptyToNull(input.cover_image) ?? prev.cover_image,
    content_image: emptyToNull(input.content_image),
    category_id: input.category_id,
    region: emptyToNull(input.region) ?? prev.region,
    status,
    published_at: resolvePublishedAt(status, prev.published_at, now),
    updated_at: now,
    author_id: input.author_id ?? prev.author_id,
  };

  data.posts[index] = updated;
  await writeFile(data);
  return updated;
}

export async function deletePost(id: number): Promise<boolean> {
  const data = await readFile();
  const index = data.posts.findIndex((p) => p.id === id);
  if (index < 0) return false;

  data.posts.splice(index, 1);
  await writeFile(data);
  return true;
}
