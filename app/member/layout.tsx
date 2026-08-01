"use client";

import MemberPanel from "@/components/MemberPanel";
import MemberMobileHeader from "@/components/MemberMobileHeader";
import { usePathname } from "next/navigation";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // 判別是否為手機版頁面  /member 是手機版選單首頁
  const isMemberHome = pathname === "/member";

  return (
    <div className="min-h-screen   md:px-6 md:py-6 md:pb-50">
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
