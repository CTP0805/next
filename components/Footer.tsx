"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    // 1. 外層容器：負責背景顏色與寬度填滿
    <footer className="relative flex min-h-[150px] w-full items-center justify-center py-12 md:min-h-[550px]">
      <Image
        src="/images/footer.webp"
        alt="頁尾背景"
        className="z-1 h-full w-full object-fill brightness-65"
        fill
        loading="eager"
      />
      {/* 2. 內層容器：限制最大寬度、水平置中並設定間距 */}
      <div className="z-2 mx-auto hidden max-w-7xl gap-30 pt-24 pb-8 text-white md:flex">
        <nav className="flex flex-col gap-2">
          <h6 className="text-xl md:text-2xl">認識 MeetLocals</h6>
          <Link href="/about" className="link link-hover">
            關於我們
          </Link>
          <Link href="/media" className="link link-hover">
            媒體報導
          </Link>
          <Link href="/help" className="link link-hover">
            幫助中心
          </Link>
          <Link href="/terms" className="link link-hover">
            使用者條款
          </Link>
        </nav>

        <nav className="flex flex-col gap-2">
          <h6 className="text-2xl">給旅人</h6>
          <Link href="/" className="link link-hover">
            四大保證
          </Link>
          <Link href="/partners" className="link link-hover">
            合作夥伴
          </Link>
          <Link href="/blog" className="link link-hover">
            部落格
          </Link>
          <Link href="/rewards" className="link link-hover">
            M幣兌換
          </Link>
        </nav>

        <nav className="flex flex-col gap-2">
          <h6 className="text-2xl">合作夥伴</h6>
          <Link href="/login" className="link link-hover">
            導遊登入
          </Link>
          <Link href="/business" className="link link-hover">
            同業合作
          </Link>
          <Link href="/marketing" className="link link-hover">
            聯盟行銷
          </Link>
          <Link href="/careers" className="link link-hover">
            人才招募
          </Link>
        </nav>

        {/* <nav className="flex flex-col gap-2">
          <h6 className="text-2xl">聯絡我們</h6>

          <a className="link link-hover">New, Taipei, City</a>
          <a href="tel:+393463685708" className="link link-hover">
            +39 346 368 5708
          </a>
          <a href="mailto:maomao9487@gmail.com" className="link link-hover">
            maomao@gmail.com
          </a>
        </nav> */}

        {/* 社群媒體（內建純白質感 SVG，絕不報錯） */}
        <nav className="flex flex-col gap-3">
          <h6 className="text-xl md:text-2xl">社群媒體</h6>
          <div className="flex gap-3 pt-1">
            {/* Twitter / X */}
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white hover:text-black"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white hover:text-black"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white hover:text-black"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
