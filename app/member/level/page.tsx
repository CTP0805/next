"use client";
// ↑ 語法：Next.js App Router 指令
//   有這行 → 此檔是「客戶端元件」，可以在瀏覽器跑 useState / useEffect
//   沒這行 → 預設 Server Component，不能用大部分 React hooks

/**
 * =============================================================================
 * 【新手導讀】會員等級頁 路由：/member/level
 * 檔案路徑：next/app/member/level/page.tsx
 * （App Router：資料夾 member/level + page.tsx = 網址 /member/level）
 * =============================================================================
 * 資料流：
 *   本頁 load() → ./api 的 fetchMemberLevel()
 *              → 後端 GET /api/member-level（api-member-level.ts）
 *              → data 傳給 level.tsx、levelcontent.tsx
 * =============================================================================
 */

// ---------- import：從哪來、幹嘛用 ----------

// react：UI 函式庫
//   useState    → 宣告「會變動、變了要重畫畫面」的變數
//   useEffect   → 在「渲染之後」做副作用（打 API、訂閱…）
//   useCallback → 把函式包起來記住，避免每次 render 都是新函式（給 useEffect 依賴用）
import { useCallback, useEffect, useState } from "react";

// 全站登入狀態：@/contexts/auth-context
//   @ 通常指專案根目錄（next/）
//   isAuthenticated：有沒有登入
//   authInit：登入狀態是否已檢查完（避免一進來就誤判未登入）
import { useAuth } from "@/contexts/auth-context";

// 同資料夾 ./api.ts
//   fetchMemberLevel：打 GET /api/member-level
//   type MemberLevelPayload：只引入型別（編譯後會消失，不佔執行檔）
import { fetchMemberLevel, type MemberLevelPayload } from "./api";

// 同資料夾 UI 子元件（預設 export → 可自己取名）
//   level.tsx        → 右側等級主面板
//   levelcontent.tsx → 詳情抽屜
import MemberLevelRightPanel from "./level";
import MemberLevelDetailDrawer from "./levelcontent";

/**
 * =============================================================================
 * 【主要元件函式】MemberLevelPage
 * =============================================================================
 * export default：這個檔案的「預設匯出」，Next 會把它當此路由的頁面元件
 * function 名稱：PascalCase 是 React 元件慣例
 * =============================================================================
 */
export default function MemberLevelPage() {
  // 解構賦值：const { a, b } = obj  等同  const a = obj.a; const b = obj.b
  const { isAuthenticated, authInit } = useAuth();

  // useState(初始值) 回傳 [目前值, 設定函式]
  //   setXxx(新值) 會觸發元件重新 render
  // boolean：true/false
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // <型別>：泛型指定 state 內容
  // MemberLevelPayload | null：有資料或還沒載入／失敗
  const [data, setData] = useState<MemberLevelPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 【函式】load — 向後端拉等級資料
   * 對應路由：GET /api/member-level（經由 fetchMemberLevel）
   *
   * useCallback(fn, 依賴陣列)
   *   依賴 [] 空陣列 → 這個函式只建立一次，不會每次 render 換新參考
   * async () => {}：非同步箭頭函式
   */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // try：包可能失敗的程式；失敗跳 catch，最後一定跑 finally
      const payload = await fetchMemberLevel();
      setData(payload);
    } catch (e) {
      // instanceof：檢查 e 是不是 Error 類別的實例
      setError(e instanceof Error ? e.message : "載入失敗");
      // 三元運算：條件 ? 真的值 : 假的值
      setData(null);
    } finally {
      // 成功或失敗都要把 loading 關掉
      setLoading(false);
    }
  }, []); // 依賴空：不關閉 load 參考

  /**
   * useEffect(函式, 依賴陣列)
   *   依賴改變時，render 後再執行函式
   *   這裡：等 auth 就緒 → 已登入就 load，未登入就顯示錯誤字
   *
   * return 提早離開：if (!authInit) return; 後面程式不跑
   * void load()：呼叫 Promise 但不 await（在 effect 裡常見寫法）
   */
  useEffect(() => {
    if (!authInit) return;
    if (!isAuthenticated) {
      setLoading(false);
      setError("請先登入以查看會員等級");
      return;
    }
    void load();
  }, [authInit, isAuthenticated, load]);

  /**
   * return (JSX)
   *   JSX = 看起來像 HTML 的 JS 語法，編譯後變 React.createElement(...)
   *   className = HTML 的 class（class 在 JS 是保留字所以改名）
   *   { 大括號 } = 插入 JS 表達式
   *   條件 ? A : B 或 條件 && 元素 = 條件渲染
   *   <>...</> = Fragment，不產生多餘 DOM 節點的包裹
   *   onClick={() => ...} = 點擊時執行的箭頭函式
   */
  return (
    <div className="w-full min-w-0 max-w-full">
      {loading ? (
        // 載入中 UI
        <div className="rounded-[12px] border border-gray-100 bg-white px-5 py-16 text-center text-sm text-gray-400">
          載入中…
        </div>
      ) : error ? (
        // 錯誤 UI（可重試）
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
        // 正常：主面板 + 抽屜（抽屜用 isOpen 控制顯示）
        <>
          <MemberLevelRightPanel
            data={data}
            // props：父傳子的資料／回呼
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
