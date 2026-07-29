import Image from "next/image";
import { HiStar } from "react-icons/hi";

type ExperienceReview = {
  id: number;
  member_id: number;
  rating: number;
  comment: string;
  created_at: string;
  image_url: string | null;
  member_name: string | null;
  member_avatar: string | null;
  member_city: string | null;
  departure_date: string | null;
};

type ReviewsSectionProps = {
  rating: number;
  reviewCount: number;
  reviews: ExperienceReview[];
};

export default function ReviewsSection({
  rating,
  reviewCount,
  reviews,
}: ReviewsSectionProps) {
  return (
    <section id="reviews" className="scroll-mt-20 pt-14">
      <h4>旅人好評</h4>

      <div className="mt-4 mb-10 flex flex-wrap items-center gap-2">
        {/* 💡 核心修正：加上 -mr-1.5，把右邊的數字往左拉近 */}
        <HiStar className="-mr-1.5 size-5 shrink-0 text-[#FFA938]" />

        <strong className="text-[20px] font-black tracking-tight text-[#FFA938]">
          {rating}
        </strong>

        <span className="mx-1 h-3 w-px bg-gray-300" />

        <span className="text-[14px] font-semibold text-[#5E656B]">
          {reviewCount} 則已驗證評價
        </span>
      </div>

      <div className="mt-7 mb-10 flex scrollbar-none flex-col gap-6 max-sm:-mx-4 max-sm:snap-x max-sm:snap-mandatory max-sm:flex-row max-sm:gap-4 max-sm:divide-y-0 max-sm:overflow-x-auto max-sm:px-4 sm:divide-y sm:divide-[#ECEFF0]">
        {reviews.map((review, index) => (
          <article
            key={review.id}
            className="w-full text-left max-sm:w-[80vw] max-sm:shrink-0 max-sm:snap-center max-sm:rounded-xl max-sm:border max-sm:border-[#ECEFF0] max-sm:bg-white max-sm:p-5 max-sm:shadow-sm sm:py-7 sm:first:pt-0 sm:last:pb-0"
          >
            {/* 1. 頂部資訊列 (左右分開) */}
            <div className="flex items-start justify-between gap-4">
              {/* 頂部左側：頭像 + 名字/標籤 */}
              <div className="flex items-center gap-3">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#EAF7F7] shadow-[0_2px_8px_rgba(34,57,61,0.12)]">
                  <Image
                    src={
                      review.member_avatar
                        ? `http://localhost:3001${review.member_avatar}`
                        : "/images/member-avatar/angry-man.jpg"
                    }
                    alt={`${review.member_name ?? "會員"}的頭像`}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <strong className="text-[14px] font-bold text-[#292E33]">
                    {review.member_name ?? `旅人 #${review.member_id}`}
                  </strong>
                  {/* 手機版模擬截圖中的標籤，電腦版可隱藏或留著 */}
                  <span className="mt-0.5 text-[12px] text-[#8A9196] max-sm:inline-block">
                    {review.member_city ?? "台灣"}
                  </span>
                </div>
              </div>

              {/* 頂部右側：雙日期資訊 */}
              <div className="flex flex-col text-right text-[12px] leading-4 text-[#8A9196]">
                <div>
                  <span className="mr-1 text-[#ABAFB2]">出發日</span>
                  <span>
                    {review.departure_date
                      ? new Date(review.departure_date).toLocaleDateString(
                          "zh-TW",
                        )
                      : "未提供"}
                  </span>
                </div>
                <div>
                  <span className="mr-1 text-[#ABAFB2]">評論於</span>
                  <span>
                    {new Date(review.created_at).toLocaleDateString("zh-TW")}
                  </span>
                </div>
              </div>
            </div>
            {/* 2. 中間內容區塊 (全部獨立成行，完美靠左) */}

            {/* 藍色星星獨立一行 */}
            <div className="mt-3 flex items-center gap-0.5 text-[#68BBC3]">
              {[...Array(review.rating)].map((_, i) => (
                <HiStar key={i} className="size-4 shrink-0" />
              ))}
            </div>

            <p className="mt-2 text-[14px] leading-6 font-normal text-[#5F676C]">
              {review.comment}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
