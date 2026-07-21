"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { fetchMemberLevel, type MemberLevelPayload } from "./api";
import MemberLevelRightPanel from "./level";
import MemberLevelDetailDrawer from "./levelcontent";

/**
 * 會員等級頁
 * - 資料來自 Express /api/member-level（銅／銀／金）
 * - 排版維持原有面板 + 詳情抽屜
 */
export default function MemberLevelPage() {
  const { isAuthenticated, authInit } = useAuth();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [data, setData] = useState<MemberLevelPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchMemberLevel();
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "載入失敗");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authInit) return;
    if (!isAuthenticated) {
      setLoading(false);
      setError("請先登入以查看會員等級");
      return;
    }
    void load();
  }, [authInit, isAuthenticated, load]);

  return (
    <div className="w-full min-w-0 max-w-full">
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
        <>
          <MemberLevelRightPanel
            data={data}
            onOpenDetail={() => setIsDetailOpen(true)}
          />
          <MemberLevelDetailDrawer
            data={data}
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
          />
        </>
      ) : null}
    </div>
  );
}
