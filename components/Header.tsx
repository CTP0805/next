"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { SubmitEventHandler } from "react";
import { FaSearch } from "react-icons/fa";

export default function Navbar() {
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
        <div className="group relative px-2">
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
          {/* 2. 中間這層透明的區塊 (橋樑) */}
          {/* 只要 top-full 加上一點高度，讓它與下方的視窗重疊即可 */}
          <div className="absolute top-full right-0 h-4 w-full bg-transparent"></div>
          {/* 3. 購物車視窗 */}
          {/* 注意：這裡的 top 設定為 top-[calc(100%+16px)] 以避開那 16px 的透明區塊，或者直接讓它緊貼透明區塊 */}
          <div className="absolute top-[calc(100%+1rem)] right-0 z-50 hidden w-64 rounded-md border bg-white p-4 shadow-lg group-hover:block">
            {" "}
            <div className="relative mx-auto mb-4 h-48 w-48">
              <Image
                src="/icon/cart.svg"
                alt="購物車空空的"
                fill
                className="bg-amber-400 object-contain text-black" // 確保圖片維持比例並在容器內顯示
              />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-700">
              購物車暫無商品{" "}
            </h3>
            <p className="mb-8 cursor-pointer text-[12px] text-[#45cad5]">
              您的購物車目前是空的，快去尋找下一 個冒險目的地吧！{" "}
            </p>
            <button className="bg-[#45cad5]">進入購物車</button>
          </div>
        </div>
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
