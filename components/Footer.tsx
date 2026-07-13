"use client";

import Link from "next/link";
import Image from "next/image";
export default function Footer() {
  return (
    // 1. 外層容器：負責背景顏色與寬度填滿
    <footer className="relative flex min-h-[150px] w-full items-center justify-center md:min-h-[698px]">
      <Image
        src="/images/footer.webp"
        alt="Hero Background"
        className="z-1 h-full w-full object-fill"
        fill
      />
      {/* 2. 內層容器：限制最大寬度、水平置中並設定間距 */}
      <div className="z-2 mx-auto hidden max-w-7xl gap-30 text-white md:flex">
        <nav className="flex flex-col gap-2">
          <h6 className="text-xl md:text-2xl">認識 KKlook</h6>
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
            KKlook部落格
          </Link>
          <Link href="/rewards" className="link link-hover">
            酷幣兌換
          </Link>
        </nav>

        <nav className="flex flex-col gap-2">
          <h6 className="text-2xl">KKlook 合作夥伴</h6>
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

        <nav className="flex flex-col gap-2">
          <h6 className="text-2xl">聯絡我們</h6>

          <a className="link link-hover">
            <Image
              src="/icon/location.svg"
              alt="Hero Background"
              width={20}
              height={20}
            />
            Piazza Napoleone, Lucca, Tuscany
          </a>
          <a href="tel:+393463685708" className="link link-hover">
            +39 346 368 5708
          </a>
          <a href="mailto:maomao9487@gmail.com" className="link link-hover">
            maomao9487@gmail.com
          </a>
        </nav>

        <nav className="flex flex-col gap-2">
          <h6 className="text-2xl">社群媒體</h6>
          <div className="grid grid-flow-col gap-4">{/* SVG 圖示內容 */}</div>
        </nav>
      </div>
    </footer>
  );
}
