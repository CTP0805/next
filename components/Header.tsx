"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { SubmitEventHandler } from "react";
import { FaSearch } from "react-icons/fa";
import { useCart } from "@/contexts/cart"; // 引入購物車 Context
import { HiOutlineShoppingCart, HiTrash } from "react-icons/hi"; // 引入美化 Icon
import { useAuth } from "@/contexts/auth-context"; // 引入你建立的 Context
import type { ReactNode } from "react";
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

type MemberList = {
  label: string;
  icon: ReactNode;
  href: string;
};

  export default function Navbar() {
    const { auth, isAuthenticated, logout } = useAuth(); // 直接使用 Context 提供的狀態與方法
    //獲取全域的購物車資料
    const { items, totalQty, totalAmount, onRemove } = useCart();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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

  const isHomePage = pathname === "/";
  const urlKeyword = searchParams.get("keyword") ?? "";

  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleSearch: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const trimmedKeyword = searchInputRef.current?.value.trim() ?? "";

    if (!trimmedKeyword) {
      router.push("/experiences/search");
      return;
    }

    const params = new URLSearchParams({
      keyword: trimmedKeyword,
    });

    router.push(`/experiences/search?${params.toString()}`);
  };
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

      {/* 搜尋欄 */}
      <form
        onSubmit={handleSearch}
        role="search"
        className="relative w-40 md:w-80"
      >
        <button
          type="submit"
          aria-label="搜尋"
          className="absolute top-1/2 left-3 z-10 -translate-y-1/2 cursor-pointer text-gray-400"
        >
          <FaSearch />
        </button>

        <input
          key={urlKeyword}
          ref={searchInputRef}
          type="search"
          defaultValue={urlKeyword}
          placeholder="搜尋城市、分類或體驗"
          className="h-[40px] w-full rounded-[25px] bg-gray-300/20 pr-4 pl-10 text-[16px] placeholder:text-white/70"
        />
      </form>

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
        {/* 🛒 購物車觸發區 */}
        <div className="group relative px-3 mr-6 cursor-pointer py-2">
          <Link href="/cart" className="relative flex shrink-0 items-center">
            <Image
              src="/icon/cart.svg"
              alt="Logo"
              width={20}
              height={20}
              className="h-auto w-auto"
            />
            {/* 🔴 數字泡泡：只有當購物車數量大於 0 的時候才顯示 */}
            {totalQty > 0 && (
              <span className="absolute -top-2.5 -right-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm">
                {totalQty}
              </span>
            )}
          </Link>

          {/* 2. 中間這層透明的區塊 (橋樑) */}
          {/* 只要 top-full 加上一點高度，讓它與下方的視窗重疊即可 */}
          <div className="absolute top-full right-0 h-4 w-full bg-transparent"></div>

          {/* 🛍️ 購物車下拉預覽浮動卡片 */}
          {/* 注意：這裡的 top 設定為 top-[calc(100%+16px)] 以避開那 16px 的透明區塊，或者直接讓它緊貼透明區塊 */}
          <div className="absolute top-[calc(100%+1rem)] right-1/2 z-50 hidden w-80 rounded-xl border border-gray-100 bg-white p-4 shadow-xl transition-all group-hover:block">

            {items.length === 0 ? (
              /* 🚫 情況 A：購物車空空如也 */
              <div className="py-2 text-center">
                <div className="relative mx-auto mb-4 h-48 w-48">
                  <Image
                    src="/cat-cart.jpg"
                    alt="購物車空空的"
                    fill
                    className="object-contain text-black" // 確保圖片維持比例並在容器內顯示
                  />
                </div>
                <h4 className="mb-2 text-2xl font-bold text-gray-700">
                  購物車暫無商品{" "}
                </h4>
                <Link
                href="/experiences/search/1"
                >
                <p className="mb-8 cursor-pointer text-[12px] text-[#45cad5]">
                  您的購物車目前是空的，<br/>快去尋找下一個冒險目的地吧！
                </p>
                </Link>
                <Link
                  href="/cart"
                  className="block w-full rounded-lg bg-[#45cad5] py-2 text-center text-xs font-bold text-white transition-colors hover:bg-[#39b4bf]"
                >
                  前往購物車
                </Link>
              </div>
            ) : (
              /* ✨ 情況 B：購物車有商品時的清單預覽 */
              <div className="text-black">
                <h4 className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2 text-xs font-bold text-gray-400">
                  <span>最近加入的商品</span>
                  <span className="font-black text-[#45cad5]">
                    共 {totalQty} 件
                  </span>
                </h4>

                {/* 行程捲軸清單區域（限制高度，防止爆版） */}
                <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
                  {items.slice(0, 3).map((item) => (
                    // 畫面最多展示最新 3 筆
                    <div
                      key={`${item.experienceId}-${item.sessionId}`}
                      className="flex gap-3 border-b border-gray-50 pb-2.5 last:border-0"
                    >
                      {/* 商品縮圖 */}
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <Image
                          src={
                            item.image || "/images/experiences/seine-picnic.jpg"
                          }
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {/* 商品細節資訊 */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <h5 className="truncate text-[12px] font-black text-gray-800">
                          {item.name}
                        </h5>
                        <p className="truncate text-[10px] text-gray-400">
                          {item.sessionName || "未定場次"}
                        </p>
                        <div className="mt-0.5 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-500">
                            NT$ {item.price.toLocaleString()}{" "}
                            <span className="text-[10px] text-gray-400">
                              x {item.quantity}
                            </span>
                          </span>
                          {/* 垃圾桶小按鈕 */}
                          <button
                            onClick={(e) => {
                              e.preventDefault(); // 防止觸發 Link
                              onRemove(item.experienceId, item.sessionId);
                            }}
                            className="p-0.5 text-gray-300 transition-colors hover:text-red-500"
                            title="移除此商品"
                          >
                            <HiTrash className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 底部總計與主按鈕 */}
                <div className="mt-2 border-t border-gray-100 pt-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-400">
                      總計金額
                    </span>
                    <span className="text-sm font-black text-red-500">
                      NT$ {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href="/cart"
                    className="block w-full rounded-lg bg-[#45cad5] py-2 text-center text-xs font-black text-white shadow-md shadow-[#45cad5]/10 transition-transform hover:bg-[#36b3bc] active:scale-[0.99]"
                  >
                    進入購物車頁面
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 登入 / 註冊 */}
        <div className="px-2">
          <Link href="/auth/login" className="hover:text-a">
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

        {isAuthenticated ? (
          <div className="dropdown dropdown-end dropdown-hover relative p-5">
            {/* 觸發區域 */}
            <div
              tabIndex={0}
              className="hover:bg-base-200 flex cursor-pointer items-center gap-2 rounded-lg"
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
              className="dropdown-content menu rounded-box z-[60] mt-4 w-56 bg-white p-2 text-black shadow-xl"
            >
              {/* 用戶資訊區 */}
              <li className="mb-2 border-b">
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
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-red-600 hover:text-white"
                >
                  <FiLogOut /> <span>登出</span>
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
      </div>
      
      {/* 在父容器中直接放置 dropdown，不被 relative md:hidden 限制 */}
      <div className="flex gap-1 md:hidden">
        {isAuthenticated ? (
          <div className="dropdown dropdown-end md:dropdown-hover">
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
              {" "}
              <li className="relative h-32 w-full">
                <Image src="/cat-cart.jpg" alt="123" fill />
              </li>
            </ul>
          </div>
        ) : null}
        {isAuthenticated ? (
          <div className="md:hidden">
            <div role="button" className="btn btn-ghost btn-circle md:hidden">
              <a href="/member">
                <FaUser />
              </a>
            </div>
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
            {isAuthenticated ? null : (
              <>
                <li>
                  <Link href="/auth/login" className="hover:text-gray-300">
                    登入
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-gray-300">
                    註冊
                  </Link>
                </li>
              </>
            )}

            {navLinks.map((v, i) => {
              return (
                <li key={i}>
                  <a href={v.href}>{v.name}</a>
                </li>
              );
            })}
            <li className="">
              <button onClick={logout} className="flex w-full items-center">
                <span>登出</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
