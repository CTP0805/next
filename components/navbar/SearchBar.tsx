"use client";
import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SubmitEventHandler } from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlKeyword = searchParams.get("keyword") ?? "";
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const trimmedKeyword = searchInputRef.current?.value.trim() ?? "";
    if (!trimmedKeyword) return;

    const params = new URLSearchParams({ keyword: trimmedKeyword });
    router.push(`/experiences/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="relative w-60 md:w-80"
    >
      <button
        type="submit"
        aria-label="搜尋"
        className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-white"
      >
        <FaSearch />
      </button>

      <input
        key={urlKeyword}
        ref={searchInputRef}
        type="search"
        defaultValue={urlKeyword}
        placeholder="搜尋城市、分類或體驗"
        className="h-[40px] w-full rounded-[25px] bg-gray-300/20 pr-4 pl-10 text-[16px] placeholder:text-white/70 text-white focus:outline-none [&::-webkit-search-cancel-button]:cursor-pointer [&::-webkit-search-cancel-button]:brightness-0 [&::-webkit-search-cancel-button]:invert"
      />
    </form>
  );
}
