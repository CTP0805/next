"use client";

import MemberPanel from "@/components/MemberPanel";
import MemberMobileHeader from "@/components/MemberMobileHeader";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // const router = useRouter();

  // // 從全站 AuthContext 取得登入狀態。
  // const { authInit, isAuthenticated } = useAuth();

  // // /member 本身與所有子頁都會經過這個 layout。
  // // 所以只要寫一次，就能保護：
  // // /member
  // // /member/profile
  // // /member/order
  // // /member/favorites
  // // ...等所有會員頁。
  // useEffect(() => {
  //   // 還在問後端時，不要急著跳轉。
  //   if (!authInit) {
  //     return;
  //   }

  //   // 後端已確認未登入，導向登入頁。
  //   if (!isAuthenticated) {
  //     toast.error("尚未登入 已為您重新導向");
  //     const loginUrl = `/auth/login?next=${encodeURIComponent(pathname)}`;
  //     router.replace(loginUrl);
  //   }
  // }, [authInit, isAuthenticated, pathname, router]);

  // // 等待後端確認 Cookie 的期間，顯示載入畫面。
  // // 這能避免會員頁內容短暫閃出來。
  // if (!authInit) {
  //   return (
  //     <Loading/>
  //   );
  // }

  // // 已確認未登入時，等待 useEffect 導頁。
  // if (!isAuthenticated) {
  //   return null;
  // }

  // 判別是否為手機版頁面  /member 是手機版選單首頁
  const isMemberHome = pathname === "/member";

  return (
    <div className="min-h-screen   md:px-6 md:py-6">
      <div className="mx-auto flex w-full max-w-[1280px]  justify-center gap-6 md:items-start md:w-[80%]">
        {/* 
          手機版：
          /member 顯示滿版選單
          /member/profile 隱藏選單

          桌機版：
          永遠顯示左側選單
        */}
        <aside
          className={` ${isMemberHome ? "block" : "hidden"} w-full md:block md:w-auto md:shrink-0`}
        >
          <MemberPanel />
        </aside>

        {/* 
          手機版：
          /member 隱藏右側內容
          /member/profile 顯示內容

          桌機版：
          永遠顯示右側內容
        */}
        <section
          className={` ${isMemberHome ? "hidden" : "block"} min-h-screen w-full bg-white px-4 pb-4 md:block md:flex-1 md:overflow-hidden md:rounded-[12px] md:border md:border-zinc-200 md:px-16 md:py-10 md:shadow-xl`}
        >
          {!isMemberHome && <MemberMobileHeader />}

          {children}
        </section>
      </div>
    </div>
  );
}
