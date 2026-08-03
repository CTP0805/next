"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import Loading from "@/components/Loading";

interface AuthRouteGuardProps {
  children: ReactNode;
}

// 已登入者不需要進入的頁面
const GUEST_ONLY_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

// 未登入者不能進入的頁面
const LOGIN_REQUIRED_PATHS = ["/cart", "/checkout", "/payment", "/success"];

/**
 * 只允許跳往本站內部網址。
 * 避免 next 被塞進外部網址，造成安全問題。
 */
function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export function AuthRouteGuard({ children }: AuthRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { authInit, isAuthenticated, isLoggingOut, showToast } = useAuth();

  // 記住這次已經提示過的受保護路徑，避免 Toast 重複跳出
  const redirectedPathRef = useRef<string | null>(null);

  const isGuestOnlyPage = GUEST_ONLY_PATHS.includes(pathname);

  // /member 和底下全部頁面都需要登入
  const isMemberPage = pathname.startsWith("/member");

  const isLoginRequiredPage =
    isMemberPage || LOGIN_REQUIRED_PATHS.includes(pathname);

  // 例如 /checkout?order_id=123，要連 query string 一起保留
  const queryString = searchParams.toString();

  const currentPath = queryString ? `${pathname}?${queryString}` : pathname;

  // 例如 /auth/login?next=%2Fmember，取得 /member
  const nextPath = getSafeNextPath(searchParams.get("next"));

  useEffect(() => {
    // 還在詢問後端 /api/auth/me 時，不先做導向
    if (!authInit) {
      return;
    }

    // 已登入者來到登入、註冊、忘記密碼：
    // 有 next 就回原頁，沒有 next 才回首頁。
    if (isAuthenticated && isGuestOnlyPage) {
      router.replace(nextPath);
      return;
    }

    // 未登入者想進受保護頁面
    if (!isAuthenticated && isLoginRequiredPage) {
      // 使用者剛按登出，首頁正在跳轉中，不提示也不搶著導去登入頁
      if (isLoggingOut) {
        if(!showToast){
          return;
        } 
        toast.success("登出成功");
        return;
      }
      
      // 同一個路徑只顯示一次提示
      if (redirectedPathRef.current !== currentPath) {
        toast.error("尚未登入 已重新為您導向");
        redirectedPathRef.current = currentPath;
      }

      router.replace(`/auth/login?next=${encodeURIComponent(currentPath)}`);
      return;
    }

    // 已離開受保護頁面，允許下次需要時再次顯示提示
    redirectedPathRef.current = null;
  }, [
    authInit,
    currentPath,
    isAuthenticated,
    isGuestOnlyPage,
    isLoginRequiredPage,
    nextPath,
    router,
  ]);

  // 驗證期間不先顯示頁面，避免會員資料閃現
  if (!authInit && (isGuestOnlyPage || isLoginRequiredPage)) {
    return <Loading />;
  }

  // 等待 redirect 完成時，不顯示不該看到的內容
  if (authInit && isAuthenticated && isGuestOnlyPage) {
    return null;
  }

  if (authInit && !isAuthenticated && isLoginRequiredPage) {
    return null;
  }

  return <>{children}</>;
}
