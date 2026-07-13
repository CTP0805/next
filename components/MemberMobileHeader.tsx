"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

// 這裡集中管理「網址」對應「手機版標題」
// 之後如果你新增 /member/coupon，只要在這裡加一筆就好
const memberPageTitles: Record<string, string> = {
  "/member/profile": "會員資料",
  "/member/level": "會員等級",
  "/member/order": "我的訂單",
  "/member/coupon": "我的優惠",
  "/member/review": "我的評論",
  "/member/favorites": "心願清單",
  "/member/recently-viewed": "最近瀏覽",
};

export default function MemberMobileHeader() {
  // 取得目前網址，例如 /member/profile
  const pathname = usePathname();

  // 如果目前網址有在 memberPageTitles 裡，就拿對應標題
  // 如果沒有，就給一個預設標題「會員中心」
  const title = memberPageTitles[pathname] ?? "會員中心";

  return (
    <header className="flex h-[82px] items-center justify-center border-b border-zinc-100 bg-white px-5 md:hidden">
      {/* 
        左邊返回按鈕

        absolute 是為了讓箭頭固定在左邊
        中間標題可以真的置中，不會被箭頭推歪
      */}
      <Link
        href="/member"
        aria-label="返回會員選單"
        className="absolute left-5 flex h-10 w-10 items-center justify-center text-xl text-black"
      >
        <FaArrowLeft />
      </Link>

      {/* 中間標題 */}
      <p className="text-[20px] text-black">{title}</p>
    </header>
  );
}
