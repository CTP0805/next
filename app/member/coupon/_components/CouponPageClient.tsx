"use client";

/**
 * =============================================================================
 * 【新手導讀】優惠頁「互動主體」（CouponPageClient）
 * =============================================================================
 * page.tsx 載入 data 後丟進來；這裡管：
 *   - 主 Tab：優惠券 vs M 幣流水
 *   - 篩選、分頁、選券、兌換碼
 * 子元件分工：
 *   WalletBanner 餘額｜SegmentTabs 切換｜CouponList 列表｜
 *   TransactionList 流水｜RedeemCouponForm 兌換｜ListPagination 翻頁
 * =============================================================================
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import type {
  Coupon,
  CouponFilter,
  CouponPageTab,
  MemberBenefitsPayload,
  MemberCouponView,
  PointFilter,
} from "../types";
import { redeemCouponCode } from "../api";
import {
  clearSelectedCoupon,
  filterCoupons,
  filterTransactions,
  getTotalPages,
  LIST_PAGE_SIZE,
  normalizeRedeemCode,
  paginateList,
  saveSelectedCoupon,
} from "../utils";
import WalletBanner from "./WalletBanner";
import SegmentTabs from "./SegmentTabs";
import TransactionList from "./TransactionList";
import CouponList from "./CouponList";
import RedeemCouponForm from "./RedeemCouponForm";
import ListPagination from "./ListPagination";

interface CouponPageClientProps {
  data: MemberBenefitsPayload;
  onReload?: () => Promise<void> | void;
}

export default function CouponPageClient({
  data,
  onReload,
}: CouponPageClientProps) {
  const router = useRouter();
  // ---------- UI 狀態：分頁／篩選／選中券 ----------
  const [mainTab, setMainTab] = useState<CouponPageTab>("coupons");
  const [pointFilter, setPointFilter] = useState<PointFilter>("all");
  const [couponFilter, setCouponFilter] = useState<CouponFilter>("all");
  const [pointPage, setPointPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const [coupons, setCoupons] = useState<MemberCouponView[]>(data.coupons);
  const [redeemPool, setRedeemPool] = useState<Coupon[]>(data.redeemable_codes);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 父層重新 load 後同步列表
  useEffect(() => {
    setCoupons(data.coupons);
    setRedeemPool(data.redeemable_codes);
  }, [data]);

  // 回到優惠頁時清掉上次跳轉／未完成結帳的選用狀態
  useEffect(() => {
    clearSelectedCoupon();
    setSelectedId(null);
  }, []);

  // 各篩選條件的筆數（給 Tab badge）
  const pointCounts = useMemo(() => {
    const { transactions } = data;
    return {
      all: transactions.length,
      earned: transactions.filter((t) => t.status === "earned").length,
      used: transactions.filter((t) => t.status === "used").length,
      expired: transactions.filter((t) => t.status === "expired").length,
    };
  }, [data]);

  const couponCounts = useMemo(() => {
    return {
      all: coupons.length,
      available: coupons.filter((c) => c.status === "available").length,
      scheduled: coupons.filter((c) => c.status === "scheduled").length,
      used: coupons.filter((c) => c.status === "used").length,
      expired: coupons.filter((c) => c.status === "expired").length,
    };
  }, [coupons]);

  const filteredTransactions = useMemo(
    () => filterTransactions(data.transactions, pointFilter),
    [data.transactions, pointFilter],
  );

  const filteredCoupons = useMemo(
    () => filterCoupons(coupons, couponFilter),
    [coupons, couponFilter],
  );

  const pointTotalPages = getTotalPages(filteredTransactions.length);
  const couponTotalPages = getTotalPages(filteredCoupons.length);

  useEffect(() => {
    setPointPage(1);
  }, [pointFilter]);

  useEffect(() => {
    setCouponPage(1);
  }, [couponFilter]);

  useEffect(() => {
    setPointPage((p) => Math.min(p, pointTotalPages));
  }, [pointTotalPages]);

  useEffect(() => {
    setCouponPage((p) => Math.min(p, couponTotalPages));
  }, [couponTotalPages]);

  const pagedTransactions = useMemo(
    () => paginateList(filteredTransactions, pointPage),
    [filteredTransactions, pointPage],
  );

  const pagedCoupons = useMemo(
    () => paginateList(filteredCoupons, couponPage),
    [filteredCoupons, couponPage],
  );

  function handleUse(coupon: MemberCouponView) {
    if (coupon.status !== "available") {
      toast.error("此優惠券目前無法使用");
      return;
    }

    if (selectedId === coupon.member_coupon_id) {
      clearSelectedCoupon();
      setSelectedId(null);
      toast.success("已取消選用優惠券");
      return;
    }

    saveSelectedCoupon(coupon);
    setSelectedId(coupon.member_coupon_id);
    toast.success(`已選用「${coupon.title}」，前往購物車結帳時可套用`);
    router.push("/cart");
  }

  async function handleRedeem(rawCode: string) {
    const code = normalizeRedeemCode(rawCode);
    if (!code) {
      toast.error("請輸入優惠券代碼");
      return;
    }

    try {
      const coupon = await redeemCouponCode(code);
      setCoupons((prev) =>
        [coupon, ...prev.filter((c) => c.coupon_id !== coupon.coupon_id)].sort(
          (a, b) =>
            new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime(),
        ),
      );
      setRedeemPool((prev) => prev.filter((c) => c.id !== coupon.coupon_id));
      setMainTab("coupons");
      setCouponFilter("all");
      setCouponPage(1);
      toast.success(`成功領取「${coupon.title}」`);
      await onReload?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "兌換失敗");
    }
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden rounded-[12px] border border-gray-100 bg-white shadow-sm">
      <Toaster position="top-center" />
      <WalletBanner wallet={data.wallet} />

      <SegmentTabs<CouponPageTab>
        value={mainTab}
        onChange={setMainTab}
        items={[
          { key: "points", label: "M幣紀錄", count: pointCounts.all },
          { key: "coupons", label: "優惠券", count: couponCounts.all },
        ]}
      />

      {mainTab === "points" ? (
        <>
          <SegmentTabs<PointFilter>
            variant="secondary"
            value={pointFilter}
            onChange={setPointFilter}
            items={[
              { key: "all", label: "全部", count: pointCounts.all },
              { key: "earned", label: "已獲得", count: pointCounts.earned },
              { key: "used", label: "已使用", count: pointCounts.used },
              { key: "expired", label: "已過期", count: pointCounts.expired },
            ]}
          />
          <TransactionList items={pagedTransactions} />
          <ListPagination
            page={pointPage}
            totalItems={filteredTransactions.length}
            pageSize={LIST_PAGE_SIZE}
            onChange={setPointPage}
          />
        </>
      ) : (
        <>
          <RedeemCouponForm onRedeem={handleRedeem} />
          {redeemPool.length > 0 ? (
            <p className="bg-slate-50/50 px-5 pb-2 text-[11px] text-gray-400">
              可兌換代碼（格式 C+編號）：
              {redeemPool.map((c) => c.code).join("、")}
            </p>
          ) : (
            <p className="bg-slate-50/50 px-5 pb-2 text-[11px] text-gray-400">
              目前沒有可兌換的新券碼
            </p>
          )}
          <SegmentTabs<CouponFilter>
            variant="secondary"
            value={couponFilter}
            onChange={setCouponFilter}
            items={[
              { key: "all", label: "全部", count: couponCounts.all },
              {
                key: "available",
                label: "可使用",
                count: couponCounts.available,
              },
              {
                key: "scheduled",
                label: "尚未生效",
                count: couponCounts.scheduled,
              },
              { key: "used", label: "已使用", count: couponCounts.used },
              { key: "expired", label: "已過期", count: couponCounts.expired },
            ]}
          />
          <CouponList
            items={pagedCoupons}
            selectedMemberCouponId={selectedId}
            onUse={handleUse}
            demoOrderAmount={3000}
          />
          <ListPagination
            page={couponPage}
            totalItems={filteredCoupons.length}
            pageSize={LIST_PAGE_SIZE}
            onChange={setCouponPage}
          />
        </>
      )}
    </div>
  );
}
