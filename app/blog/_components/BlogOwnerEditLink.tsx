"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

/**
 * 僅文章作者本人可見的「編輯」連結
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
