"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";
import type { MemberList } from "@/types/navbar";
 type Auth = {
  id: number;
  name: string;
  email: string;
  phone: string;
  member_level?: string;
  current_points?: number;
  role?: string;
  avatar_url?: string | null;
  gender?: string;
  birthday?: string;
};

type MemberMenuProps = {
  auth: Auth|null;
   
  logout: () => void;
  memberLists: MemberList[];
};
export default function MemberMenu({
  auth,
  logout,
  memberLists,
}: MemberMenuProps) {
  const [open, setOpen] = useState(false);
  if (!auth) {
    return null;
  }

  // 處理頭像網址的函式
  const getAvatarUrl = (avatarUrl?: string | null) => {
    if (!avatarUrl) return "/images/member-avatar/angry-man.jpg";

    // 如果已經是完整網址 (http:// 或 https://)，直接回傳
    if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
      return avatarUrl;
    }

    // 否則視為相對路徑，補上 API 主機位置
    return `http://localhost:3001${avatarUrl}`;
  };
  return (
    <li
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="dropdown dropdown-end dropdown-hover relative"
    >
      <div
        tabIndex={0}
        className="relative flex cursor-pointer items-center gap-2 px-3 py-2"
      >
        <div className="absolute top-full right-0 h-4 w-full bg-transparent"></div>

        <Image
          src={getAvatarUrl(auth.avatar_url)}
          alt={auth.name || "User Avatar"}
          className="h-8 w-8 rounded-full object-cover"
          width={32}
          height={32}
        />
        <span className="text-sm">{auth.name || "會員"} 你好～</span>
      </div>

      <ul
        tabIndex={0}
        className={`dropdown-content menu rounded-box z-[60] mt-2 w-56 bg-white p-2 text-black shadow-xl ${open ? "block" : "hidden"} `}
      >
        <li className="pointer-events-none mb-2 border-b border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <Image
              src={getAvatarUrl(auth.avatar_url)}
              alt="用戶頭像"
              width={48}
              height={48}
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold">{auth.name || "王大明"}</div>
              <div className="flex items-center gap-1.5 text-sm text-orange-400">
                <span>{auth.member_level}</span>
              </div>
            </div>
          </div>
        </li>

        {memberLists.map((v) => (
          <li key={v.href}>
            <Link
              onClick={() => setOpen(false)}
              href={v.href}
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-[#ACACAC] hover:bg-zinc-50"
            >
              {v.icon}
              <span>{v.label}</span>
            </Link>
          </li>
        ))}

        <li className="mt-2 border-t border-gray-200 pt-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-[#ACACAC] hover:bg-zinc-50"
          >
            <FiLogOut /> <span>登出</span>
          </button>
        </li>
      </ul>
    </li>
  );
}
