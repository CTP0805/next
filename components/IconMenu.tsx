"use client";
import Link from "next/link";
import Image from "next/image";
const features = [
  {
    name: "古蹟巡禮",
    icon: "/icon/01-temple.png",
    color: "bg-[#EFF6FF]",
    href: "http://localhost:3000/experiences/search?category_ids=1",
  },
  {
    name: "藝文導覽",
    icon: "/icon/05-artwork.png",
    color: "bg-[#E0F2F1]",
    href: "http://localhost:3000/experiences/search?category_ids=2",
  },
  {
    name: "美饌饗宴",
    icon: "/icon/04-burger-fries.png",
    color: "bg-[#FEE2E2]",
    href: "http://localhost:3000/experiences/search?category_ids=3",
  },
  {
    name: "戶外探索",
    icon: "/icon/02-climber.png",
    color: "bg-[#FFEDD5]",
    href: "http://localhost:3000/experiences/search?category_ids=4",
  },
  {
    name: "專人攝影",
    icon: "/icon/06-camera.png",
    color: "bg-[#F3F4F6]",
    href: "http://localhost:3000/experiences/search?category_ids=5",
  },
  {
    name: "娛樂與夜生活",
    icon: "/icon/03-party.png",
    color: "bg-[#FAF5FF]",
    href: "http://localhost:3000/experiences/search?category_ids=6",
  },
];

export default function IconMenu() {
  return (
    // 外層容器：確保在不同螢幕寬度下都能置中
    <section className="flex justify-center">
      {/* 核心容器：設定最大寬度、左右內距與背景樣式 */}
      <div className="w-full max-w-[1280px]">
        <div className="flex scrollbar-none items-center gap-6 overflow-x-auto rounded-[32px] bg-white p-6 backdrop-blur md:justify-around md:gap-4 md:shadow-2xl">
          {features.map((item, index) => (
            <div key={index} className="flex gap-3">
              <Link
                href={item.href}
                className="flex flex-col items-center justify-center"
              >
                <div
                  className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${item.color} shadow-sm`}
                >
                  <Image
                    src={item.icon}
                    alt="fill"
                    fill
                    className="object-cover"
                  />
                </div>

                <span className="mt-3 text-center whitespace-nowrap text-gray-800">
                  {item.name}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
