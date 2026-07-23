"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 【新手】舊網址 /blog/review → 轉到 /member/blog-review（管理者審核）
 */
export default function BlogReviewRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/member/blog-review");
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
      文章審查已移至會員中心，正在導向…
    </div>
  );
}
