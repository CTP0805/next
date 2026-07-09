"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  const navStyle =
    isHomePage && !isScrolled ? "bg-transparent" : "bg-[#45cad5]";

  return (
    <nav
      className={`fixed top-0 left-0 z-50 flex h-[100px] w-full items-center justify-between px-2 text-gray-200 xl:px-37.5 ${navStyle}`}
    >
      {/* 左側 Logo */}
      <div className="flex shrink-0 items-center">
        <Link href="/">
          <Image
            src="/icon/logo.svg"
            alt="Logo"
            width={50}
            height={50}
            className="h-auto w-auto"
            priority
          />
        </Link>
      </div>
      <div className="rounded-4xl">
        <input type="text" />
      </div>
      {/* 中間導覽 */}
      <div className="hidden items-center xl:flex">
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
      <div className="dropdown dropdown-end xl:hidden">
        <div tabIndex={0} role="button" className="">
          <Image
            src="/icon/bars.svg"
            alt="Logo"
            width={20}
            height={20}
            className="h-auto w-auto"
          />
        </div>
        <div className="dropdown-content menu rounded-box z-1 w-52 p-2">
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
      </div>
    </nav>
  );
}
