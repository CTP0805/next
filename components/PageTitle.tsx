"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// 「網址」對應「瀏覽器分頁名稱」
const pageTitles: Record<string, string> = {
  "/": "首頁",
  "/cart": "購物車",
  "/checkout": "填寫資料",
  "/payment": "選擇付款",
  "/success": "付款成功",
  "/member": "會員中心",
  "/member/profile": "會員資料",
  "/member/level": "會員等級",
  "/member/order": "我的訂單",
  "/member/coupon": "我的優惠",
  "/member/review": "我的評價",
  "/member/favorites": "心願清單",
  "/member/recently-viewed": "最近瀏覽",
  "/member/edit-post": "管理文章",
  "/auth/login": "登入",
  "/auth/register": "註冊",
  "/auth/forgot-password": "忘記密碼",
  "/auth/reset-password": "重設密碼",
  "/blog": "部落格",
  "/blog/manage": "文章管理",
  "/experiences/search": "探索體驗",
  "/about": "關於我們",
  "/points": "M幣說明",
  "/admin/chat": "客服聊天室",
};

export function PageTitle() {
  // 取得目前網址，例如 /cart
  const pathname = usePathname();

  useEffect(() => {
    
    const pageTitle = pageTitles[pathname] ;

    // 動態文章頁已由 app/blog/[slug]/page.tsx 的
    // generateMetadata 設定文章標題，因此這裡不要覆蓋它
    if (pathname.startsWith("/blog/") && !pageTitle) {
      return;
    }
    // 已由 experiences/[id] 設定 title 內容
    if (pathname.startsWith("/experiences/") && !pageTitle) {
      return;
    }

    // 真正修改瀏覽器的 <title> 內容
    document.title = `${pageTitle ?? ""}｜Meet Locals`;
}, [pathname]); // 使用者換頁時，重新設定標題

  return null; // 這個元件不需要顯示任何畫面
}
