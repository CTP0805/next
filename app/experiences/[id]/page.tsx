"use client";

import Image from "next/image";
import { useState } from "react";

const gallery = [
  {
    src: "/images/experiences/seine-picnic.jpg",
    alt: "朋友在塞納河畔野餐",
  },
  {
    src: "/images/experiences/paris-market.jpg",
    alt: "巴黎在地市場",
  },
  {
    src: "/images/experiences/paris-cafe.jpg",
    alt: "巴黎露天咖啡館",
  },
  {
    src: "/images/experiences/paris-car.jpg",
    alt: "巴黎街區散步",
  },
  {
    src: "/images/experiences/paris-arcade.jpg",
    alt: "巴黎鐵塔街景",
  },
] as const;

const highlights = [
  "10 年在巴黎生活的在地嚮導，帶你避開觀光人潮，從日常視角認識城市。",
  "每團最多 8 人的小團體驗，保留充分交流與彈性停留的時間。",
  "品嚐法式起司、麵包與自然酒，認識巴黎人的餐桌文化。",
  "行程節奏輕鬆，可依天氣與成員喜好微調，適合第一次來巴黎的旅人。",
];

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

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-10 place-items-center rounded-md border border-[#DDE3E5] bg-white text-lg text-[#5C666C] transition-colors hover:border-[#68BBC3] hover:text-[#419AA2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68BBC3]"
    >
      {children}
    </button>
  );
}

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

function BookingCard() {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const unitPrice = 1960;
  const total = adults * unitPrice;

  return (
    <aside className="sticky top-6 rounded-lg border border-[#DDE3E5] bg-white p-6 shadow-[0_8px_24px_rgba(34,57,61,0.10)]">
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
        <p className="text-xs font-bold text-[#656D72]">參加人數</p>
        <Stepper value={adults} onChange={setAdults} label="成人" />
        <Stepper value={children} onChange={setChildren} label="孩童" />
      </div>

      <div className="my-5 flex items-center justify-between border-t border-[#E8ECEE] pt-5">
        <span className="font-bold text-[#545C61]">合計</span>
        <strong className="text-[20px] text-[#30363A]">
          NT$ {total.toLocaleString("zh-TW")}
        </strong>
      </div>

      <button
        type="button"
        className="h-12 w-full rounded-md bg-[#68BBC3] text-[16px] font-extrabold text-white transition-colors hover:bg-[#55AAB2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68BBC3]"
      >
        選擇方案
      </button>

      <p className="mt-4 text-center text-xs text-[#8B9297]">
        預訂前不會向您收費
      </p>

      <ul className="mt-5 space-y-2 border-t border-[#E8ECEE] pt-5 text-xs font-medium text-[#6F777C]">
        <li>◉ 48 小時前免費取消</li>
        <li>◉ 小團體驗，最多 8 人成行</li>
        <li>◉ meet locals 體驗品質保障</li>
      </ul>
    </aside>
  );
}

function HostSection() {
  return (
    <section id="host" className="scroll-mt-6 pt-12">
      <h2 className="text-[24px] font-extrabold">你的在地嚮導</h2>

      <div className="mt-7 grid grid-cols-[180px_minmax(0,1fr)] gap-10 max-sm:grid-cols-1">
        <div className="text-center">
          <div className="relative mx-auto size-28 overflow-hidden rounded-lg">
            <Image
              src="/images/experiences/paris-cafe.jpg"
              alt="在地嚮導 Camille"
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
          <p className="mt-4 text-[21px] font-extrabold">Camille</p>
          <p className="mt-1 text-sm text-[#858C91]">巴黎嚮導</p>
        </div>

        <dl className="space-y-6 pt-2">
          <div className="grid grid-cols-[54px_minmax(0,1fr)] gap-4">
            <dt className="text-2xl font-extrabold text-[#68BBC3]">8</dt>
            <dd>
              <strong className="block text-sm">8 年在地帶路經驗</strong>
              <span className="mt-1 block text-sm leading-6 text-[#737B80]">
                熟悉巴黎左岸、市集與河岸居民才知道的日常路線。
              </span>
            </dd>
          </div>
          <div className="grid grid-cols-[54px_minmax(0,1fr)] gap-4">
            <dt className="text-lg font-extrabold text-[#68BBC3]">A+</dt>
            <dd>
              <strong className="block text-sm">中文、英文與法文</strong>
              <span className="mt-1 block text-sm leading-6 text-[#737B80]">
                會在自然交流中補充文化背景，讓每個人都能自在參與。
              </span>
            </dd>
          </div>
          <div className="grid grid-cols-[54px_minmax(0,1fr)] gap-4">
            <dt className="text-sm font-extrabold text-[#68BBC3]">4.96</dt>
            <dd>
              <strong className="block text-sm">4.96 平均評分</strong>
              <span className="mt-1 block text-sm leading-6 text-[#737B80]">
                超過 800 場小團體驗，旅客最常提到她的自然與細心。
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        className="mt-8 h-11 w-full rounded-md bg-[#ECEEEF] text-sm font-extrabold text-[#525A60] transition-colors hover:bg-[#E1E5E6]"
      >
        聯絡 Camille
      </button>
    </section>
  );
}

