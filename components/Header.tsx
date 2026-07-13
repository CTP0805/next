"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaSearch } from "react-icons/fa";

export default function Navbar() {
  const navLinks = [
    { name: "部落格", href: "/blog" },
    { name: "體驗分類", href: "/categories" },
    { name: "關於我們", href: "/about" },
    { name: "聯絡我們", href: "/contact" },
  ];

  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // 只有在首頁時才需要監聽捲動事件
    if (!isHomePage) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0.1); // 捲動後變色
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // 設定樣式邏輯
  // 若是首頁且未捲動，使用透明；其他情況（非首頁 或 已捲動）使用固定背景色 (例如 bg-black)
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
          />
        </Link>
      </div>
      <div className="relative w-40 md:w-80">
        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="搜尋景點、地區或城市"
          className="h-[40px] w-full rounded-[25px] bg-gray-300/20 pr-4 pl-10 placeholder:text-white/70"
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
      <ul className="flex items-center">
        <div className="px-2">
          {" "}
          <Link href="/cart" className="flex shrink-0 items-center gap-2">
            <Image
              src="/icon/cart.svg"
              alt="Logo"
              width={20}
              height={20}
              className="h-auto w-auto"
            />
          </Link>
        </div>
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
      </ul>
      <div className="dropdown dropdown-end md:hidden">
        <div tabIndex={0} role="button" className="h-[20px] w-[20px]">
          <Image
            src="/icon/bars.svg"
            alt="Logo"
            fill
            className="h-auto w-auto"
          />
        </div>
        <div className="dropdown-content menu-lg rounded-box z-1 w-52 p-2">
          {navLinks.map((link, index) => (
            <div
              key={link.name}
              className="flex items-center border-r border-amber-300 px-5 last:border-0"
            >
              <Link href={link.href} className="hover:text-gray-300">
                {link.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
