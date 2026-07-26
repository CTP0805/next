"use client";

import Link from "next/link";
import { FaCartShopping, FaUser } from "react-icons/fa6";
import type { NavLink } from "@/types/navbar";

type MobileMenuProps = {
  isAuthenticated: boolean;
  totalQty: number;
  navLinks: NavLink[];
  logout: () => void;
};

export default function MobileMenu({
  isAuthenticated,
  totalQty,
  navLinks,
  logout,
}: MobileMenuProps) {
  return (
    <div className="flex items-center gap-2 md:hidden">
      {/* 購物車 */}
      {isAuthenticated && (
        <Link
          href="/cart"
          className="btn btn-ghost btn-circle relative text-white"
        >
          <FaCartShopping className="text-lg" />

          {totalQty > 0 && (
            <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {totalQty}
            </span>
          )}
        </Link>
      )}

      {/* 會員 */}
      {isAuthenticated && (
        <Link
          href="/member/profile"
          className="btn btn-ghost btn-circle text-white"
        >
          <FaUser className="text-lg" />
        </Link>
      )}

      {/* 漢堡選單 */}
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </div>

        <ul
          tabIndex={0}
          className="menu dropdown-content fixed right-0 z-50 bg-white p-4 text-[#ACACAC] shadow-xl"
        >
          {!isAuthenticated && (
            <>
              <li>
                <Link href="/auth/login">登入</Link>
              </li>

              <li>
                <Link href="/auth/register">註冊</Link>
              </li>

              <div className="my-2 border-t border-gray-100" />
            </>
          )}

          {navLinks.map((v) => (
            <li key={v.href}>
              <Link
                onClick={() => {
                  const elem = document.activeElement as HTMLElement;

                  elem?.blur();
                }}
                href={v.href}
              >
                {v.name}
              </Link>
            </li>
          ))}

          {isAuthenticated && (
            <li className="mt-2 border-t border-gray-100 pt-2">
              <button onClick={logout}>登出</button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
