import Image from "next/image";

// components/PopularDestinations.js
const destinations = [
  { name: "倫敦", image: "/images/carousel1.jpeg" },
  { name: "巴黎", image: "/images/carousel1.jpeg" },
  { name: "慕尼黑", image: "/images/carousel1.jpeg" },
  { name: "阿姆斯特丹", image: "/images/carousel1.jpeg" },
  { name: "羅馬", image: "/images/carousel1.jpeg" },
  { name: "巴賽隆納", image: "/images/carousel1.jpeg" },

  // ... 其他資料
];
export default function PopularDestinations() {
  return (
    <section className="mt-10 py-12">
      <div className="mb-10 text-center">
        <h2 className="inline-block rounded-[16px] bg-[#45cad5] px-8 py-2 text-xl font-bold text-white">
          熱門地區
        </h2>
        <p className="mt-4 text-gray-500">下一站，去哪裡？</p>
      </div>

      {/* 手機版滑動區 */}
      <div className="scrollbar-none overflow-x-auto backdrop-blur md:hidden">
        {/* flex + w-max 是實現滑動的核心 */}
        <div className="flex w-max gap-4 pb-4">
          {destinations.map((dest, index) => (
            <div
              key={index}
              className="flex items-center rounded-full border border-gray-200 bg-white p-2 shadow-sm"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="ml-3 pr-4 font-medium whitespace-nowrap text-gray-700">
                {dest.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 桌機版：卡片網格 (md 以上才顯示) */}
      <div className="hidden grid-cols-3 gap-6 md:grid lg:grid-cols-6">
        {destinations.map((dest) => (
          <div key={dest.name} className="flex flex-col items-center">
            <div className="relative mb-4 aspect-[2/3] w-full overflow-hidden rounded-[176px]">
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-medium text-gray-700">{dest.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
