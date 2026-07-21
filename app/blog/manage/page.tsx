"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 舊路由：文章管理已移至會員中心 */
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
