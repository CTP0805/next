"use client";

/**
 * =============================================================================
 * 【新手導讀】編輯文章 `/blog/[slug]/edit`
 * =============================================================================
 * 1) 確認已登入  2) 用 slug 從「我的文章」找到 post
 * 3) 必須是作者本人  4) 交給 BlogPostEditor 編輯
 * =============================================================================
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import BlogPostEditor from "../../_components/BlogPostEditor";
import { fetchMyBlogPosts } from "../../_lib/api";
import type { BlogPost } from "../../_lib/types";

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const { auth, authInit, isAuthenticated } = useAuth();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!slug || !authInit) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setForbidden(false);
      try {
        if (!isAuthenticated) {
          if (!cancelled) {
            setError("請先登入後再編輯文章");
            setPost(null);
          }
          return;
        }

        // ⭐ 只從「我的文章」載入（含草稿／待審／退回）
        if (auth.role === "管理者") {
          if (!cancelled) {
            setForbidden(true);
            setError("管理者不可編輯文章內容，請至文章審查");
            setPost(null);
          }
          return;
        }

        const posts = await fetchMyBlogPosts();
        const found = posts.find((p) => p.slug === slug) ?? null;
        if (cancelled) return;
        if (!found) {
          setError("找不到這篇文章");
          setPost(null);
          return;
        }
        if (Number(found.author_id) !== Number(auth.id)) {
          setForbidden(true);
          setError("只能修改自己的文章");
          setPost(null);
          return;
        }
        setPost(found);
      } catch {
        if (!cancelled) setError("載入失敗");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, authInit, isAuthenticated, auth.id, auth.role]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <nav className="text-sm text-gray-500" aria-label="麵包屑">
              <Link
                href="/blog"
                className="font-medium text-teal-600 hover:underline"
              >
                部落格
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              {slug ? (
                <Link
                  href={`/blog/${slug}`}
                  className="font-medium text-teal-600 hover:underline"
                >
                  文章
                </Link>
              ) : (
                <span>文章</span>
              )}
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-700">編輯</span>
            </nav>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              編輯旅遊文章
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              僅文章作者本人可修改並寫回 posts 表
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/blog"
              className="rounded-[12px] border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              返回列表
            </Link>
          </div>
        </div>

        <div className="rounded-[12px] border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          {loading || !authInit ? (
            <div className="space-y-4 py-8">
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
              <div className="h-12 animate-pulse rounded-[12px] bg-gray-100" />
              <div className="h-12 animate-pulse rounded-[12px] bg-gray-100" />
              <div className="h-40 animate-pulse rounded-[12px] bg-gray-100" />
            </div>
          ) : error || !post ? (
            <div className="py-16 text-center">
              <p
                className={`mb-4 ${forbidden ? "text-red-600" : "text-gray-600"}`}
              >
                {error || "找不到文章"}
              </p>
              <Link
                href="/blog"
                className="inline-flex rounded-[12px] bg-[#45cad5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#36b3be]"
              >
                回列表
              </Link>
            </div>
          ) : (
            <BlogPostEditor
              key={post.id}
              mode="edit"
              variant="standalone"
              initial={post}
              onSuccess={(updated) => {
                router.push(
                  updated.status === "published"
                    ? `/blog/${updated.slug}`
                    : "/member/edit-post",
                );
                router.refresh();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
