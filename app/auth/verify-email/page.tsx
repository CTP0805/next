"use client";

import { useAuth } from "@/contexts/auth-context";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// TS 型別
type PageContent = {
  title: string;
  message: string;
  buttonText: string;
  buttonHref: string;
  buttonText1?: string;
  buttonHref1?: string;
};
/*
// 錯誤訊息(後端翻譯成前端) 有需要翻譯的那麼仔細嗎?? 還是統一回覆:驗證失敗，請聯繫客服
const failedContentMap: Record<string, PageContent> = {
  "missing-token": {
    title: "驗證連結不完整",
    message: "這個驗證連結缺少必要資料，請回到信箱重新點擊完整的驗證連結。",
    buttonText: "回到註冊",
    buttonHref: "/auth/register",
  },
  "wrong-purpose": {
    title: "驗證連結用途錯誤",
    message: "這個連結不是用來驗證信箱的，請確認你點擊的是最新的信箱驗證信。",
    buttonText: "回到註冊",
    buttonHref: "/auth/register",
  },
  "member-not-found": {
    title: "找不到會員資料",
    message: "系統找不到這個驗證連結對應的會員資料，請重新註冊或聯繫客服。",
    buttonText: "重新註冊",
    buttonHref: "/auth/register",
  },
  "invalid-or-expired": {
    title: "驗證連結已失效",
    message: "這個驗證連結可能已經過期，或連結內容不正確。請重新註冊或重新發送驗證信。",
    buttonText: "回到註冊",
    buttonHref: "/auth/register",
  },
};

const defaultFailedContent: PageContent = {
  title: "信箱驗證失敗",
  message: "驗證過程發生問題，請稍後再試，或重新發送驗證信。",
  buttonText: "回到註冊",
  buttonHref: "/auth/register",
  buttonText1: "重新發送驗證信(待開發)",
  buttonHref1: "/auth/register",
};

// function 根據後端給的回應決定前端要顯示什麼
function getPageContent(params: {
  success?: string | null;
  already?: string;
}): PageContent {
  const isSuccess = params.success === "true";
  const isAlreadyVerified = params.already === "true";

  // 成功狀態：信箱第一次驗證成功
  if (isSuccess && !isAlreadyVerified) {
    return {
      title: "信箱驗證成功",
      message: "你的信箱已完成驗證，現在可以登入並使用會員功能。",
      buttonText: "前往登入",
      buttonHref: "/auth/login",

    };
  }

  // 成功狀態：之前已經驗證過
  if (isSuccess && isAlreadyVerified) {
    return {
      title: "此信箱已驗證過",
      message: "你的信箱先前已完成驗證，可以直接登入會員。",
      buttonText: "前往登入",
      buttonHref: "/auth/login",

    };
  }

  // 失敗狀態：根據後端 redirect 過來的 message 顯示不同內容
  // if (params.message && failedContentMap[params.message]) {
  //   return failedContentMap[params.message];
  // }

  // 失敗狀態：沒有對應到任何 message，就顯示通用錯誤
  return defaultFailedContent;
}
*/

export default function EmailVerifiedPage() {
  const searchParams = useSearchParams();
  const { resendVerifyEmail } = useAuth();

  // 只在這裡判斷一次成功或失敗
  // 後面樣式全部共用這個 isSuccess 來決定顏色
  const success = searchParams.get("success");
  const already = searchParams.get("already");
  const email = searchParams.get("email");

  const isSuccess = success === "true";
  const isAlreadyVerified = already === "true";
  /*
  // 根據後端傳來的 query string，整理出畫面要顯示的資料
  const pageContent = getPageContent({
    success,
    already,
  });
  */

  return (
    <main className="flex h-[calc(100vh-60px)] items-center justify-center bg-gray-100 px-4">
      {/* 
        isSuccess 為 true：顯示成功框
        isSuccess 為 false：顯示失敗框
      */}
      {isSuccess ? (
        /* ==================== 成功訊息框 ==================== */
        <section className="w-full max-w-md rounded-[12px] bg-white p-8 text-center shadow">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
            ✔
          </div>

          <h3>{isAlreadyVerified ? "此信箱已驗證過" : "信箱驗證成功"}</h3>

          <p className="mt-3 text-gray-600">
            {isAlreadyVerified
              ? "你的信箱先前已完成驗證，可以直接登入會員。"
              : "你的信箱已完成驗證，現在可以登入並使用會員功能。"}
          </p>

          <Link
            href="/auth/login"
            className="button-green inline-block mt-6"
          >
            前往登入
          </Link>
        </section>
      ) : (
        /* ==================== 失敗訊息框 ==================== */
        <section className="w-full max-w-md rounded-[12px] bg-white p-8 text-center shadow">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
            !
          </div>

          <h3>信箱驗證失敗</h3>

          <p className="mt-3 text-gray-600">
            驗證連結可能已過期、內容不正確，或驗證過程發生問題。
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/auth/register"
              className="button-white"
            >
              回到註冊
            </Link>

            <button
              type="button"
              onClick={() => { // 確保 querystring 有 email
                if (email) {
                  void resendVerifyEmail(email);
                }
              }}
              className="button-red"
            >
              重新發送驗證信
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
