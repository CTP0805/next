"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import BlogPostForm from "../_components/BlogPostForm";

export default function BlogNewPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <nav className="text-sm text-gray-500" aria-label="麵包屑">
              <Link href="/blog" className="font-medium text-teal-600 hover:underline">
                部落格
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-700">新增文章</span>
            </nav>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              新增旅遊文章
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              填寫標題與內容後即可儲存，並可設定上架狀態
            </p>
          </div>
          <Link
            href="/blog"
            className="rounded-[12px] border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
          >
            返回列表
          </Link>
        </div>

        <div className="rounded-[12px] border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <BlogPostForm
            mode="create"
            onSuccess={(post) => {
              router.push(`/blog/${post.slug}`);
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
}
