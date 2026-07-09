import Image from "next/image";

// components/PopularDestinations.js
const destinations = [
  { name: "日本", image: "/images/carousel1.jpg" },
  { name: "法國", image: "/images/carousel1.jpg" },
  { name: "法國", image: "/images/carousel1.jpg" },
  { name: "法國", image: "/images/carousel1.jpg" },
  { name: "法國", image: "/images/carousel1.jpg" },
  { name: "法國", image: "/images/carousel1.jpg" },

  // ... 其他資料
];

export default function PopularDestinations() {
  return (
    <section className="w-max[1280px] mt-25 px-4 py-12">
      {/* 標題與副標題 */}
      <div className="mb-10 text-center">
        <h2 className="inline-block rounded-full bg-teal-500 px-6 py-2 text-xl font-bold text-white">
          熱門地區
        </h2>
        <p className="mt-4 text-gray-500">下一站，去哪裡？</p>
      </div>

      {/* 卡片網格 */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
        {destinations.map((dest) => (
          <div key={dest.name} className="flex flex-col items-center">
            {/* 圖片遮罩容器 */}
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
