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
  const maxPrice = 9999;
  const [price, setPrice] = useState(3500);
  const priceProgress = (price / maxPrice) * 100;

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
                  className="size-4 accent-[#68BBC3]"
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
          <p className="mb-3 text-sm font-medium text-[#8B9297]">
            NT$0 - NT${price.toLocaleString("zh-TW")}
          </p>
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
            aria-label="價格範圍"
            style={{
              background: `linear-gradient(to right, #68BBC3 0%, #68BBC3 ${priceProgress}%, #DFE3E5 ${priceProgress}%, #DFE3E5 100%)`,
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[#68BBC3] [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#DCE2E4] [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#DCE2E4] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm"
          />
        </fieldset>
      </div>
    </aside>
  );
}
