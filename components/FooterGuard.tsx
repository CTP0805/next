"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterGuard() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  const hideFooterRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateIsMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

  const isHiddenRoute = hideFooterRoutes.includes(pathname);

  // 符合 /experiences/123，但不會誤判 /experiences/search
  const isExperienceDetailPage = /^\/experiences\/\d+\/?$/.test(pathname);

  const shouldHideFooter =
    isHiddenRoute || (isMobile && isExperienceDetailPage);

  if (shouldHideFooter) return null;

  return <Footer />;
}
