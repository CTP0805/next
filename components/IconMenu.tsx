"use client";
const features = [
  { name: "古蹟巡禮", icon: "🌙", color: "bg-[#EFF6FF]" },
  { name: "藝文導覽", icon: "🎨", color: "bg-[#E0F2F1]" },
  { name: "美饌饗宴", icon: "🍴", color: "bg-[#FEE2E2]" },
  { name: "戶外探索", icon: "⛰️", color: "bg-[#FFEDD5]" },
  { name: "專人攝影", icon: "📷", color: "bg-[#F3F4F6]" },
  { name: "娛樂", icon: "🎭", color: "bg-[#FAF5FF]" },
];

export default function IconMenu() {
  return (
    // 外層容器：確保在不同螢幕寬度下都能置中
    <section className="flex justify-center">
      {/* 核心容器：設定最大寬度、左右內距與背景樣式 */}
      <div className="w-full max-w-[1280px] px-[30px]">
        <div className="flex scrollbar-none items-center gap-6 overflow-x-auto rounded-[32px] bg-white p-6 backdrop-blur md:justify-around md:gap-4 md:shadow-2xl">
          {features.map((item, index) => (
            <div
              key={index}
              className="cursor-paint flex flex-col items-center gap-3"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.color} shadow-sm`}
              >
                {item.icon}
              </div>
              <span className="text-sm font-medium text-gray-800">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
