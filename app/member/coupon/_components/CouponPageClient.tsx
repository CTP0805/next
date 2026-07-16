"use client";

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
import {
  clearSelectedCoupon,
  deriveCouponStatus,
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
}

export default function CouponPageClient({ data }: CouponPageClientProps) {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<CouponPageTab>("coupons");
  const [pointFilter, setPointFilter] = useState<PointFilter>("all");
  const [couponFilter, setCouponFilter] = useState<CouponFilter>("all");
  const [pointPage, setPointPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const [coupons, setCoupons] = useState<MemberCouponView[]>(data.coupons);
  const [redeemPool, setRedeemPool] = useState<Coupon[]>(data.redeemable_codes);
  /** 僅本次停留在此頁時的暫選；不從 localStorage 還原，避免跳轉後殘留「已選用」 */
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [nextLocalId, setNextLocalId] = useState(() => {
    const maxId = data.coupons.reduce(
      (max, c) => Math.max(max, c.member_coupon_id),
      0,
    );
    return maxId + 1;
  });

  // 回到優惠頁時清掉上次跳轉／未完成結帳的選用狀態
  useEffect(() => {
    clearSelectedCoupon();
    setSelectedId(null);
  }, []);

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

    // 再點同一張 = 取消選用
    if (selectedId === coupon.member_coupon_id) {
      clearSelectedCoupon();
      setSelectedId(null);
      toast.success("已取消選用優惠券");
      return;
    }

    saveSelectedCoupon(coupon);
    setSelectedId(coupon.member_coupon_id);
    toast.success(`已選用「${coupon.title}」，前往購物車結帳時可套用`);
    // 跳轉後此頁 unmount；回來時 effect 會清掉選用狀態
    router.push("/cart");
  }

  function handleRedeem(rawCode: string) {
    const code = normalizeRedeemCode(rawCode);
    if (!code) {
      toast.error("請輸入優惠券代碼");
      return;
    }

    if (coupons.some((c) => c.code.toUpperCase() === code)) {
      toast.error("您已擁有此優惠券");
      return;
    }

    const catalogItem = redeemPool.find((c) => c.code.toUpperCase() === code);
    if (!catalogItem) {
      toast.error("查無此優惠券代碼");
      return;
    }

    if (new Date(catalogItem.expires_at).getTime() < Date.now()) {
      toast.error("此優惠券已過期，無法領取");
      return;
    }

    const now = new Date();
    const memberCouponId = nextLocalId;
    setNextLocalId((n) => n + 1);

    const view: MemberCouponView = {
      ...catalogItem,
      id: catalogItem.id,
      member_coupon_id: memberCouponId,
      member_id: data.wallet.user_id,
      coupon_id: catalogItem.id,
      is_used: false,
      received_at: now.toISOString(),
      used_at: null,
      status: deriveCouponStatus({ is_used: false }, catalogItem, now),
      order_id: null,
    };

    setCoupons((prev) =>
      [view, ...prev].sort(
        (a, b) =>
          new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime(),
      ),
    );
    setRedeemPool((prev) => prev.filter((c) => c.id !== catalogItem.id));
    setMainTab("coupons");
    setCouponFilter("all");
    setCouponPage(1);
    toast.success(`成功領取「${catalogItem.title}」`);
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden rounded-[12px] border border-gray-100 bg-white shadow-sm">
      <Toaster position="top-center" />
      <WalletBanner wallet={data.wallet} />

      <SegmentTabs<CouponPageTab>
        value={mainTab}
        onChange={setMainTab}
        items={[
          { key: "points", label: "酷幣紀錄", count: pointCounts.all },
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
              可試用兌換碼：
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
