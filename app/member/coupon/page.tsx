"use client";

import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import { fetchMemberBenefits } from "./api";
import type { MemberBenefitsPayload } from "./types";
import CouponPageClient from "./_components/CouponPageClient";

/**
 * 會員優惠頁（M幣紀錄 + 優惠券）
 * - 資料來自 Express /api/member-coupon/benefits（不再使用 mock）
 * - 列表每頁 10 筆，超過可翻頁
 */
export default function MemberCouponPage() {
  const { isAuthenticated, authInit } = useAuth();
  const [data, setData] = useState<MemberBenefitsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchMemberBenefits();
      setData(payload);
    } catch (e) {
      const message = e instanceof Error ? e.message : "載入失敗";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authInit) return;
    if (!isAuthenticated) {
      setLoading(false);
      setError("請先登入以查看 M幣與優惠券");
      return;
    }
    void load();
  }, [authInit, isAuthenticated, load]);

  return (
    <div className="w-full max-w-full min-w-0">
      <Toaster position="top-center" />
      <h1 className="mb-1 text-xl font-bold text-gray-800">我的優惠</h1>
      <p className="mb-4 text-sm text-gray-500">
        管理 M幣與優惠券，結帳時可折抵消費
      </p>

      {loading ? (
        <div className="rounded-[12px] border border-gray-100 bg-white px-5 py-16 text-center text-sm text-gray-400">
          載入中…
        </div>
      ) : error ? (
        <div className="rounded-[12px] border border-red-100 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
          {error}
          {isAuthenticated ? (
            <button
              type="button"
              className="mt-4 block w-full text-[#45cad5] underline"
              onClick={() => void load()}
            >
              重試
            </button>
          ) : null}
        </div>
      ) : data ? (
        <CouponPageClient data={data} onReload={load} />
      ) : null}
    </div>
  );
}
