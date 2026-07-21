"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { SubmitEventHandler } from "react";
import { FaSearch } from "react-icons/fa";
import { useCart } from "@/contexts/cart"; // 引入購物車 Context
import { HiOutlineShoppingCart, HiTrash } from "react-icons/hi"; // 引入美化 Icon

export default function Navbar() {
  //獲取全域的購物車資料
  const { items, totalQty, totalAmount, onRemove } = useCart();

  const navLinks = [
    { name: "部落格", href: "/blog" },
    { name: "體驗分類", href: "/categories" },
    { name: "品牌介紹", href: "/about" },
    { name: "聯絡我們", href: "/contact" },
  ];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isHomePage = pathname === "/";
  const urlKeyword = searchParams.get("keyword") ?? "";

  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      <ul className="flex items-center">
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
