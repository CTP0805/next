import Image from "next/image";

type FavoriteItem = {
  id: number;
  title: string;
  location: string;
  rating: string;
  reviews: string;
  tag: string;
  price: string;
  image: string;
};

const favoriteItems: FavoriteItem[] = [
  {
    id: 1,
    title: "塞納河黃昏野餐、橋上故事與小酒館收尾",
    location: "法國・巴黎",
    rating: "4.9",
    reviews: "1,284 則評價",
    tag: "美食饗宴",
    price: "NT$ 1,960",
    image: "/images/favorites/seine-picnic.jpg",
  },
  {
    id: 2,
    title: "左岸咖啡館、書店與巷弄晨間散步",
    location: "法國・巴黎左岸",
    rating: "4.9",
    reviews: "942 則評價",
    tag: "戶外探索",
    price: "NT$ 1,180",
    image: "/images/favorites/left-bank-cafe.jpg",
  },
  {
    id: 3,
    title: "巴士底市場：起司、麵包與主廚選品",
    location: "法國・巴士底",
    rating: "4.8",
    reviews: "678 則評價",
    tag: "美食饗宴",
    price: "NT$ 2,860",
    image: "/images/favorites/paris-view.jpg",
  },
  {
    id: 4,
    title: "蒙馬特居民路線：畫室、階梯與街角故事",
    location: "法國・蒙馬特",
    rating: "4.8",
    reviews: "809 則評價",
    tag: "戶外探索",
    price: "NT$ 1,340",
    image: "/images/favorites/montmartre.jpg",
  },
  {
    id: 5,
    title: "運河邊的週末：小店巡禮與朋友午餐",
    location: "法國・聖馬丁運河",
    rating: "4.7",
    reviews: "386 則評價",
    tag: "美食饗宴",
    price: "NT$ 1,720",
    image: "/images/favorites/paris-night.jpg",
  },
  {
    id: 6,
    title: "巴黎建築師帶路：拱廊、庭院與城市細節",
    location: "法國・巴黎市中心",
    rating: "4.9",
    reviews: "327 則評價",
    tag: "戶外探索",
    price: "NT$ 1,890",
    image: "/images/favorites/europe-canal.jpg",
  },
  {
    id: 7,
    title: "居民酒館與夜色：從餐桌認識巴黎",
    location: "法國・巴黎夜間",
    rating: "4.8",
    reviews: "447 則評價",
    tag: "美食饗宴",
    price: "NT$ 1,680",
    image: "/images/favorites/eiffel-district.jpg",
  },
  {
    id: 8,
    title: "從巴黎出發：歐洲小城慢旅行",
    location: "歐洲・小團旅行",
    rating: "4.7",
    reviews: "166 則評價",
    tag: "戶外探索",
    price: "NT$ 2,780",
    image: "/images/favorites/paris-street.jpg",
  },
];

function FavoriteRow({ item }: { item: FavoriteItem }) {
  return (
    <article className="relative grid min-h-[200px] grid-cols-[220px_minmax(0,1fr)] gap-6 border-b border-[#ECEFF0] py-7 last:border-b-0 max-md:grid-cols-[150px_minmax(0,1fr)] max-md:gap-4 max-sm:grid-cols-1">
      <div className="relative h-[172px] overflow-hidden rounded-md bg-[#EEF1F2] max-md:h-[150px] max-sm:h-[220px]">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) calc(100vw - 48px), 220px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-col py-2 pr-16 max-sm:pr-0">
        <h2 className="text-[17px] font-bold leading-7 text-[#2B2F33]">
          {item.title}
        </h2>
        <p className="mt-1 text-sm font-medium text-[#7A8187]">
          {item.location}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-extrabold text-[#F4A629]">★ {item.rating}</span>
          <span className="font-medium text-[#6F777D]">{item.reviews}</span>
        </div>

        <span className="mt-3 w-fit rounded bg-[#E8F7F7] px-3 py-1 text-xs font-bold text-[#409DA5]">
          {item.tag}
        </span>

        <p className="mt-auto self-end text-[20px] font-extrabold text-[#30343A]">
          {item.price}
        </p>
      </div>

      <button
        type="button"
        aria-label={`將「${item.title}」移出我的最愛`}
        className="absolute right-2 top-8 grid size-10 place-items-center text-[30px] leading-none text-[#EF5963] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68BBC3]"
      >
        ♥
      </button>
    </article>
  );
}

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#292D32]">
      <header
        aria-label="Navbar 元件預留區"
        className="h-20 w-full bg-[#68BBC3]"
      />

      <main className="mx-auto grid w-full max-w-[1280px] grid-cols-[280px_minmax(0,1fr)] gap-6 px-6 pb-28 pt-16 max-lg:grid-cols-1 max-sm:px-4 max-sm:pt-8">
        <aside
          aria-label="會員中心側欄元件預留區"
          className="min-h-[640px]:rounded-lg bg-white shadow-[0_5px_18px_rgba(30,48,52,0.09)] max-lg:hidden"
        />

        <section className="overflow-hidden rounded-lg bg-white shadow-[0_5px_18px_rgba(30,48,52,0.09)]">
          <header className="border-b border-[#ECEFF0] px-8 py-6 max-sm:px-5">
            <h1 className="text-[28px] font-extrabold leading-tight">
              我的心願清單
            </h1>
          </header>

          <div className="px-8 max-sm:px-5">
            <div className="flex min-h-[92px] items-center justify-between gap-4 border-b border-[#ECEFF0] max-sm:items-start max-sm:py-5">
              <p className="text-[17px] font-bold text-[#51585E]">
                目前有{" "}
                <span className="text-[22px] font-extrabold text-[#68BBC3]">
                  12
                </span>{" "}
                個體驗等你去實現
              </p>

              <label className="flex shrink-0 items-center gap-3 text-sm font-medium text-[#8A9196]">
                <span className="max-sm:hidden">排序方式</span>
                <select
                  aria-label="排序方式"
                  defaultValue="latest"
                  className="h-10 rounded-md border border-[#E1E5E7] bg-white px-4 text-sm font-bold text-[#454B50] outline-none focus:border-[#68BBC3] focus:ring-2 focus:ring-[#68BBC3]/20"
                >
                  <option value="latest">最新</option>
                  <option value="rating">評價最高</option>
                  <option value="price-low">價格低到高</option>
                </select>
              </label>
            </div>

            <div>
              {favoriteItems.map((item) => (
                <FavoriteRow key={item.id} item={item} />
              ))}
            </div>

            <nav
              aria-label="心願清單分頁"
              className="flex items-center justify-center gap-2 py-10"
            >
              <button
                type="button"
                aria-current="page"
                className="grid size-9 place-items-center rounded-md bg-[#68BBC3] text-sm font-extrabold text-white"
              >
                1
              </button>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-md border border-[#E1E5E7] bg-white text-sm font-bold text-[#5B6268] hover:border-[#68BBC3]"
              >
                2
              </button>
            </nav>
          </div>
        </section>
      </main>

      <footer
        aria-label="Footer 元件預留區"
        className="h-[360px] w-full bg-[#D9ECEE]"
      />
    </div>
  );
}
