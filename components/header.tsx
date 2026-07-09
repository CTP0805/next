"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full h-16 bg-[#71c8d4] flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#71c8d4] font-bold text-xl">
          M
        </div>
        <span className="ml-3 text-white text-xl font-semibold tracking-wide">MaoDay</span>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-x-8 text-white text-sm font-medium">
        <Link href="/points" className="hover:opacity-80 transition">基礎點</Link>
        <Link href="/profit-sharing" className="hover:opacity-80 transition">關於分潤</Link>
        <Link href="/about" className="hover:opacity-80 transition">關於我們</Link>
        <Link href="/contact" className="hover:opacity-80 transition">聯絡我們</Link>
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-x-5 text-white">
        {/* Cart */}
        <Link href="/cart" className="text-2xl hover:opacity-80 transition">
          🛒
        </Link>

        {/* User Info */}
        <div className="flex items-center gap-x-3">
          <Image
            src="/test.png"
            alt="用戶頭像"
            width={32}
            height={32}
            className="rounded-full object-cover ring-1 ring-white/40"
          />
          <span className="text-sm font-medium hidden sm:block">您好，王大明</span>
        </div>
      </div>
    </header>
  );
}