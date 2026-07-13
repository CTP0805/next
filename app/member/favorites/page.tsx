import FavoriteCard from "@/components/FavoriteCard";

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

export default function FavoritesPage() {
  return (
    <div className="text-[#292D32]">
      {/* 
        💡 修正 1：移除 min-h-screen 和過大的 pt-16。
        把原本的 mx-auto grid 簡化。手機版不需要多餘的 padding 塞在 layout 內。
      */}
      <div className="w-full">
        {/* 
          💡 修正 2：
          - 電腦版：維持原本的卡片包裝框。
          - 手機版：max-md:shadow-none max-md:rounded-none，拔掉重複的陰影跟圓角，
                   直接融入 layout 的大白底背景中！
        */}

        {/* 💡 修正 3：標題「我的心願清單」，手機版高度太空，微調內邊距 */}

        <div className="px-8 max-sm:px-0">
          {/* 
              💡 修正 4：
              - 加上 items-center，強迫「目前有12個體驗」跟「下拉選單」不論在哪種螢幕都垂直完美置中！
              - 攤平結構：把之前的 label 套娃改成乾淨的平級結構。
            */}
          <div className="flex min-h-[92px] items-center justify-between gap-4 border-b border-[#ECEFF0] max-md:hidden max-sm:min-h-0 max-sm:py-4">
            <p className="text-[17px] font-bold text-[#51585E] max-sm:text-[15px]">
              目前有{" "}
              <span className="text-[22px] font-extrabold text-[#68BBC3] max-sm:text-lg">
                12
              </span>{" "}
              個體驗等你去實現
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap text-[#8A9196] max-sm:hidden">
                排序方式
              </span>
              <select
                aria-label="排序方式"
                defaultValue="latest"
                className="select select-bordered h-10 min-h-10 rounded-md border border-[#E1E5E7] bg-white pr-10 pl-4 text-sm font-bold text-[#454B50] outline-none hover:border-[#68BBC3]"
              >
                <option value="latest">最新</option>
                <option value="rating">評價最高</option>
                <option value="price-low">價格低到高</option>
              </select>
            </div>
          </div>

          {/* 卡片列表 */}
          <div className="mt-6 flex flex-col gap-4 max-sm:mt-4">
            {favoriteItems.map((item) => (
              <FavoriteCard key={item.id} item={item} />
            ))}
          </div>

          {/* 
              💡 修正 5：複製剛才最成功的「手機版到底提示」！
              - 手機版：顯示溫馨橫線提示。
              - 電腦版：維持原樣 1, 2 分頁。
            */}
          <nav
            aria-label="心願清單分頁"
            className="flex items-center justify-center gap-2 py-10 max-sm:py-6"
          >
            {/* 📱 手機版專屬：溫馨的到底提示 */}
            <div className="hidden flex-col items-center gap-2 py-2 max-md:flex">
              <p className="text-sm font-medium tracking-wide text-[#8A9196]">
                到底了！暫時沒有其他體驗囉
              </p>
            </div>

            {/* 💻 電腦版分頁：加上 max-md:hidden 在手機版藏起來 */}
            <button
              type="button"
              aria-current="page"
              className="grid size-9 place-items-center rounded-md bg-[#68BBC3] text-sm font-extrabold text-white max-md:hidden"
            >
              1
            </button>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-md border border-[#E1E5E7] bg-white text-sm font-bold text-[#5B6268] hover:border-[#68BBC3] max-md:hidden"
            >
              2
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
