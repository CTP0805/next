"use client";

import { SyntheticEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import toast, { Toaster } from "react-hot-toast";

// 還不確定用不用的到
type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
};

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  // isLoading 用來控制按下登入後，按鈕顯示「登入中」
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 使用者按下「登入」按鈕時會執行這個函式
  async function handleLogin(
    e: SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    // 阻止表單預設刷新頁面的行為
    e.preventDefault();

    // 等等就會替換成這段
    try {
      setIsLoading(true);
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

    /*
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
          email: trimmedEmail,
          password,
        }),
      });

      const result = await response.json();

      // 如果後端說登入失敗
      if (!response.ok) {
        toast.error(result.message || "登入失敗(前端)");
        return;
      }

      // 如果登入成功，通常會把 token 存起來
      // 注意：正式專案更建議用 HttpOnly Cookie，這裡先用最容易懂的版本
      if (response.ok) {
        localStorage.setItem("kenny-auth", JSON.stringify(result.data));
        toast.success(result.message || "登入成功(前端)");
        router.push("/");
        return;
      }

      // 之後你可以改成 router.push("/")
      // 例如：登入成功後導到首頁
    } catch (error) {
      // 如果網路壞掉、後端沒開，會進到這裡
      toast.error("系統發生錯誤，請稍後再試(後端沒開)");
    } finally {
      // 不管成功或失敗，都把 loading 關掉
      setIsLoading(false);
    }
    */
  }

  return (
    <>
      <main className="min-h-screen bg-[url('/images/login-bg.jpg')] bg-cover bg-left text-white">
        <div>
          <Toaster />
        </div>

        {/* 背景遮罩 */}
        <div className="min-h-screen bg-black/10 backdrop-brightness-75">
          {/* 外層 container：負責控制整體寬度與 RWD 留白 */}
          <section className="container mx-auto flex min-h-[calc(100vh-100px)] w-[90%] items-center justify-center py-[50px] xl:w-[66%]">
            {/* 
            卡片主體：
            手機：只顯示表單，寬度 max-w-md
            桌機(xl以上)：左右 flex 兩欄，最大寬度 1280px
            */}
            <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[12px] border border-white/80 bg-black/35 shadow-2xl backdrop-blur-[2px] xl:max-w-[1280px] xl:flex-row">
              {/* 左側：登入表單 */}
              <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 sm:py-12 xl:w-1/2 xl:px-16 xl:px-20">
                <form onSubmit={handleLogin} className="w-full max-w-[470px]">
                  <h2 className="mb-10 text-center">重設密碼</h2>
                  

                  {/* 新密碼 */}
                  <div className="mb-6 sm:mb-8">
                    <label>新密碼</label>
                    <input
                      type="text"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {/* 確認新密碼 */}
                  <div className="mb-6 sm:mb-8">
                    <label>確認新密碼</label>
                    <input
                      type="text"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  {/* 登入按鈕 */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-6 h-[56px] w-full rounded-full border border-sky-200 bg-[#68BBC3]/85 text-2xl font-bold tracking-wide text-white hover:bg-[#68BBC3] sm:h-[70px] sm:text-[24px]"
                  >
                    {isLoading ? "正在發送.." : "送出"}
                  </button>

                  <p className="mt-6 text-center text-[16px]">
                    想起密碼了?
                    <Link
                      href="/auth/login"
                      className="ml-2 text-[16px] hover:text-[#68BBC3]"
                    >
                      返回登入
                    </Link>
                  </p>
                </form>
              </div>

              {/* 右側圖片文案區：手機版 hidden，只在 xl 以上顯示 */}
              {/* 最小高度 764px --> 與登入頁卡片同高 */}
              <div className="hidden min-h-[764px] w-1/2 border-l border-l-white bg-[url('/images/login-bg.jpg')] bg-cover bg-center xl:flex">
                <div className="h-full w-full bg-black/5 px-16 py-10">
                  <h3 className="mt-6 text-left">探索下一段風景</h3>
                  <div className="mt-2 h-[2px] w-28 bg-sky-200" />
                  <p className="mt-3 text-[18px] tracking-wide">
                    收藏你的足跡，規劃每一次出發
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
