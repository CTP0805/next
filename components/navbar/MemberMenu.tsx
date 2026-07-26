"use client";
import Link from "next/link";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";
import type { MemberList } from "@/types/navbar";

type MemberMenuProps = {
  auth: { name?: string };
  logout: () => void;
  memberLists: MemberList[];
};

export default function MemberMenu({
  auth,
  logout,
  memberLists,
}: MemberMenuProps) {
  return (
    <li className="dropdown dropdown-end dropdown-hover relative p-4 pr-0">
      <div
        tabIndex={0}
        className="flex cursor-pointer items-center gap-2 rounded-lg p-4 hover:bg-white/10"
      >
        <Image
          src="/images/avatar-test.png"
          alt={auth.name || "User Avatar"}
          className="h-8 w-8 rounded-full object-cover"
          width={32}
          height={32}
        />
        <span className="text-sm">{auth.name || "會員"} 你好～</span>
      </div>

      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box z-[60] mt-2 w-56 bg-white p-2 text-black shadow-xl"
      >
        <li className="mb-2 border-b">
          <div className="flex items-center gap-3 px-4 py-3">
            <Image
              src="/images/avatar-test.png"
              alt="用戶頭像"
              width={48}
              height={48}
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold">{auth.name || "王大明"}</div>
              <div className="flex items-center gap-1.5 text-sm text-orange-400">
                Lv.3 鑽石會員 <span>👑</span>
              </div>
            </div>
          </div>
        </li>

        {memberLists.map((v) => (
          <li key={v.href}>
            <Link
              onClick={() => {
                const elem = document.activeElement as HTMLElement;
                if (elem) elem.blur();
              }}
              href={v.href}
              className="flex items-center gap-3 rounded-lg px-4 py-2 hover:bg-blue-600 hover:text-white"
            >
              {v.icon}
              <span>{v.label}</span>
            </Link>
          </li>
        ))}

        <li className="mt-2 border-t border-gray-200 pt-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 hover:bg-red-600 hover:text-white"
          >
            <FiLogOut /> <span>登出</span>
          </button>
        </li>
      </ul>
    </li>
  );
}
