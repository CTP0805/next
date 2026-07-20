"use client";

import { SyntheticEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { API_SERVER } from "@/config/api-path";

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

const resetpasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        message: "密碼至少需要 8 個字",
      })
      .regex(/[A-Za-z]/, {
        message: "密碼必須包含英文",
      })
      .regex(/\d/, {
        message: "密碼必須包含數字",
      }),
    confirmPassword: z.string().min(1, {
      message: "請再次輸入密碼",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "兩次輸入的密碼不一致",
    path: ["confirmPassword"],
  });

// 錯誤畫面元件
function ResetPasswordError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow">
        <div className="mb-4 text-5xl">❌</div>

        <h1 className="mb-3 text-2xl font-bold text-gray-800">
          重設密碼連結無效
        </h1>

        <p className="mb-6 text-gray-600">
          此連結可能已經過期、已經使用過，或網址中的驗證資訊不正確。
        </p>

        <Link
          href="/auth/forgot-password"
          className="inline-block rounded bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          重新申請重設密碼
        </Link>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const valid = searchParams.get("valid");
  const token = searchParams.get("token");
  const router = useRouter();

  // 只有 valid=true 才能顯示重設密碼畫面
  if (valid !== "true") {
    return <ResetPasswordError />;
  }

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

    // showPassword 用來控密碼要不要顯示出來
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // isLoading 用來控制按下登入後，按鈕顯示「登入中」
  const [isLoading, setIsLoading] = useState(false);

  // 使用者按下「登入」按鈕時會執行這個函式
  async function handleResetPassword(
    e: SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    // 阻止表單預設刷新頁面的行為
    e.preventDefault();

    const zodResult = resetpasswordSchema.safeParse({
      password,
      confirmPassword,
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
      const response = await fetch(`${API_SERVER}/api/auth/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "重設密碼失敗(前端)");
        return;
      }

      if (response.ok) {
        toast.success(result.message || "重設密碼成功(前端)");
        router.push("/auth/login");        
        return;
      }
    } catch (error) {
      // 如果網路壞掉、後端沒開，會進到這裡
      toast.error("系統發生錯誤，請稍後再試(後端壞掉)");
    } finally {
      // 不管成功或失敗，都把 loading 關掉
      setIsLoading(false);
    }
    
  }

  return (
    <>
      <main className="min-h-screen bg-[url('/images/login-bg.jpg')] bg-cover bg-[position:48%_center] xl:bg-left text-white">
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
                <form
                  onSubmit={handleResetPassword}
                  className="w-full max-w-[470px]"
                >
                  <h2 className="mb-10 text-center">重設密碼</h2>

                  <div className="mb-6 sm:mb-8">
                  <label>密碼<span className="text-[12px]">（ 請輸入8位以上包含英文、數字 ）</span></label>
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
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-white hover:cursor-pointer hover:text-[#68BBC3]"
                    >
                      {showPassword ? <EyeOff size={25} /> : <Eye size={25} />}
                    </button>
                  </div>
                </div>

                {/* 確認密碼 */}
                <div>
                  <label>確認密碼</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      name="confirmPassword"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-14"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label="顯示或隱藏密碼"
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-white hover:cursor-pointer hover:text-[#68BBC3]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={25} />
                      ) : (
                        <Eye size={25} />
                      )}
                    </button>
                  </div>
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
