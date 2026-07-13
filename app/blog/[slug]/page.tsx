// app/blog/[slug]/page.tsx
import React from "react";
import blogData from "@/data/blogPosts.json";
import Link from "next/link";
import Image from "next/image";
import RichTextContent from "@/components/RichTextContent";
import BlogCommentSection from "../_components/BlogCommentSection";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
  region: string;
  category_id: number;
}

const categoryMap: Record<number, string> = {
  1: "古蹟巡禮",
  2: "藝文導覽",
  3: "美饌饗宴",
  4: "戶外探索",
  5: "專人攝影",
  6: "娛樂與夜生活",
};

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = blogData.posts.find((p: BlogPost) => p.slug === slug) as
    BlogPost | undefined;

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">文章不存在</h1>
        <p className="mb-8 text-gray-600">
          找不到 slug 為 <span className="font-mono text-red-500">{slug}</span>{" "}
          的文章
        </p>
        <Link
          href="/blog"
          className="rounded-2xl bg-teal-600 px-6 py-3 text-white transition hover:bg-teal-700"
        >
          返回文章列表
        </Link>
      </div>
    );
  }

  const recommendations = blogData.posts
    .filter((p: BlogPost) => p.region === post.region && p.slug !== post.slug)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* 左側主要內容 */}
        <div className="lg:col-span-8">
          {/* 標籤 */}
          <div className="mb-6 flex flex-wrap gap-3">
            <span className="rounded-2xl bg-teal-100 px-5 py-2 text-sm font-medium text-teal-700">
              {post.region}
            </span>
            <span className="rounded-2xl bg-amber-100 px-5 py-2 text-sm font-medium text-amber-700">
              {categoryMap[post.category_id] || "其他"}
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
            {post.title}
          </h1>

          <div className="mb-10 flex items-center gap-4 text-sm text-gray-500">
            <span>
              發布於{" "}
              {new Date(post.published_at).toLocaleDateString("zh-TW", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            <span>作者：MaoDay 編輯部</span>
          </div>

          <div className="relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-3xl shadow-lg">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
          </div>

          {/* 文章內容 - 使用 RichTextContent 元件 */}
          <article className="prose prose-lg prose-headings:font-bold prose-a:text-teal-600 max-w-none">
            <RichTextContent content={post.content} />
          </article>

          <BlogCommentSection postSlug={post.slug} />
        </div>

        {/* 右側推薦文章 */}
        <div className="lg:col-span-4">
          <div className="sticky top-28">
            <h3 className="mb-8 border-b pb-4 text-2xl font-bold">推薦閱讀</h3>

            <div className="space-y-10">
              {recommendations.length > 0 ? (
                recommendations.map((rec: BlogPost) => (
                  <Link
                    href={`/blog/${rec.slug}`}
                    key={rec.id}
                    className="group block"
                  >
                    <div className="relative mb-4 aspect-[4/3] min-h-[240px] overflow-hidden rounded-2xl">
                      <Image
                        src={rec.cover_image}
                        alt={rec.title}
                        fill
                        className="object-cover object-center transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs">
                        <span className="font-medium text-teal-600">
                          {rec.region}
                        </span>
                        <span className="text-amber-600">
                          ・{categoryMap[rec.category_id]}
                        </span>
                      </div>
                      <h4 className="mb-2 text-lg leading-tight font-semibold transition-colors group-hover:text-teal-600">
                        {rec.title}
                      </h4>
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {rec.excerpt}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">目前沒有更多推薦文章</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
