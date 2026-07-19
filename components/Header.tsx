"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";

import { useAuth } from "@/contexts/auth-context"; // 引入你建立的 Context

export default function Navbar() {
  const { auth, isAuthenticated, logout } = useAuth(); // 直接使用 Context 提供的狀態與方法

  const navLinks = [
    { name: "部落格", href: "/blog" },
    { name: "體驗分類", href: "/categories" },
    { name: "品牌介紹", href: "/about" },
    { name: "聯絡我們", href: "/contact" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pathname = usePathname();
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
      className={`${navPosition} top-0 left-0 z-50 flex h-[60px] w-full items-center justify-between p-2 text-white xl:px-37.5 ${navStyle}`}
    >
      {/* 左側 Logo */}
      <div className="items-left relative flex aspect-square w-[20px] shrink-0 md:w-[40px]">
        <Link href="/">
          <Image
            src="/icon/logo.svg"
            alt="Logo"
            fill
            className="h-auto w-auto"
            priority
            sizes="(max-width: 768px) 20px, 40px"
          />
        </Link>
      </div>
      <div className="relative w-40 md:w-80">
        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="搜尋景點、地區或城市"
          className="h-[40px] w-full rounded-[25px] bg-gray-300/20 pr-4 pl-10 text-[16px] placeholder:text-white/70"
        />
      </div>
      {/* 中間導覽 */}
      <div className="hidden items-center md:flex">
        {navLinks.map((link, index) => (
          <div
            key={link.name}
            className="flex items-center border-r px-5 last:border-0"
          >
            <Link href={link.href} className="hover:text-gray-300">
              {link.name}
            </Link>
          </div>
        ))}
      </div>

      {/* 右側功能區 */}
      <ul className="hidden items-center md:flex">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link href="/member/profile" className="hover:text-gray-300">
              {auth.name} 會員中心
            </Link>
            <button onClick={logout} className="hover:text-gray-300">
              登出
            </button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </ul>
      {/* 在父容器中直接放置 dropdown，不被 relative md:hidden 限制 */}
      <div className="gap-1">
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <FaCartShopping />
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content fixed right-0 z-50 w-screen bg-white p-4 text-black shadow"
            >
              <li>
                <a>12</a>
              </li>
              <li>
                <a>22</a>
              </li>
              <li>
                <a>About</a>
              </li>
            </ul>
          </div>
        ) : null}
        <div className="dropdown dropdown-end md:hidden">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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

          {/* 使用 fixed 讓它直接脫離文檔流，實現滿版 */}
          <ul
            tabIndex={0}
            className="menu dropdown-content fixed right-0 z-50 w-screen bg-white p-4 text-black"
          >
            <li>
              <a>333</a>
            </li>
            <li>
              <a>Portfolio</a>
            </li>
            <li>
              <a>About</a>
            </li>
          </ul>
        </div>
        <div className="dropdown dropdown-end md:hidden">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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

          {/* 使用 fixed 讓它直接脫離文檔流，實現滿版 */}
          <ul
            tabIndex={0}
            className="menu dropdown-content fixed right-0 z-50 w-screen bg-white p-4 text-black"
          >
            <li>
              <a>Homepage</a>
            </li>
            <li>
              <a>Portfolio</a>
            </li>
            <li>
              <a>About</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
