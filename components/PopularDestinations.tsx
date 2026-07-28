import Link from "next/link";
import Image from "next/image";

// components/PopularDestinations.js
const destinations = [
  {
    name: "倫敦",
    image: "/images/city/london.webp",
    href: "/experiences/search?city=倫敦",
  },
  {
    name: "威尼斯",
    image: "/images/city/venice.jpeg",
    href: "/experiences/search?city=威尼斯",
  },
  {
    name: "慕尼黑",
    image: "/images/city/munich.jpg",
    href: "/experiences/search?city=慕尼黑",
  },
  {
    name: "阿姆斯特丹",
    image: "/images/city/amsterdam.jpg",
    href: "/experiences/search?city=阿姆斯特丹",
  },

  {
    name: "巴黎",
    image: "/images/city/paris.jpg",
    href: "/experiences/search?city=巴黎",
  },
  {
    name: "巴賽隆納",
    image: "/images/city/barcelona.jpg",
    href: "/experiences/search?city=巴賽隆納",
  },
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
            <Link key={index} href={dest.href}>
              <div className="flex items-center rounded-full border border-gray-200 bg-white p-2 shadow-sm">
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
            </Link>
          ))}
        </div>
      </div>

      {/* 桌機版：卡片網格 (md 以上才顯示) */}
      {/* 桌機版 */}
      <div className="hidden grid-cols-3 gap-6 md:grid lg:grid-cols-6">
        {destinations.map((dest) => (
          <Link key={dest.name} href={dest.href} className="group">
            <div className="flex flex-col items-center">
              <div className="relative mb-4 aspect-[2/3] w-full overflow-hidden rounded-[176px] duration-500 ease-out will-change-transform md:h-[340px] md:group-hover:-translate-y-2 md:group-hover:shadow-[0_16px_34px_rgba(39,68,72,0.16)]">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-medium text-gray-700">{dest.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
