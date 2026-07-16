"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterGuard() {
  // 取得目前網址路徑
  const pathname = usePathname();

  // 這裡放「不想顯示 footer 的路由」
  const hideFooterRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
  ];

  // 判斷目前頁面是不是在不要顯示 footer 的清單裡
  const shouldHideFooter = hideFooterRoutes.includes(pathname);

  // 如果是，就直接不渲染任何東西
  if (shouldHideFooter) return null;

  // 否則正常顯示 Footer
  return <Footer />;
}