"use client";
import { useState } from "react";
import Link from 'next/link';

function Stepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#EBEEEF] py-4 last:border-0">
      <span className="text-sm font-bold text-[#555D63]">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={`減少${label}人數`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="grid size-7 place-items-center rounded-full border border-[#D9DFE1] text-[#697178] hover:border-[#68BBC3]"
        >
          −
        </button>
        <span className="w-4 text-center text-sm font-extrabold">{value}</span>
        <button
          type="button"
          aria-label={`增加${label}人數`}
          onClick={() => onChange(value + 1)}
          className="grid size-7 place-items-center rounded-full border border-[#D9DFE1] text-[#697178] hover:border-[#68BBC3]"
        >
          ＋
        </button>
      </div>
    </div>
  );
}

// 💡 1. 宣告 Props 型別，對應外層丟進來的資料
interface BookingCardProps {
  experience: {
    id: number;
    title: string;
    price: number;
    adult_price: number;
  };
  isEditMode?: boolean;
  oldSessionId?: number | null;
  oldQty?: number | null;
  onSubmit: (sessionId: number, quantity: number, sessionName?: string) => void; // 💡 統一處理函式
}

export default function BookingCard({
  experience,
  isEditMode = false,
  oldSessionId = null,
  oldQty = null,
  onSubmit,
}: BookingCardProps) {
  //  初始化人數：如果有帶 oldQty (編輯模式) 就用舊的，沒有就預設 2 人
  const [adults, setAdults] = useState(oldQty??2);
  const [children, setChildren] = useState(0);

  // 💡 模擬場次與選擇狀態 (實務上可以根據你的下拉選單 selected index 去更換 sessionId)
  const [sessionId, setSessionId] = useState<number>(oldSessionId ?? 101); 
  const [sessionName, setSessionName] = useState<string>("17:00 - 20:30");

  const unitPrice = 1960;
  const total = adults * unitPrice;

  return (
    <aside className="sticky top-28 rounded-lg border border-[#DDE3E5] bg-white p-6 shadow-[0_8px_24px_rgba(34,57,61,0.10)]">
      <p className="text-[15px] font-bold text-[#858D92]">
        <span className="text-[26px] font-extrabold text-[#68BBC3]">
          NT$1,960
        </span>{" "}
        / 每人
      </p>

      <label className="mt-6 block">
        <span className="mb-2 block text-xs font-bold text-[#656D72]">
          選擇日期
        </span>
        <input
          type="date"
          defaultValue="2026-07-18"
          className="h-11 w-full rounded-md border border-[#DCE2E4] px-3 text-sm text-[#4F575C] outline-none focus:border-[#68BBC3] focus:ring-2 focus:ring-[#68BBC3]/20"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-bold text-[#656D72]">
          場次
        </span>
        <select className="h-11 w-full rounded-md border border-[#DCE2E4] bg-white px-3 text-sm text-[#4F575C] outline-none focus:border-[#68BBC3]">
          <option>17:00 - 20:30</option>
          <option>17:30 - 21:00</option>
        </select>
      </label>

      <div className="mt-4">
        <p className="text-[14px] font-bold text-[#656D72]">參加人數</p>
        <Stepper value={adults} onChange={setAdults} label="成人" />
        <Stepper value={children} onChange={setChildren} label="孩童" />
      </div>

      <div className="my-5 flex items-center justify-between border-t border-[#E8ECEE] pt-5">
        <span className="font-bold text-[#545C61]">合計</span>
        <strong className="text-[20px] text-[#30363A]">
          NT$ {total.toLocaleString("zh-TW")}
        </strong>
      </div>


      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            onSubmit(sessionId, adults, sessionName);
          }}
          className="h-12 rounded-xl bg-[#FF9224] text-[16px] font-extrabold text-white transition-colors hover:bg-[#F48312] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9224]"
          >
            {isEditMode ? "確認修改" : "加入購物車"}
        </button>
          
        <button
          type="button"
          className="h-12 rounded-xl bg-[#68BBC3] text-[16px] font-extrabold text-white transition-colors hover:bg-[#55AAB2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68BBC3]"
        >
          立即預訂
        </button>
      </div>

      <p className="mt-4 text-center text-[12px] text-[#8B9297]">
        預訂前不會向您收費
      </p>

      <ul className="mt-5 space-y-2 border-t border-[#E8ECEE] pt-5 text-[12px] font-medium text-[#6F777C]">
        <li>◉ 48 小時前免費取消</li>
        <li>◉ 小團體驗，最多 8 人成行</li>
        <li>◉ meet locals 體驗品質保障</li>
      </ul>
    </aside>
  );
}
