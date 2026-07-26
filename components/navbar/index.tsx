"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/cart";
import { useAuth } from "@/contexts/auth-context";
import {
  FaCartShopping,
  FaUser,
  FaAward,
  FaBagShopping,
  FaTicket,
  FaCommentDots,
  FaHeart,
  FaClockRotateLeft,
} from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";

import type { MemberList, NavLink } from "@/types/navbar";
import SearchBar from "./SearchBar";
import NavLinks from "./NavLinks";
import CartDropdown from "./CartDropdown";
import MemberMenu from "./MemberMenu";

export default function Navbar() {
  const { auth, isAuthenticated, logout } = useAuth();
  const { totalQty } = useCart();
  const pathname = usePathname();

  const navLinks: NavLink[] = [
    { name: "所有體驗", href: "/experiences/search" },
    { name: "品牌介紹", href: "/about" },
    { name: "部落格", href: "/blog" },
    { name: "聯絡我們", href: "/contact" },
  ];

  const memberLists: MemberList[] = [
    { label: "會員資料", icon: <FaUser />, href: "/member/profile" },
    { label: "會員等級", icon: <FaAward />, href: "/member/level" },
    { label: "我的訂單", icon: <FaBagShopping />, href: "/member/order" },
    { label: "我的優惠", icon: <FaTicket />, href: "/member/coupon" },
    { label: "我的評價", icon: <FaCommentDots />, href: "/member/review" },
    { label: "心願清單", icon: <FaHeart />, href: "/member/favorites" },
    {
      label: "最近瀏覽",
      icon: <FaClockRotateLeft />,
      href: "/member/recently-viewed",
    },
  ];

  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isHomePage) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0.1);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const navStyle = isHomePage && !isScrolled ? "bg-white/20" : "bg-[#45cad5]";
  const navPosition = isHomePage ? "fixed" : "sticky";

  return (
    <nav
      className={`${navPosition} top-0 left-0 z-50 box-border flex h-[60px] w-full items-center justify-between p-2 text-white xl:px-37.5 ${navStyle}`}
    >
      {/* 1. 左側 Logo */}
      <div className="items-left relative flex aspect-square h-[40px] w-[40px] shrink-0">
        <Link href="/" className="absolute inset-0">
          <Image
            src="/icon/logo.svg"
            alt="Logo"
            fill
            priority
            sizes="(max-width: 768px) 20px, 40px"
          />
        </Link>
      </div>

      {/* 2. 搜尋欄 */}
      <SearchBar />

      {/* 3. 中間導覽 (桌面版) */}
      <NavLinks links={navLinks} />

      {/* 4. 右側功能區 (桌面版) */}
      <ul className="hidden items-center md:flex">
        {isAuthenticated && <CartDropdown />}

        {isAuthenticated ? (
          <MemberMenu auth={auth} logout={logout} memberLists={memberLists} />
        ) : (
          <li className="flex items-center">
            <div className="px-2">
              <Link href="/auth/login" className="hover:text-gray-300">
                登入
              </Link>
            </div>
            <span>/</span>
            <div className="px-2">
              <Link href="/auth/register" className="hover:text-gray-300">
                註冊
              </Link>
            </div>
          </li>
        )}
      </ul>

      {/* 5. 行動版選單區域 (md:hidden) */}
      <div className="flex items-center gap-2 md:hidden">
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

        {isAuthenticated && (
          <Link
            href="/member/profile"
            className="btn btn-ghost btn-circle text-white"
          >
            <FaUser className="text-lg" />
          </Link>
        )}

        {/* 手機版漢堡選單 Dropdown */}
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
            className="menu dropdown-content fixed right-0 z-50 bg-white p-4 text-black shadow-xl"
          >
            {!isAuthenticated && (
              <>
                <li>
                  <Link href="/auth/login">登入</Link>
                </li>
                <li>
                  <Link href="/auth/register">註冊</Link>
                </li>
                <div className="my-2 border-t border-gray-100"></div>
              </>
            )}

            {navLinks.map((v) => (
              <li key={v.href}>
                <Link href={v.href}>{v.name}</Link>
              </li>
            ))}

            {isAuthenticated && (
              <>
                <div className="my-2 border-t border-gray-100"></div>
                {memberLists.map((v) => (
                  <li key={v.href}>
                    <Link href={v.href} className="flex items-center gap-2">
                      {v.icon}
                      <span>{v.label}</span>
                    </Link>
                  </li>
                ))}
                <li className="mt-2 border-t border-gray-100 pt-2">
                  <button
                    onClick={logout}
                    className="flex w-full items-center text-red-500"
                  >
                    <FiLogOut className="mr-2" />
                    <span>登出</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
