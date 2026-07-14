"use client";
const features = [
  { name: "古蹟巡禮", icon: "🌙", color: "bg-[#EFF6FF]" },
  { name: "藝文導覽", icon: "🎨", color: "bg-[#E0F2F1]" },
  { name: "美饌饗宴", icon: "🍴", color: "bg-[#FEE2E2]" },
  { name: "戶外探索", icon: "⛰️", color: "bg-[#FFEDD5]" },
  { name: "專人攝影", icon: "📷", color: "bg-[#F3F4F6]" },
  { name: "娛樂與夜生活", icon: "🎭", color: "bg-[#FAF5FF]" },
];

export default function IconMenu() {
  return (
    // 外層容器：確保在不同螢幕寬度下都能置中
    <section className="hidden md:flex">
      <div className="relative flex w-full justify-center py-8">
        {/* 核心容器：設定最大寬度、左右內距與背景樣式 */}
        <div className="w-full max-w-[1280px] px-[30px] shadow-2xs">
          <div className="flex flex-wrap items-center justify-around gap-4 rounded-[32px] bg-white p-6 shadow-xl">
            {features.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.color} cursor-paint shadow-sm`}
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
      </div>
    </section>
  );
}