function LocationSection() {
  return (
    <section id="location" className="scroll-mt-6 pt-12">
      <h2 className="text-[24px] font-extrabold">集合地點</h2>
      <p className="mt-4 text-sm leading-7 text-[#687076]">
        巴黎地鐵 1 號線 Saint-Paul 站 1 號出口。嚮導會拿著 meet locals
        水綠色帆布袋等候。
      </p>

      <div className="relative mt-5 h-[320px] overflow-hidden rounded-lg border border-[#DDE3E5] bg-[#F0F1EB]">
        <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(28deg,transparent_46%,white_47%,white_51%,transparent_52%),linear-gradient(-35deg,transparent_45%,#DCE6EA_46%,#DCE6EA_52%,transparent_53%),linear-gradient(90deg,transparent_47%,white_48%,white_52%,transparent_53%)] [background-size:150px_120px,210px_170px,110px_100px]" />
        <div className="absolute bottom-0 left-0 h-20 w-full bg-[#C7E5ED]" />
        <div className="absolute left-[52%] top-[47%] -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="mx-auto block size-5 rounded-full border-4 border-white bg-[#EF5963] shadow-md" />
          <span className="mt-2 block rounded bg-[#EF5963] px-3 py-1.5 text-xs font-extrabold text-white shadow">
            MEETING POINT
          </span>
        </div>
        <span className="absolute left-[43%] top-[61%] rounded bg-white/90 px-2 py-1 text-sm font-extrabold text-[#555D62]">
          Saint-Paul
        </span>
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section id="reviews" className="scroll-mt-6 pt-12">
      <h2 className="text-[24px] font-extrabold">旅人好評</h2>

      <div className="mt-5 flex w-fit items-center gap-4 rounded-md bg-[#EAF7F7] px-4 py-3">
        <strong className="text-[25px] text-[#4FAAB2]">4.9</strong>
        <span>
          <span className="block tracking-[2px] text-[#68BBC3]">★★★★★</span>
          <span className="block text-xs text-[#71797E]">
            來自 1,284 則已驗證評價
          </span>
        </span>
      </div>

      <div className="mt-7 divide-y divide-[#ECEFF0]">
        {reviews.map((review, index) => (
          <article key={review.name} className="py-7 first:pt-0">
            <div className="flex items-start gap-4">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#EAF7F7] shadow-[0_2px_8px_rgba(34,57,61,0.12)]">
                <Image
                  src={review.avatar}
                  alt={`${review.name} 的旅客頭貼`}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <strong className="text-sm">{review.name}</strong>
                  <time className="shrink-0 text-xs text-[#979DA1]">
                    {review.date}
                  </time>
                </div>
                <p className="mt-1 text-xs tracking-[1px] text-[#68BBC3]">
                  ★★★★★
                </p>
                <p
                  className={`mt-3 text-sm leading-7 text-[#5F676C] ${
                    index > 4 ? "font-medium" : ""
                  }`}
                >
                  {review.content}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <nav aria-label="評價分頁" className="mt-8 flex justify-center gap-2">
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

function NotesSection() {
  const notes = [
    ["參加條件", "建議年滿 12 歲；每團最多 8 人，未滿 18 歲需由成人陪同。"],
    ["取消政策", "體驗開始前 48 小時可免費取消，逾期恕不退款。"],
    ["天候安排", "小雨照常進行；遇惡劣天候將協助改期或全額退款。"],
    ["行走強度", "全程約步行 2.5 公里，建議穿著舒適好走的鞋。"],
  ];

  return (
    <section
      id="notes"
      className="scroll-mt-6 border-t border-[#DDE3E5] pb-8 pt-12"
    >
      <h2 className="text-[24px] font-extrabold">注意事項</h2>
      <div className="mt-7 grid grid-cols-2 gap-x-12 gap-y-8 max-sm:grid-cols-1">
        {notes.map(([title, content]) => (
          <div
            key={title}
            className="grid grid-cols-[28px_minmax(0,1fr)] gap-3"
          >
            <span className="text-lg text-[#68BBC3]">◉</span>
            <div>
              <h3 className="text-sm font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#747C81]">{content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ExperienceDetailPage() {
  return (
    <div className="min-h-screen bg-white text-[#292E33]">
      <header
        aria-label="Navbar 元件預留區"
        className="h-20 w-full bg-[#68BBC3]"
      />

      <main className="mx-auto w-full max-w-[1280px] px-6 pb-28 pt-10 max-sm:px-4">
        <nav className="text-sm font-medium" aria-label="麵包屑">
          {/* 1. 可點擊或主要的層級：全部改成亮青色 [#68BBC3] */}
          <span className="font-bold text-[#68BBC3] cursor-pointer hover:underline">
            首頁
          </span>
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="text-[#68BBC3] cursor-pointer hover:underline">
            法國
          </span>
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="text-[#68BBC3] cursor-pointer hover:underline">
            巴黎
          </span>
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="text-[#68BBC3] cursor-pointer hover:underline">
            美食饗宴
          </span>

          {/* 2. 最後一層（當前商品）：維持原本的灰色 [#7B8388]，代表不用點擊 */}
          <span className="mx-2 text-[#7B8388]">›</span>
          <span className="text-[#7B8388] truncate max-w-[200px] inline-block align-bottom">
            塞納河黃昏野餐
          </span>
        </nav>

        <section className="mt-7 grid h-[510px] grid-cols-2 gap-2 overflow-hidden rounded-lg max-md:h-auto max-md:grid-cols-1">
          <div className="relative min-h-[360px] overflow-hidden">
            <Image
              src={gallery[0].src}
              alt={gallery[0].alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 62vw"
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-2 max-md:h-[320px]">
            {gallery.slice(1).map((photo, index) => (
              <div key={photo.src} className="relative overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover"
                />
                {index === 3 && (
                  <button
                    type="button"
                    className="absolute bottom-4 right-4 rounded-md bg-black/65 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm"
                  >
                    查看全部 12 張
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-end justify-between gap-6 py-7">
          <div>
            <h1 className="text-[30px] font-extrabold leading-tight">
              塞納河黃昏野餐、橋上故事與小酒館收尾
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#727A7F]">
              <span className="font-extrabold text-[#F4A629]">★ 4.9</span>
              <span>1,284 則評價</span>
              <span>18K+ 人參加</span>
              <span>體驗時間：3.5 小時</span>
              <span>中文 / English</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <IconButton label="分享體驗">↗</IconButton>
            <IconButton label="加入我的最愛">♡</IconButton>
          </div>
        </section>

        <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-12 max-lg:grid-cols-1">
          <div className="min-w-0">
            <nav className="sticky top-0 z-20 flex gap-8 border-y border-[#DEE3E5] bg-white/95 px-1 backdrop-blur max-sm:overflow-x-auto">
              {[
                ["#overview", "體驗介紹"],
                ["#host", "在地嚮導"],
                ["#location", "集合地點"],
                ["#reviews", "旅人好評"],
                ["#notes", "注意事項"],
              ].map(([href, label], index) => (
                <a
                  key={href}
                  href={href}
                  className={`shrink-0 border-b-2 py-4 text-sm font-extrabold ${
                    index === 0
                      ? "border-[#68BBC3] text-[#4CA3AB]"
                      : "border-transparent text-[#555D62] hover:text-[#4CA3AB]"
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>

            <section id="overview" className="scroll-mt-6 pt-9">
              <ul className="space-y-4">
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 text-sm leading-7 text-[#61696E]"
                  >
                    <span className="text-[#68BBC3]">◎</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>

            <HostSection />
            <LocationSection />
            <ReviewsSection />
            <NotesSection />
          </div>

          <BookingCard />
        </div>
      </main>

      <footer
        aria-label="Footer 元件預留區"
        className="h-[420px] w-full bg-[#D9ECEE]"
      />
    </div>
  );
}
