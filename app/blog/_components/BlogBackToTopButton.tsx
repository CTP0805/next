"use client";

import { ArrowUp } from "lucide-react";

/** 部落格列表與詳細頁共用的平滑回頂按鈕。 */
export function BlogBackToTopButton() {
  return (
    <button
      type="button"
      aria-label="回到頁面頂部"
      title="回到頂部"
      className="fixed right-5 bottom-24 z-40 flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg transition hover:-translate-y-0.5 hover:border-[#45cad5] hover:text-[#259aa5]"
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }}
    >
      <ArrowUp aria-hidden="true" size={20} strokeWidth={2} />
    </button>
  );
}
