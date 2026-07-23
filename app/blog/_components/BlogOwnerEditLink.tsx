"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

/**
 * 【新手】只有「登入且 authorId === 自己」才顯示編輯連結
 * 別人看到的畫面不會出現這顆按鈕
 */
export default function BlogOwnerEditLink({
  authorId,
  href,
  className,
  children = "編輯此文",
}: {
  authorId: number;
  href: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { auth, authInit, isAuthenticated } = useAuth();

  if (!authInit || !isAuthenticated) return null;
  if (Number(auth.id) !== Number(authorId)) return null;

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
