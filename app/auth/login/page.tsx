"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { z } from "zod";
import toast, { Toaster } from "react-hot-toast";
import { API_SERVER } from "@/config/api-path";

const loginSchema = z.object({
    account: z.email({ message: "請輸入正確的 Email 格式" }),
    password: z.string().min(8, { message: "請輸入8位以上的密碼(要做這個嗎?)" }),
});

export default function LoginPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  // showPassword 用來控制密碼要不要顯示出來
  const [showPassword, setShowPassword] = useState(false);

  // isLoading 用來控制按下登入後，按鈕顯示「登入中」
  const [isLoading, setIsLoading] = useState(false);

  

  // 使用者按下「登入」按鈕時會執行這個函式
  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    // 阻止表單預設刷新頁面的行為
    e.preventDefault();

    // step1. 格式驗證
    // 如果帳號或密碼沒填，就先提醒使用者
    if (!account || !password) {
      toast.error("請輸入帳號和密碼");
      return;
    }

    const trimmedAccount = account.trim();

    const zodResult = loginSchema.safeParse({
      account: trimmedAccount,
      password,
    });

    if (!zodResult.success) {
      if (zodResult.error?.issues?.length) {
        toast.error(zodResult.error.issues[0].message);
        return;
      }
    }

    try {
      // 開始送資料時，讓按鈕變成 loading 狀態
      setIsLoading(true);

      // 前端送資料給後端
      // API_SERVER 要確認 port 號
      const response = await fetch(`${API_SERVER}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: trimmedAccount,
          password,
        }),
      });

      // 把後端回傳的 JSON 轉成 JavaScript 物件
      const data = await response.json();

      // 如果後端說登入失敗
      if (!response.ok) {
        toast.error(data.message || "登入失敗(前端)");
        return;
      }

      // 如果登入成功，通常會把 token 存起來
      // 注意：正式專案更建議用 HttpOnly Cookie，這裡先用最容易懂的版本
      localStorage.setItem("token", data.token);
      toast.success("登入成功(前端)");

      // 之後你可以改成 router.push("/")
      // 例如：登入成功後導到首頁
    } catch (error) {
      // 如果網路壞掉、後端沒開，會進到這裡
      toast.error("系統發生錯誤，請稍後再試(後端沒開)");
    } finally {
      // 不管成功或失敗，都把 loading 關掉
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[url('/images/login-bg.jpg')] bg-cover bg-center text-white">
      <div>
        <Toaster />
      </div>
      {/* 整頁黑色透明遮罩 */}
      <div className="min-h-screen bg-black/10 backdrop-brightness-75">
        {/* 登入卡片置中 */}
        <section className="flex min-h-[calc(100vh-100px)] items-center justify-center px-6 py-12">
          <div className="grid w-[80%] max-w-[1280px] overflow-hidden rounded-[12px] border border-white/80 bg-black/35 shadow-2xl backdrop-blur-[2px] lg:grid-cols-2">
            {/* 左側登入表單 */}
            <div className="flex items-center justify-center px-8 py-12 sm:px-16 lg:px-20">
              <form onSubmit={handleLogin} className="w-full max-w-[470px]">
                <h2 className="mb-14 text-center">立即登入</h2>

                {/* 帳號 */}
                <div className="mb-8">
                  <label>帳號</label>
                  <input
                    type="email"
                    name="account"
                    
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                  />
                </div>

                {/* 密碼 */}
                <div>
                  <label>密碼</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      name="password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-14"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="顯示或隱藏密碼"
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-white hover:cursor-pointer hover:text-lime-200"
                    >
                      {showPassword ? <EyeOff size={25} /> : <Eye size={25} />}
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-right">
                  <Link
                    href="/auth/forget-password"
                    className="text-[16px] hover:text-lime-200"
                  >
                    忘記密碼?
                  </Link>
                </div>

                {/* 登入按鈕 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 h-[70px] w-full rounded-full border border-lime-200 bg-[#8fa66c]/85 text-3xl font-bold tracking-wide text-white hover:cursor-pointer hover:bg-[#9fb879]"
                >
                  {isLoading ? "登入中..." : "登入"}
                </button>

                {/* 分隔線 */}
                <div className="my-9 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/80" />
                  <span className="text-lg">or</span>
                  <div className="h-px flex-1 bg-white/80" />
                </div>

                {/* Google 登入 */}
                <button
                  type="button"
                  className="flex h-[64px] w-full items-center justify-center gap-4 rounded-xl border border-white/80 bg-white/5 text-3xl font-bold hover:cursor-pointer hover:bg-white/15"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-2xl font-bold">
                    <FcGoogle />
                  </span>
                  使用 Google 登入
                </button>

                <p className="mt-6 text-center text-[16px]">
                  還沒有帳號？
                  <Link
                    href="/auth/register"
                    className="ml-2 text-[16px] font-medium hover:text-lime-200"
                  >
                    立即註冊
                  </Link>
                </p>
              </form>
            </div>

            {/* 左右分隔線 */}

            {/* 右側圖片區 */}
            <div className="hidden min-h-[620px] border-l border-l-white bg-[url('/images/login-bg.jpg')] bg-cover bg-center lg:block">
              <div className="h-full bg-black/5 px-16 py-10">
                <h2 className="mt-6 text-left">探索下一段風景</h2>
                <div className="mt-2 h-[2px] w-28 bg-sky-200" />
                <p className="mt-4 text-xl tracking-wide">
                  收藏你的足跡，規劃每一次出發
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
