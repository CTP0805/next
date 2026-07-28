"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/cart";
import { useAuth } from "@/contexts/auth-context";
import {
  FaUser,
  FaAward,
  FaBagShopping,
  FaTicket,
  FaCommentDots,
  FaHeart,
  FaClockRotateLeft,
} from "react-icons/fa6";
import { FaEdit, FaClipboardCheck } from "react-icons/fa";
import type { MemberList, NavLink } from "@/types/navbar";
import SearchBar from "./SearchBar";
import NavLinks from "./NavLinks";
import CartDropdown from "./CartDropdown";
import MemberMenu from "./MemberMenu";
import MobileMenu from "./MobileMenu";
export default function Navbar() {
  const { auth, isAuthenticated, logout } = useAuth();
  const { totalQty } = useCart();
  const pathname = usePathname();
  const [member, setMember] = useState([]);
  const navLinks: NavLink[] = [
    { name: "關於我們", href: "/about" },
    { name: "部落格", href: "/blog" },
  ];

  const memberListsBase: MemberList[] = [
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
  const memberLists: MemberList[] = [
    ...memberListsBase,
    // ...(member.role === "管理者"
    //   ? [
    //       {
    //         label: "文章審查",
    //         icon: <FaClipboardCheck />,
    //         href: "/member/blog-review",
    //       } satisfies MemberList,
    //     ]
    //   : [
    //       {
    //         label: "管理文章",
    //         icon: <FaEdit />,
    //         href: "/member/edit-post",
    //       } satisfies MemberList,
    //     ]),
  ];

  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    fetch(`http://localhost:3001/api/member/profile`, {
      method: "GET",
      credentials: "include", //帶上cookie驗證身份
    })
      .then((data) => data.json())
      .then((data) => setMember(data.data))
      .catch((error) => console.error(error));
  }, [isAuthenticated]);
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
      <div className="group relative flex aspect-square h-[40px] w-[120px] shrink-0 items-start">
        <Link href="/" className="absolute inset-0 block">
          {/* 預設顯示的 Logo (hover 時淡出或隱藏) */}
          <Image
            src="/icon/logo.svg"
            alt="Logo"
            fill
            priority
            sizes="(max-width: 768px) 20px, 40px"
            className="transition-opacity duration-300 group-hover:opacity-0"
          />

          {/* Hover 時顯示的 Logo (預設透明或隱藏) */}
          <Image
            src="/icon/logoopen.svg"
            alt="Logo Open"
            fill
            priority
            sizes="(max-width: 768px) 80px, 80px"
            className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
          <MemberMenu auth={member} logout={logout} memberLists={memberLists} />
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

      <MobileMenu
        isAuthenticated={isAuthenticated}
        totalQty={totalQty}
        navLinks={navLinks}
        logout={logout}
      />
    </nav>
  );
}
