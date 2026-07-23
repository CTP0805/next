"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 【新手】舊網址 /blog/manage → 自動轉到會員中心 /member/edit-post
 * 真正管理 UI 不在這裡，在 member/edit-post/page.tsx
 */
export default function BlogManageRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/member/edit-post");
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
      文章管理已移至會員中心，正在導向…
    </div>
  );
}
