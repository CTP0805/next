"use client";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context"; // 引入你建立的 Context
import { usePathname } from "next/navigation";
import { FaSearch } from "react-icons/fa";
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
import { TbLogout } from "react-icons/tb";

type MemberList = {
  label: string;
  icon: ReactNode;
  href: string;
};

export default function Navbar() {
  const { auth, isAuthenticated, logout } = useAuth(); // 直接使用 Context 提供的狀態與方法

  const navLinks = [
    { name: "部落格", href: "/blog" },
    { name: "體驗分類", href: "/categories" },
    { name: "品牌介紹", href: "/about" },
    { name: "聯絡我們", href: "/contact" },
  ];
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
      <div className="relative w-60 md:w-80">
        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="搜尋景點、地區或城市"
          className="h-[40px] rounded-[25px] bg-gray-300/20 pr-4 pl-10 text-[16px] placeholder:text-white/70"
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
          <div className="dropdown dropdown-end dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <FaCartShopping />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box z-[60] mt-2 w-56 bg-gray-700 p-2 shadow-xl"
            >
              <li className="relative h-32 w-full">
                <Image src="/cat-cart.jpg" alt="123" fill />
              </li>
            </ul>
          </div>
        ) : null}
        {isAuthenticated ? (
          <div className="dropdown dropdown-end dropdown-hover relative">
            {/* 觸發區域 */}
            <div
              tabIndex={0}
              className="hover:bg-base-200 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2"
            >
              <Image
                src="/images/avatar-test.png"
                alt={auth.name}
                className="h-8 w-8 rounded-full object-cover"
                width={32}
                height={32}
              />
              <span className="text-sm">{auth.name} 你好～</span>
            </div>

            {/* 下拉選單 */}
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box z-[60] mt-2 w-56 bg-gray-700 p-2 shadow-xl"
            >
              {/* 用戶資訊區 */}
              <li className="mb-2">
                <div className="flex items-center gap-3 px-4 py-3">
                  <img
                    src="/images/avatar-test.png"
                    alt="用戶頭像"
                    className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">王大明</div>
                    <div className="flex items-center gap-1.5 text-sm text-orange-400">
                      Lv.3 鑽石會員 <span>👑</span>
                    </div>
                  </div>
                </div>
              </li>

              {/* 其他選單 */}
              {memberLists.map((v, i) => (
                <li key={i}>
                  <a
                    href={v.href}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-blue-600 hover:text-white"
                  >
                    {v.icon}
                    <span>{v.label}</span>
                  </a>
                </li>
              ))}

              <li className="mt-2 border-t border-gray-600 pt-2">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <TbLogout />
                  <span>登出</span>
                </button>
              </li>
            </ul>
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
      <div className="gap-1 md:hidden">
        {isAuthenticated ? (
          <div className="dropdown dropdown-end dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <FaCartShopping />
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content dropdown-hover fixed right-0 z-50 w-screen bg-white p-4 text-black shadow"
            ></ul>
          </div>
        ) : null}
        <div className="dropdown dropdown-end md:hidden">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle md:hidden"
          >
            <FaUser />
          </div>

          {/* 使用 fixed 讓它直接脫離文檔流，實現滿版 */}
          <ul
            tabIndex={0}
            className="dropdown-content fixed right-0 flex w-screen flex-col bg-white p-0 text-black shadow-lg"
          >
            {isAuthenticated ? (
              <>
                <li className="w-full">
                  <button
                    onClick={() => {
                      /* 點擊後要執行的動作，例如跳到個人資料 */
                    }}
                    className="flex w-full items-center gap-3 px-6 py-4 transition-colors duration-200 hover:bg-blue-500 hover:text-white focus:bg-blue-600 focus:text-white active:bg-blue-700 active:text-white"
                  >
                    <img
                      src="/images/avatar-test.png"
                      alt="用戶頭像"
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />

                    <div className="flex flex-col text-left">
                      <span className="font-semibold">王大明</span>
                      <div className="flex items-center gap-1.5 text-sm text-orange-400">
                        Lv.3 鑽石會員
                        <span>👑</span>
                      </div>
                    </div>
                  </button>
                </li>
                {memberLists.map((v, i) => {
                  return (
                    <li key={i} className="w-full">
                      <a
                        href={v.href}
                        className="flex w-full items-center gap-3 px-6 py-4 transition-colors duration-200 hover:bg-blue-500 hover:text-white focus:bg-blue-600 focus:text-white active:bg-blue-700 active:text-white"
                      >
                        {v.icon}
                        <span>{v.label}</span>
                      </a>
                    </li>
                  );
                })}
                <li className="w-full">
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-6 py-4 transition-colors duration-200 hover:bg-blue-500 hover:text-white focus:bg-blue-600 focus:text-white active:bg-blue-700 active:text-white"
                  >
                    <TbLogout />
                    <span>登出</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="">
                  <Link href="/auth/login" className="hover:text-gray-300">
                    登入
                  </Link>
                </li>
                <li className="">
                  <Link href="/auth/register" className="hover:text-gray-300">
                    註冊
                  </Link>
                </li>
              </>
            )}
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
            {navLinks.map((v, i) => {
              return (
                <li key={i}>
                  <Link href={v.href}>{v.name}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
