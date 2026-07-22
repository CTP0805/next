"use client";
// 客戶端頁：hooks + toast

/**
 * =============================================================================
 * 【新手導讀＋語法】優惠頁  路由：/member/coupon
 * 檔案：next/app/member/coupon/page.tsx
 * =============================================================================
 * 本頁：登入檢查 + 載入 benefits
 * 子頁互動：CouponPageClient
 * 後端：GET /api/member-coupon/benefits（api-member-coupon.ts）
 * =============================================================================
 */

// ---------- import ----------

// React hooks（見 level/page 語法說明）
import { useCallback, useEffect, useState } from "react";

// react-hot-toast：輕量提示（成功/失敗小彈窗）
//   toast(...) 在子元件也可能用；Toaster 是顯示容器，一個頁面放一次
import toast, { Toaster } from "react-hot-toast";

// 登入狀態：@/contexts/auth-context
import { useAuth } from "@/contexts/auth-context";

// 同資料夾 API：GET /api/member-coupon/benefits
import { fetchMemberBenefits } from "./api";

// 型別：benefits 整包 data
import type { MemberBenefitsPayload } from "./types";

// 子元件：真正的列表／兌換／分頁 UI
//   路徑 ./_components/... 底線資料夾 = 非正式路由片段（不會變成 /_components 網址）
import CouponPageClient from "./_components/CouponPageClient";

/**
 * =============================================================================
 * 【主要元件】MemberCouponPage
 * export default → Next 路由頁面
 * =============================================================================
 */
export default function MemberCouponPage() {
  const { isAuthenticated, authInit } = useAuth();

  // data：後端整包；null = 尚未成功載入
  const [data, setData] = useState<MemberBenefitsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 【函式】load
   * 對應：fetchMemberBenefits → GET /api/member-coupon/benefits
   * 也會當 onReload 傳給 CouponPageClient（兌換成功後重抓）
   * useCallback(..., [])：函式參考穩定
   */
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
      // 可選：toast.error(message) — 目前用畫面上 error 區塊
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 登入流程就緒後才 load
   * void load()：不 await 的 fire-and-forget
   */
  useEffect(() => {
    if (!authInit) return;
    if (!isAuthenticated) {
      setLoading(false);
      setError("請先登入以查看 M幣與優惠券");
      return;
    }
    void load();
  }, [authInit, isAuthenticated, load]);

  /**
   * JSX：
   *   <Toaster /> 掛提示容器
   *   三態：loading / error / data
   *   data 就緒 → <CouponPageClient data={data} onReload={load} />
   *     props 傳遞：把函式 load 當 onReload 傳下去（子元件兌換後呼叫）
   */
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
