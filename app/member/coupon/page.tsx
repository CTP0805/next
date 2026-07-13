import { getMemberBenefits } from "./mock-data";
import CouponPageClient from "./_components/CouponPageClient";

/**
 * 會員優惠頁（酷幣紀錄 + 優惠券）
 * - 列表每頁 10 筆，超過可翻頁
 * - mock 預設擁有 15 張優惠券
 */
export default async function MemberCouponPage() {
  const data = await getMemberBenefits();

  return (
    <div className="w-full min-w-0 max-w-full">
      <h1 className="mb-1 text-xl font-bold text-gray-800">我的優惠</h1>
      <p className="mb-4 text-sm text-gray-500">
        管理酷幣與優惠券，結帳時可折抵消費
      </p>
      <CouponPageClient data={data} />
    </div>
  );
}
