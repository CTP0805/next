"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUser,
  FaAward,
  FaBagShopping,
  FaTicket,
  FaCommentDots,
  FaHeart,
  FaClockRotateLeft,
  FaCamera,
} from "react-icons/fa6";

type MemberList = {
  label: string;
  icon: ReactNode;
  href: string;
};

const memberLists: MemberList[] = [
  {
    label: "會員資料",
    icon: <FaUser />,
    href: "/member/profile",
  },
  {
    label: "會員等級",
    icon: <FaAward />,
    href: "/member/level",
  },
  {
    label: "我的訂單",
    icon: <FaBagShopping />,
    href: "/member/order",
  },
  {
    label: "我的優惠",
    icon: <FaTicket />,
    href: "/member/coupon",
  },
  {
    label: "我的評價",
    icon: <FaCommentDots />,
    href: "/member/review",
  },
  {
    label: "心願清單",
    icon: <FaHeart />,
    href: "/member/favorites",
  },
  {
    label: "最近瀏覽",
    icon: <FaClockRotateLeft />,
    href: "/member/recently-viewed",
  },
];

export default function MemberPanel() {
  // 取得目前瀏覽器網址的 pathname
  // 例如網址是 /member/profile，pathname 就會是 "/member/profile"
  const pathname = usePathname();

  return (
    <aside className="w-[340px] overflow-hidden rounded-[12px] border border-zinc-200 bg-white shadow-xl">
      {/* 上方會員頭像區 */}
      <div className="flex flex-col items-center px-6 pt-10 pb-6">
        <div className="relative">
          <img
            src="/images/avatar-test.png"
            alt="會員頭像"
            className="h-[105px] w-[105px] rounded-full object-cover"
          />

          <button
            type="button"
            aria-label="更換頭像"
            className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:scale-105 hover:cursor-pointer hover:bg-zinc-100"
          >
            <FaCamera className="text-sm" />
          </button>
        </div>

        <h2 className="mt-3 text-[30px] leading-none font-bold text-black">
          王大明
        </h2>
      </div>

      <div className="h-px bg-zinc-200" />

      <nav>
        {memberLists.map((item) => {
          // 判斷目前網址是不是這個選單的網址
          // pathname === item.href：完全一樣，例如 /member/profile
          // pathname.startsWith(`${item.href}/`)：子頁面也算 active，例如 /member/profile/edit
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-[60px] items-center gap-3 border-b border-zinc-200 px-7 text-[17px] transition hover:bg-zinc-50 ${
                isActive ? "text-[#68BBC3]" : "text-zinc-400"
              }`}
            >
              <span className="flex w-5 items-center justify-center text-xl">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
