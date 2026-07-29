"use client";

import Link from "next/link";
import { useState } from "react";
import { FaCartShopping, FaUser, FaChevronDown } from "react-icons/fa6";
import type { NavLink } from "@/types/navbar";

type MobileMenuProps = {
  isAuthenticated: boolean;
  totalQty: number;
  navLinks: NavLink[];
  logout: () => void;
};

const features = [
  { name: "古蹟巡禮", href: "/experiences/search?category_ids=1" },
  { name: "藝文導覽", href: "/experiences/search?category_ids=2" },
  { name: "美饌饗宴", href: "/experiences/search?category_ids=3" },
  { name: "戶外探索", href: "/experiences/search?category_ids=4" },
  { name: "專人攝影", href: "/experiences/search?category_ids=5" },
  { name: "娛樂與夜生活", href: "/experiences/search?category_ids=6" },
];

const destinations = [
  { name: "倫敦", href: "/experiences/search?city=倫敦" },
  { name: "巴黎", href: "/experiences/search?city=巴黎" },
  { name: "慕尼黑", href: "/experiences/search?city=慕尼黑" },
  { name: "阿姆斯特丹", href: "/experiences/search?city=阿姆斯特丹" },
  { name: "威尼斯", href: "/experiences/search?city=威尼斯" },
  { name: "巴塞隆納", href: "/experiences/search?city=巴塞隆納" },
];

export default function MobileMenu({
  isAuthenticated,
  totalQty,
  navLinks,
  logout,
}: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 控制整個漢堡選單
  const [isExperienceOpen, setIsExperienceOpen] = useState(false); // 控制「所有體驗」

  // 關閉整個選單（點擊連結時呼叫）
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsExperienceOpen(false);
  };

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

      {/* 漢堡選單（改成自己控制開關） */}
      <div className="relative">
        {/* 漢堡按鈕 */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
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
        </button>

        {/* 選單內容 */}
        {isMenuOpen && (
          <ul className="fixed top-16 right-0 left-0 z-50 w-screen bg-white p-4 text-[#ACACAC] shadow-xl">
            {!isAuthenticated && (
              <>
                <li>
                  <Link
                    href="/auth/login"
                    onClick={closeMenu}
                    className="text-[#ACACAC]hover:bg-zinc-50 item-center flex w-full items-center border-gray-100 pt-3 pb-1"
                  >
                    登入
                  </Link>
                </li>
                <div className=" border-t border-gray-100" />

                <li>
                  <Link
                    href="/auth/register"
                    onClick={closeMenu}
                    className="flex w-full items-center py-1.5 text-[#ACACAC]"
                  >
                    註冊
                  </Link>
                </li>
                <div className="mb-2 border-t border-gray-100" />
              </>
            )}

            {/* ===== 所有體驗 按鈕 ===== */}
            <li>
              <button
                onClick={() => setIsExperienceOpen((prev) => !prev)}
                className="flex w-full items-center gap-2"
              >
                所有體驗
                <FaChevronDown
                  className={`text-xs transition-transform duration-200 ${
                    isExperienceOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </li>

            {/* ===== 展開：分類 + 熱門地區 並排 ===== */}
            {isExperienceOpen && (
              <div className="my-3 grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-3 text-left">
                {/* 左欄：分類 */}
                <div>
                  <div className="mb-2 text-sm font-semibold text-gray-800">
                    分類
                  </div>
                  <div className="flex flex-col gap-1">
                    {features.map((v) => (
                      <Link
                        key={v.name}
                        href={v.href}
                        onClick={closeMenu}
                        className="block rounded-lg py-1.5 text-[#ACACAC] hover:bg-white"
                      >
                        {v.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 右欄：熱門地區 */}
                <div>
                  <div className="mb-2 text-sm font-semibold text-gray-800">
                    熱門地區
                  </div>
                  <div className="flex flex-col gap-1">
                    {destinations.map((v) => (
                      <Link
                        key={v.name}
                        href={v.href}
                        onClick={closeMenu}
                        className="block rounded-lg py-1.5 text-[#ACACAC] hover:bg-white"
                      >
                        {v.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 原本的 navLinks */}
            {navLinks.map((v) => (
              <li key={v.href} className="mt-2 border-t border-gray-100 pt-2">
                <Link href={v.href} onClick={closeMenu}>
                  {v.name}
                </Link>
              </li>
            ))}

            {isAuthenticated && (
              <li className="mt-2 border-t border-gray-100 pt-2">
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  登出
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
