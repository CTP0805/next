"use client";
import { useRef, useState } from "react";
import Stepper from "./Stepper";
import { HiOutlineCalendar, HiChevronDown } from "react-icons/hi";
import toast from "react-hot-toast";

type ExperienceSession = {
  id: number;
  start_time: string;
  end_time: string;
  adult_price: number;
  child_price: number;
  min_participants: number;
  max_participants: number;
};

type BookingCardProps = {
  sessions: ExperienceSession[];
  isEditMode?: boolean;
  oldSessionId?: number | null;
  oldQty?: number | null;
  onSubmit: (sessionId: number, adultQty: number, childQty: number, sessionName: string) => void;
  onDirectBook: (sessionId: number, adultQty: number,childQty: number, sessionName: string) => void;
};
const formatDateValue = (dateString: string) => {
  return new Date(dateString).toISOString().slice(0, 10);
};

const formatTimeRange = (start: string, end: string) => {
  return `${new Date(start).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} - ${new Date(end).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
};

export default function BookingCard({
  sessions,
  isEditMode = false,
  oldSessionId = null,
  oldQty = null,
  onSubmit,
  onDirectBook,
}: BookingCardProps) {
  const [adults, setAdults] = useState(oldQty ?? 1);
  const [children, setChildren] = useState(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  const firstSession = sessions[0];
  const minDate = firstSession ? formatDateValue(firstSession.start_time) : "";

  const [selectedDate, setSelectedDate] = useState(
    firstSession ? formatDateValue(firstSession.start_time) : "",
  );

  const sessionsByDate = sessions.filter(
    (session) => formatDateValue(session.start_time) === selectedDate,
  );

  const [selectedSessionId, setSelectedSessionId] = useState(
    oldSessionId ?? firstSession?.id ?? 0,
  );

  // 只有在當前日期有場次時才去匹配 selectedSession，否則為 null
  const selectedSession =
    sessionsByDate.length > 0
    ? (sessionsByDate.find((session) => session.id === selectedSessionId) ?? sessionsByDate[0])
    : null;

  const adultPrice = selectedSession?.adult_price ?? 0;
  const childPrice = selectedSession?.child_price ?? 0;
  const total = adults * adultPrice + children * childPrice;

  // 🚀 格式化完整場次日期與時間字串
  const sessionName = selectedSession
    ? `${formatDateValue(selectedSession.start_time)} ${formatTimeRange(
        selectedSession.start_time,
        selectedSession.end_time,
      )}`
    : "";
  
  // 🚀 取得當前選中場次的人數上限 (若資料庫沒給預設 8 人)
  const maxLimit = selectedSession?.max_participants ?? 8;

  // 🚀 處理成人數量變更防呆
  const handleAdultChange = (nextAdults: number) => {
    // 增加人數時，檢查總人數是否超過上限
    if (nextAdults > adults && nextAdults + children > maxLimit) {
      toast.error(`該場次最多只能選擇 ${maxLimit} 位！`);
      return;
    }
    // 防呆：如果有兒童，成人至少 1 人
    if (children > 0 && nextAdults < 1) {
      toast.error("兒童需有至少一位成人陪同");
      return;
    }
    setAdults(Math.max(1, nextAdults));
  };

  // 🚀 處理兒童數量變更防呆
  const handleChildChange = (nextChildren: number) => {
    const validChildren = Math.max(0, nextChildren);
    
    // 增加兒童且目前大人是 0 時，會自動補 1 大人的情況檢查
    let neededAdults = adults;
    if (validChildren > 0 && adults === 0) {
      neededAdults = 1;
    }

    if (validChildren > children && neededAdults + validChildren > maxLimit) {
      toast.error(`該場次最多只能選擇 ${maxLimit} 位！`);
      return;
    }

    if (validChildren > 0 && adults === 0) {
      setAdults(1);
    }
    setChildren(validChildren);
  };


  return (
    <aside className="sticky top-28 rounded-lg border border-[#DDE3E5] bg-white p-6 shadow-[0_8px_24px_rgba(34,57,61,0.10)]">
      <p className="text-[15px] font-bold text-[#858D92]">
        <span className="text-[26px] font-extrabold text-[#68BBC3]">
          NT${adultPrice.toLocaleString("zh-TW")}
        </span>{" "}
        起
      </p>

      <label className="mt-6 block">
        <span className="mb-2 block text-xs font-bold text-[#656D72]">
          選擇日期
        </span>

        <div className="relative">
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            min={minDate}
            onChange={(e) => {
              const nextDate = e.target.value;
              setSelectedDate(nextDate);

              const firstSessionOnDate = sessions.find(
                (session) => formatDateValue(session.start_time) === nextDate,
              );

              if (firstSessionOnDate) {
                setSelectedSessionId(firstSessionOnDate.id);
              }
            }}
            className="h-11 w-full rounded-md border border-[#DCE2E4] px-3 pr-10 text-sm text-[#4F575C] outline-none focus:border-[#68BBC3] focus:ring-2 focus:ring-[#68BBC3]/20 [&::-webkit-calendar-picker-indicator]:opacity-0"
          />

          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker()}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-[#8B9297] hover:text-[#68BBC3]"
            aria-label="選擇日期"
          >
            <HiOutlineCalendar className="size-5" />
          </button>
        </div>
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-bold text-[#656D72]">
          場次
        </span>

        <div className="relative">
          <select
            value={selectedSession?.id ?? ""}
            disabled={sessionsByDate.length === 0}
            onChange={(e) => setSelectedSessionId(Number(e.target.value))}
            className="h-11 w-full appearance-none rounded-md border border-[#DCE2E4] bg-white px-3 pr-11 text-sm text-[#4F575C] outline-none focus:border-[#68BBC3] disabled:bg-[#F3F5F6] disabled:text-[#A0A7AC]"
          >
            {sessionsByDate.length > 0 ? (
              sessionsByDate.map((session) => (
                <option key={session.id} value={session.id}>
                  {formatTimeRange(session.start_time, session.end_time)}
                </option>
              ))
            ) : (
              <option value="">無可預訂場次</option>
            )}
          </select>

          <HiChevronDown className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-[#8B9297]" />
        </div>

        {sessionsByDate.length === 0 && (
          <p className="mt-3 text-center text-xs font-bold text-[#D97706]">
            該日期目前沒有可預訂場次，請選擇其他日期。
          </p>
        )}
      </label>

      <div className="mt-4">
        <p className="text-[14px] font-bold text-[#656D72]">參加人數</p>
        <Stepper
          value={adults}
          onChange={handleAdultChange}
          label="成人"
          price={adultPrice}
          min={1}
        />

        <Stepper
          value={children}
          onChange={handleChildChange}
          label="孩童"
          price={childPrice}
          min={0}
        />
      </div>

      <div className="my-5 flex items-center justify-between border-t border-[#E8ECEE] pt-5">
        <span className="font-bold text-[#545C61]">合計</span>
        <strong className="text-[20px] text-[#30363A]">
          NT$ {total.toLocaleString("zh-TW")}
        </strong>
      </div>

      <div className="grid grid-cols-2 gap-3">
        
        {/* 加入購物車 / 確認修改按鈕 */}
        <button
          type="button"
          disabled={!selectedSession || sessionsByDate.length === 0}
          onClick={() => selectedSession && onSubmit(selectedSession.id, adults, children, sessionName)}
          className="h-12 rounded-xl bg-[#FF9224] text-[16px] font-extrabold text-white transition-colors hover:bg-[#F48312] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9224]"
        >
          {isEditMode ? "確認修改" : "加入購物車"}
        </button>

        {/* 立即預訂按鈕 */}
        <button
          type="button"
          disabled={!selectedSession || sessionsByDate.length === 0}
          onClick={() => selectedSession && onDirectBook(selectedSession.id, adults, children, sessionName)}
          className="h-12 rounded-xl bg-[#68BBC3] text-[16px] font-extrabold text-white transition-colors hover:bg-[#55AAB2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68BBC3]"
        >
          立即預訂
        </button>
      </div>

      <p className="mt-4 text-center text-[12px] text-[#8B9297]">
        預訂前不會向您收費
      </p>

      <ul className="mt-5 space-y-2 border-t border-[#E8ECEE] pt-5 text-[12px] font-medium text-[#6F777C]">
        <li>◉ 24 小時前免費取消</li>
        <li>◉ 小團體驗，最多 8 人成行</li>
        <li>◉ meet locals 體驗品質保障</li>
      </ul>
    </aside>
  );
}
