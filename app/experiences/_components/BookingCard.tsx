"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { zhTW } from "react-day-picker/locale";
import Stepper from "./Stepper";
import {
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCalendar,
  HiX,
} from "react-icons/hi";
import toast from "react-hot-toast";

type ExperienceSession = {
  id: number;
  start_time: string;
  end_time: string;
  adult_price: number;
  child_price: number;
  min_participants: number;
  max_participants: number;
  remaining_participants: number;
};

type BookingCardProps = {
  sessions: ExperienceSession[];
  isEditMode?: boolean;
  oldSessionId?: number | null;
  oldQty?: number | null;
  mobileMode?: "cart" | "direct";
  onClose?: () => void;
  onSubmit: (
    sessionId: number,
    adultQty: number,
    childQty: number,
    sessionName: string,
  ) => void;
  onDirectBook: (
    sessionId: number,
    adultQty: number,
    childQty: number,
    sessionName: string,
  ) => void;
};

const formatDateValue = (date: Date | string) => {
  const value = typeof date === "string" ? new Date(date) : date;

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
  mobileMode,
  onClose,
}: BookingCardProps) {
  const [adults, setAdults] = useState(oldQty ?? 1);
  const [children, setChildren] = useState(0);

  const firstSession =
    sessions.find((session) => session.remaining_participants > 0) ??
    sessions[0];

  const [selectedDate, setSelectedDate] = useState(
    firstSession ? formatDateValue(firstSession.start_time) : "",
  );
  const availableDateSet = useMemo(
    () =>
      new Set(sessions.map((session) => formatDateValue(session.start_time))),
    [sessions],
  );
  const getMonthKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
  };

  const availableMonthSet = useMemo(
    () =>
      new Set(
        sessions.map((session) => getMonthKey(new Date(session.start_time))),
      ),
    [sessions],
  );

  const [displayMonth, setDisplayMonth] = useState(() => {
    const initialDate = firstSession
      ? new Date(firstSession.start_time)
      : new Date();

    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  });

  const previousMonth = new Date(
    displayMonth.getFullYear(),
    displayMonth.getMonth() - 1,
    1,
  );

  const nextMonth = new Date(
    displayMonth.getFullYear(),
    displayMonth.getMonth() + 1,
    1,
  );

  const canGoPrevious = availableMonthSet.has(getMonthKey(previousMonth));
  const canGoNext = availableMonthSet.has(getMonthKey(nextMonth));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const sessionsByDate = sessions.filter(
    (session) => formatDateValue(session.start_time) === selectedDate,
  );

  const [selectedSessionId, setSelectedSessionId] = useState(
    oldSessionId ?? firstSession?.id ?? 0,
  );

  // 只有在當前日期有場次時才去匹配 selectedSession，否則為 null
  const selectedSession =
    sessionsByDate.length > 0
      ? (sessionsByDate.find((session) => session.id === selectedSessionId) ??
        sessionsByDate[0])
      : null;

  const adultPrice = selectedSession?.adult_price ?? 0;
  const childPrice = selectedSession?.child_price ?? 0;
  const total = adults * adultPrice + children * childPrice;

  const selectedQty = adults + children;
  const isSoldOut = (selectedSession?.remaining_participants ?? 0) <= 0;
  const exceedsRemainingSeats =
    selectedQty > (selectedSession?.remaining_participants ?? 0);

  // 🚀 格式化完整場次日期與時間字串
  const sessionName = selectedSession
    ? `${formatDateValue(selectedSession.start_time)} ${formatTimeRange(
        selectedSession.start_time,
        selectedSession.end_time,
      )}`
    : "";

  // 🚀 取得當前選中場次的人數上限 (剩餘名額)
  const maxLimit = selectedSession?.remaining_participants ?? 0;

  // 🚀 處理成人數量變更防呆
  const handleAdultChange = (nextAdults: number) => {
    // 增加人數時，檢查總人數是否超過上限
    if (nextAdults > adults && nextAdults + children > maxLimit) {
      toast.error(`此場次僅剩 ${maxLimit} 位名額`);
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
      toast.error(`此場次僅剩 ${maxLimit} 位名額`);
      return;
    }

    if (validChildren > 0 && adults === 0) {
      setAdults(1);
    }
    setChildren(validChildren);
  };

  return (
    <aside
      className={
        mobileMode
          ? "relative bg-white p-6"
          : "sticky top-28 rounded-lg border border-[#DDE3E5] bg-white p-6 shadow-[0_8px_24px_rgba(34,57,61,0.10)]"
      }
    >
      {mobileMode && (
        <div className="-mx-6 -mt-6 mb-6 flex items-center justify-between border-b border-[#E8ECEE] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉預訂選擇"
            className="text-[#30363A]"
          >
            <HiX className="size-7" />
          </button>

          <h2 className="text-xl font-extrabold text-[#292E33]">預訂選擇</h2>

          <span className="size-7" />
        </div>
      )}
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

        <div ref={calendarRef} className="relative">
          <button
            type="button"
            onClick={() => setIsCalendarOpen((open) => !open)}
            className="flex h-11 w-full items-center justify-between rounded-md border border-[#DCE2E4] px-3 text-left text-sm text-[#4F575C]"
          >
            <span>{selectedDate || "請選擇日期"}</span>

            <HiOutlineCalendar className="size-5 text-[#8B9297]" />
          </button>

          {isCalendarOpen && (
            <div className="absolute z-20 mt-2 w-full rounded-lg border border-[#DCE2E4] bg-white p-3 shadow-lg">
              <DayPicker
                mode="single"
                locale={zhTW}
                selected={new Date(`${selectedDate}T12:00:00`)}
                disabled={(date) => {
                  const dateKey = formatDateValue(date);
                  const todayKey = formatDateValue(new Date());

                  return dateKey < todayKey || !availableDateSet.has(dateKey);
                }}
                onSelect={(date) => {
                  if (!date) return;

                  const nextDate = formatDateValue(date);
                  const sessionsOnDate = sessions.filter(
                    (session) =>
                      formatDateValue(session.start_time) === nextDate,
                  );

                  const firstSessionOnDate =
                    sessionsOnDate.find(
                      (session) => session.remaining_participants > 0,
                    ) ?? sessionsOnDate[0];

                  if (!firstSessionOnDate) return;

                  setSelectedDate(nextDate);
                  setSelectedSessionId(firstSessionOnDate.id);
                  setIsCalendarOpen(false);
                }}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                components={{
                  Nav: () => (
                    <div className="rdp-nav">
                      <button
                        type="button"
                        disabled={!canGoPrevious}
                        onClick={() =>
                          canGoPrevious && setDisplayMonth(previousMonth)
                        }
                        aria-label="上一個月份"
                        className="rdp-button_previous text-[#4F575C] disabled:text-[#C7CDD0] disabled:opacity-50"
                      >
                        <HiChevronLeft className="size-6" />
                      </button>

                      <button
                        type="button"
                        disabled={!canGoNext}
                        onClick={() => canGoNext && setDisplayMonth(nextMonth)}
                        aria-label="下一個月份"
                        className="rdp-button_next text-[#4F575C] disabled:text-[#C7CDD0] disabled:opacity-50"
                      >
                        <HiChevronRight className="size-6" />
                      </button>
                    </div>
                  ),
                }}

                className="!text-[#4F575C]"
              />
            </div>
          )}
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
            className="h-11 w-full appearance-none rounded-md border border-[#DCE2E4] bg-white px-3 pr-11 text-sm text-[#4F575C] outline-none disabled:bg-[#F3F5F6] disabled:text-[#A0A7AC]"
          >
            {sessionsByDate.length > 0 ? (
              sessionsByDate.map((session) => {
                const remaining = session.remaining_participants;

                return (
                  <option
                    key={session.id}
                    value={session.id}
                    disabled={remaining <= 0}
                  >
                    {formatTimeRange(session.start_time, session.end_time)}
                    {remaining <= 0
                      ? "　（已額滿）"
                      : remaining <= 3
                        ? `　🔥 僅剩 ${remaining} 位名額`
                        : ""}
                  </option>
                );
              })
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
          disabled={isSoldOut}
        />

        <Stepper
          value={children}
          onChange={handleChildChange}
          label="孩童"
          price={childPrice}
          min={0}
          disabled={isSoldOut}
        />
      </div>
      <div className="my-5 flex items-center justify-between border-t border-[#E8ECEE] pt-5">
        <span className="font-bold text-[#545C61]">合計</span>
        <strong className="text-[20px] text-[#30363A]">
          NT$ {total.toLocaleString("zh-TW")}
        </strong>
      </div>

      <div className={mobileMode ? "block" : "grid grid-cols-2 gap-3"}>
        {mobileMode !== "direct" && (
          <button
            type="button"
            disabled={
              !selectedSession ||
              sessionsByDate.length === 0 ||
              isSoldOut ||
              exceedsRemainingSeats
            }
            onClick={() =>
              selectedSession &&
              onSubmit(selectedSession.id, adults, children, sessionName)
            }
            className="button-orange w-full font-bold"
          >
            {isEditMode ? "確認修改" : "加入購物車"}
          </button>
        )}

        {mobileMode !== "cart" && (
          <button
            type="button"
            disabled={
              !selectedSession ||
              sessionsByDate.length === 0 ||
              isSoldOut ||
              exceedsRemainingSeats
            }
            onClick={() =>
              selectedSession &&
              onDirectBook(selectedSession.id, adults, children, sessionName)
            }
            className="button-main w-full font-bold"
          >
            立即預訂
          </button>
        )}
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
