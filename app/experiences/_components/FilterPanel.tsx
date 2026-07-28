"use client";

import { useRef, type PointerEvent } from "react";
import { HiChevronDown, HiOutlineCalendar } from "react-icons/hi";

type Category = {
  id: number;
  label: string;
  count: number;
};

type FilterPanelProps = {
  categories: Category[];
  categoryIds: number[];
  onCategoryIdsChange: (categoryIds: number[]) => void;
  city: string;
  onCityChange: (city: string) => void;
  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (price: number) => void;
  onMaxPriceChange: (price: number) => void;
  maxPriceLimit: number;
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
};

export default function FilterPanel({
  categories,
  categoryIds,
  onCategoryIdsChange,
  city,
  onCityChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  maxPriceLimit,
  selectedDate,
  onSelectedDateChange,
}: FilterPanelProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const minSelectableDate = tomorrow.toLocaleDateString("en-CA");
  const isCustomDate = selectedDate !== "" && selectedDate !== "tomorrow";

  const displayedDate = isCustomDate
    ? selectedDate.slice(5).replace("-", "/")
    : "選擇日期";
  const toggleCategory = (id: number) => {
    const isChecked = categoryIds.includes(id);

    if (isChecked) {
      onCategoryIdsChange(
        categoryIds.filter((categoryId) => categoryId !== id),
      );
    } else {
      onCategoryIdsChange([...categoryIds, id]);
    }
  };
  const getPriceFromPointer = (clientX: number, trackElement: HTMLElement) => {
    const rect = trackElement.getBoundingClientRect();

    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));

    return Math.round(ratio * maxPriceLimit);
  };

  const handleThumbMove = (
    event: PointerEvent<HTMLButtonElement>,
    type: "min" | "max",
  ) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const trackElement = event.currentTarget.parentElement;
    if (!trackElement) return;

    const price = getPriceFromPointer(event.clientX, trackElement);

    if (type === "min") {
      onMinPriceChange(Math.min(price, maxPrice));
    } else {
      onMaxPriceChange(Math.max(price, minPrice));
    }
  };

  const handleTrackClick = (event: PointerEvent<HTMLDivElement>) => {
    const clickedPrice = getPriceFromPointer(
      event.clientX,
      event.currentTarget,
    );

    const distanceFromMin = Math.abs(clickedPrice - minPrice);
    const distanceFromMax = Math.abs(clickedPrice - maxPrice);

    if (distanceFromMin <= distanceFromMax) {
      onMinPriceChange(Math.min(clickedPrice, maxPrice));
    } else {
      onMaxPriceChange(Math.max(clickedPrice, minPrice));
    }
  };
  return (
    <aside className="h-fit overflow-hidden rounded-lg border border-[#E3E7E9] bg-white">
      <div className="flex items-start justify-between border-b border-[#E7EAEC] bg-[#F7F8F8] px-5 py-3.5">
        <div>
          <h5 className="font-extrabold text-[#30353A]">條件篩選</h5>
          <p className="p-text-14 mt-1 text-[#969CA1]">
            快速找到適合你的當地體驗
          </p>
        </div>
      </div>
      <div className="space-y-5 px-5 py-5">
        <fieldset>
          <legend className="mb-2.5 text-[16px] font-extrabold text-[#34393E]">
            城市
          </legend>

          <div className="relative">
            <select
              value={city}
              onChange={(event) => onCityChange(event.target.value)}
              className="h-11 w-full cursor-pointer appearance-none rounded-md border border-[#E1E5E7] bg-white px-3 pr-11 text-sm font-medium text-[#565D63] transition-colors outline-none hover:border-[#68BBC3] focus:border-[#68BBC3] focus:ring-2 focus:ring-[#68BBC3]/15"
            >
              <option value="">全部城市</option>
              <option value="倫敦">倫敦</option>
              <option value="巴黎">巴黎</option>
              <option value="慕尼黑">慕尼黑</option>
              <option value="阿姆斯特丹">阿姆斯特丹</option>
              <option value="威尼斯">威尼斯</option>
              <option value="巴塞隆納">巴塞隆納</option>
            </select>

            <HiChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-[#737B81]"
            />
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2.5 text-[16px] font-extrabold text-[#34393E]">
            體驗類型
          </legend>

          <div className="space-y-3">
            {categories.map(({ id, label }) => (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-3 text-sm text-[#565D63]"
              >
                <input
                  type="checkbox"
                  checked={categoryIds.includes(id)}
                  onChange={() => toggleCategory(id)}
                  className="checkbox border-[#DDE2E4] bg-white checked:border-[#68BBC3] checked:bg-[#68BBC3] checked:text-white"
                />

                <span className="flex-1">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-[16px] font-extrabold text-[#34393E]">
            日期
          </legend>

          <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
            <button
              type="button"
              onClick={() => onSelectedDateChange("tomorrow")}
              className={`h-10 rounded-md border text-xs font-bold transition-colors ${
                selectedDate === "tomorrow"
                  ? "border-[#68BBC3] text-[#489DA5]"
                  : "border-[#E1E5E7] text-[#71787E] hover:border-[#68BBC3] hover:text-[#489DA5]"
              }`}
            >
              明天
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const input = dateInputRef.current;
                  if (!input) return;

                  if (typeof input.showPicker === "function") {
                    input.showPicker();
                  } else {
                    input.click();
                  }
                }}
                className={`flex h-10 w-full items-center justify-center gap-2 rounded-md border text-xs font-bold transition-colors ${
                  isCustomDate
                    ? "border-[#68BBC3] text-[#489DA5]"
                    : "border-[#E1E5E7] text-[#71787E] hover:border-[#68BBC3] hover:text-[#489DA5]"
                }`}
              >
                <HiOutlineCalendar className="size-5" />
                {displayedDate}
              </button>

              <input
                ref={dateInputRef}
                type="date"
                min={minSelectableDate}
                value={selectedDate !== "tomorrow" ? selectedDate : ""}
                onChange={(event) => onSelectedDateChange(event.target.value)}
                className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
                tabIndex={-1}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-[16px] font-extrabold text-[#34393E]">
            價格範圍
          </legend>

          <p className="p-text-14 mb-4 font-medium text-[#8B9297]">
            NT${minPrice.toLocaleString("zh-TW")} - NT$
            {maxPrice.toLocaleString("zh-TW")}
          </p>

          <div
            className="relative h-10 w-full cursor-pointer touch-none"
            onPointerDown={handleTrackClick}
          >
            {/* 灰色底線 */}
            <div className="pointer-events-none absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-[#DFE3E5]" />

            {/* 選取範圍 */}
            <div
              className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#68BBC3]"
              style={{
                left: `${(minPrice / maxPriceLimit) * 100}%`,
                right: `${100 - (maxPrice / maxPriceLimit) * 100}%`,
              }}
            />

            {/* 最低價格圓點 */}
            <button
              type="button"
              aria-label="最低價格"
              className="absolute top-1/2 z-20 grid size-7 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none place-items-center bg-transparent p-0 active:cursor-grabbing"
              style={{
                left: `${(minPrice / maxPriceLimit) * 100}%`,
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => handleThumbMove(event, "min")}
              onPointerUp={(event) => {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }}
            >
              <span className="size-5 rounded-full border border-[#DCE2E4] bg-white shadow-md" />
            </button>

            {/* 最高價格圓點 */}
            <button
              type="button"
              aria-label="最高價格"
              className="absolute top-1/2 z-20 grid size-7 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none place-items-center bg-transparent p-0 active:cursor-grabbing"
              style={{
                left: `${(maxPrice / maxPriceLimit) * 100}%`,
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => handleThumbMove(event, "max")}
              onPointerUp={(event) => {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }}
            >
              <span className="size-5 rounded-full border border-[#DCE2E4] bg-white shadow-md" />
            </button>
          </div>
        </fieldset>
      </div>
    </aside>
  );
}
