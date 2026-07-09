"use client";
import { useState } from "react";

const experienceTypes = [
  ["古蹟巡禮", "38"],
  ["藝文導覽", "24"],
  ["美食饗宴", "17"],
  ["戶外探索", "14"],
  ["專人攝影", "12"],
  ["娛樂與夜生活", "9"],
] as const;

export default function FilterPanel() {
  const totalMaxLimit = 9999;
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3500);

  return (
    <aside className="h-fit overflow-hidden rounded-lg border border-[#E3E7E9] bg-white">
      <div className="border-b border-[#E7EAEC] bg-[#F7F8F8] px-5 py-5">
        <h2 className="text-[18px] font-extrabold text-[#30353A]">條件篩選</h2>
        <p className="mt-1 text-xs text-[#969CA1]">快速找到有溫度的巴黎體驗</p>
      </div>

      <div className="space-y-8 px-5 py-6">
        <fieldset>
          <legend className="mb-4 text-[16px] font-extrabold text-[#34393E]">
            體驗類型
          </legend>
          <div className="space-y-3">
            {experienceTypes.map(([label, count], index) => (
              <label
                key={label}
                className="flex cursor-pointer items-center gap-3 text-sm text-[#565D63]"
              >
                <input
                  type="checkbox"
                  defaultChecked={index === 3}
                  className="checkbox border-[#DDE2E4] bg-white checked:border-[#68BBC3] checked:bg-[#68BBC3] checked:white"
                />
                <span className="flex-1">{label}</span>
                <span className="text-xs text-[#9AA0A5]">{count}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-[16px] font-extrabold text-[#34393E]">
            日期
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {["今天", "明天", "全部日期"].map((label) => (
              <button
                key={label}
                type="button"
                className="h-10 rounded-md border border-[#E1E5E7] bg-white text-xs font-bold text-[#71787E] transition-colors hover:border-[#68BBC3] hover:text-[#489DA5]"
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-[16px] font-extrabold text-[#34393E]">
            價格範圍
          </legend>

          <p className="mb-4 text-sm font-medium text-[#8B9297]">
            NT${minPrice.toLocaleString("zh-TW")} - NT$
            {maxPrice.toLocaleString("zh-TW")}
          </p>

          <div className="relative h-5 w-full">
            {/* 灰色軌道 */}
            <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-[#DFE3E5]" />

            {/* 💡 藍綠色進度條：公式直接寫在 style 裡面了！ */}
            <div
              className="absolute top-1/2 h-1.5 rounded-full bg-[#68BBC3] -translate-y-1/2"
              style={{
                left: `${(minPrice / totalMaxLimit) * 100}%`,
                right: `${100 - (maxPrice / totalMaxLimit) * 100}%`,
              }}
            />

            {/* 左滑塊 (最低價) */}
            <input
              type="range"
              min="0"
              max={totalMaxLimit}
              value={minPrice}
              onChange={(e) =>
                setMinPrice(Math.min(Number(e.target.value), maxPrice))
              }
              className="pointer-events-none absolute top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent h-1.5 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#DCE2E4] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm"
            />

            {/* 右滑塊 (最高價) */}
            <input
              type="range"
              min="0"
              max={totalMaxLimit}
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(Math.max(Number(e.target.value), minPrice))
              }
              className="pointer-events-none absolute top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent h-1.5 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#DCE2E4] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm"
            />
          </div>
        </fieldset>
      </div>
    </aside>
  );
}
