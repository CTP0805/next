import Image from "next/image";
import { HiStar } from "react-icons/hi";

const reviews = [
  {
    name: "思婷・台北",
    date: "2024/05/18",
    avatar: "/images/favorites/seine-picnic.jpg",
    content:
      "Camille 不像是在帶導覽，更像朋友帶我們散步。市場攤販和河邊故事都很自然，最後的小酒館完全不會有觀光行程的壓力。",
  },
  {
    name: "James・London",
    date: "2024/04/29",
    avatar: "/images/experiences/paris-cafe.jpg",
    content:
      "Small, thoughtful and genuinely local. The pacing was excellent and Camille made everyone feel included from the first minute.",
  },
  {
    name: "Yuki・Tokyo",
    date: "2024/06/12",
    avatar: "/images/experiences/paris-market.jpg",
    content:
      "セーヌ川でのピクニックは最高でした。カミーユさんの説明はとても分かりやすく、パリの日常を感じることができました。",
  },
  {
    name: "Marc・Paris",
    date: "2024/05/30",
    avatar: "/images/experiences/paris-car.jpg",
    content:
      "Même en habitant à Paris, j'ai découvert des coins que je ne connaissais pas. Une expérience authentique et chaleureuse.",
  },
  {
    name: "Sarah・New York",
    date: "2024/06/05",
    avatar: "/images/experiences/montmartre-walk.jpg",
    content:
      "The perfect way to spend an evening in Paris. Camille is a wonderful host and the picnic spread was delicious!",
  },
  {
    name: "Lucas・Berlin",
    date: "2024/04/15",
    avatar: "/images/experiences/paris-dinner.jpg",
    content:
      "Tolle Tour abseits der Touristenpfade. Die Auswahl der Weine im Bistro war exzellent.",
  },
  {
    name: "Elena・Madrid",
    date: "2024/05/22",
    avatar: "/images/favorites/paris-street.jpg",
    content:
      "Una velada mágica. Camille nos hizo sentir como en casa desde el primer momento. Muy recomendable.",
  },
  {
    name: "Chen・Singapore",
    date: "2024/06/18",
    avatar: "/images/experiences/montmartre-art.jpg",
    content:
      "Loved the small group setting. It felt very personal and the stories about the bridges were fascinating.",
  },
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="scroll-mt-20 pt-14">
      <h4>旅人好評</h4>

      <div className="mt-4 mb-10 flex flex-wrap items-center gap-2">
        {/* 💡 核心修正：加上 -mr-1.5，把右邊的數字往左拉近 */}
        <HiStar className="-mr-1.5 size-5 shrink-0 text-[#FFA938]" />

        <strong className="text-[20px] font-black tracking-tight text-[#FFA938]">
          4.9
        </strong>

        <span className="mx-1 h-3 w-px bg-gray-300" />

        <span className="text-[14px] font-semibold text-[#5E656B]">
          1,284 則已驗證評價
        </span>
      </div>

      <div className="mt-7 mb-10 flex scrollbar-none flex-col gap-6 max-sm:-mx-4 max-sm:snap-x max-sm:snap-mandatory max-sm:flex-row max-sm:gap-4 max-sm:divide-y-0 max-sm:overflow-x-auto max-sm:px-4 sm:divide-y sm:divide-[#ECEFF0]">
        {reviews.map((review, index) => (
          <article
            key={review.name}
            className="w-full text-left max-sm:w-[80vw] max-sm:shrink-0 max-sm:snap-center max-sm:rounded-xl max-sm:border max-sm:border-[#ECEFF0] max-sm:bg-white max-sm:p-5 max-sm:shadow-sm sm:py-7 sm:first:pt-0 sm:last:pb-0"
          >
            {/* 1. 頂部資訊列 (左右分開) */}
            <div className="flex items-start justify-between gap-4">
              {/* 頂部左側：頭像 + 名字/標籤 */}
              <div className="flex items-center gap-3">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#EAF7F7] shadow-[0_2px_8px_rgba(34,57,61,0.12)]">
                  <Image
                    src={review.avatar}
                    alt={`${review.name} 的旅客頭貼`}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <strong className="text-[14px] font-bold text-[#292E33]">
                    {review.name}
                  </strong>
                  {/* 手機版模擬截圖中的標籤，電腦版可隱藏或留著 */}
                  <span className="mt-0.5 text-[12px] text-[#8A9196] max-sm:inline-block">
                    同行旅人
                  </span>
                </div>
              </div>

              {/* 頂部右側：雙日期資訊 */}
              <div className="flex flex-col text-right text-[12px] leading-4 text-[#8A9196]">
                <div>
                  <span className="mr-1 text-[#ABAFB2]">出發日</span>
                  <span>{review.date}</span>
                </div>
                <div>
                  <span className="mr-1 text-[#ABAFB2]">評論於</span>
                  <span>{review.date}</span>
                </div>
              </div>
            </div>

            {/* 2. 中間內容區塊 (全部獨立成行，完美靠左) */}

            {/* 藍色星星獨立一行 */}
            <div className="mt-3 flex items-center gap-0.5 text-[#68BBC3]">
              {[...Array(5)].map((_, i) => (
                <HiStar key={i} className="size-4 shrink-0" />
              ))}
            </div>

            {/* 詳細評論正文 (保留你原本的 index > 4 邏輯) */}
            <p
              className={`mt-2 text-[14px] leading-6 text-[#5F676C] ${
                index > 4 ? "font-medium" : ""
              }`}
            >
              {review.content}
            </p>
          </article>
        ))}
      </div>

      <nav
        aria-label="評價分頁"
        className="mt-10 flex justify-center gap-2 pb-4 max-sm:hidden"
      >
        <button className="grid size-9 place-items-center rounded-md border border-[#DDE3E5]">
          ‹
        </button>
        <button className="grid size-9 place-items-center rounded-md border border-[#DDE3E5]">
          ›
        </button>
      </nav>
    </section>
  );
}
