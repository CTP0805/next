"use client";

import { SyntheticEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";
import { API_SERVER } from "@/config/api-path";
import useFirebase, {
  type GoogleProviderData,
} from "../_hook/use-firebase/index";

// TS 型別專區
type RegisterResponse = {
  success: boolean;
  message: string;
};

type GoogleLoginResponse = {
  success: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    email: string;
    token: string;
  };
};

// 格式驗證專區
const registerSchema = z
  .object({
    name: z.string().trim().min(1, {
      message: "請輸入姓名",
    }),
    email: z.email({ message: "請輸入正確的 Email 格式" }),
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

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // showPassword 用來控密碼要不要顯示出來
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // isLoading 用來控制按下登入後，按鈕顯示「登入中」
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { refreshAuth } = useAuth();
  const { loginGoogle } = useFirebase(); // 第三方登入
  
  const router = useRouter();
  const searchParams = useSearchParams();


  // 使用者按下「註冊」按鈕時會執行這個函式
  async function handleRegister(
    e: SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    // 阻止表單預設刷新頁面的行為
    e.preventDefault();

    const trimmedEmail = email.trim();

    // step1. 前端驗證格式
    const zodResult = registerSchema.safeParse({
      name,
      email: trimmedEmail,
      password,
      confirmPassword,
    });

    if (!zodResult.success) {
      if (zodResult.error?.issues?.length) {
        toast.error(zodResult.error.issues[0].message);
        return;
      }
    }

    // step2. fetch
    try {
      setIsLoading(true);

      const response = await fetch(`${API_SERVER}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email:trimmedEmail,
          password,
        }),
      });
      const result = (await response.json()) as RegisterResponse;

      // step3. 解析回應、toast

      if (!response.ok) {
        toast.error(result.message || "註冊失敗(前端)");
        return;
      }

      if (response.ok) {
        toast.success(result.message || "註冊成功(前端)");
        router.push("/auth/login");
        return;
      }

    } catch (error) {
      console.warn(error);
      toast.error("系統發生錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }

    
  }

  // google 第三方登入
  async function handleGoogleLogin(providerData: GoogleProviderData): Promise<void> {
    const next = searchParams.get("next");
    try {
      setIsGoogleLoading(true);

      // 前端送什麼？
      // 送 Google / Firebase 回傳的 providerData 給後端
      // 裡面會有 uid、email、displayName、photoURL、providerId
      const response = await fetch(`${API_SERVER}/api/auth/oauth-google`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(providerData),
      });

      // 後端回什麼？
      // success、message、data，並且後端會順便把 JWT 寫進 HttpOnly Cookie
      const result = (await response.json()) as GoogleLoginResponse;

      if (!response.ok) {
        toast.error(result.message || "Google 登入失敗");
        return;
      }

      await refreshAuth(); // 刷新context裡面的狀態(一般登入不用是因為他已經在context裡面刷新)
      toast.success(result.message || "Google 登入成功");
      router.replace(next ?? "/"); // 登入後跳轉回上一個畫面 或首頁
    } catch (error) {
      console.warn(error);
      toast.error("Google 登入時發生錯誤，請稍後再試");
    } finally {
      setIsGoogleLoading(false);
    }
  }


  return (
    <main className="min-h-screen bg-[url('/images/register-bg.jpg')] bg-cover bg-[position:33%_center] xl:bg-left text-white">
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
            {/* 左側圖片文案區：手機版 hidden，只在 xl 以上顯示 */}
            <div className="hidden min-h-[620px] w-1/2 border-r border-r-white bg-[url('/images/register-bg.jpg')] bg-cover bg-[position:30%_center] xl:flex">
              <div className="h-full w-full bg-black/5 px-16 py-10">
                <h3 className="mt-6 text-left">加入旅程</h3>
                <div className="mt-2 h-[2px] w-28 bg-sky-200" />
                <p className="mt-3 text-[18px] tracking-wide">
                  每一步，都是新的風景
                </p>
              </div>
            </div>

            {/* 右側：註冊表單 */}
            <div className="relative flex w-full items-center justify-center px-5 py-10 sm:px-8 sm:py-12 xl:w-1/2 xl:px-16 xl:px-20">
              {/* 一鍵輸入的隱藏按鈕 */}
              {/* 註冊帳號 */}
              <button
                  type="button"
                  onClick={() => {setName("陳彥程"); setEmail("kenny94crazy@gmail.com"); setPassword("a123456789"); setConfirmPassword("a123456789")}}
                  aria-label="顯示或隱藏密碼"
                  className="absolute top-1 left-1  w-10 h-10 hover:cursor-pointer"
                ></button>
              <form onSubmit={handleRegister} className="w-full max-w-[470px]">
                <h2 className="mb-2 text-center xl:mb-4">建立帳號</h2>

                {/* 姓名 */}
                <div className="mb-6 sm:mb-8">
                  <label>姓名</label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* 電子信箱 */}
                <div className="mb-6 sm:mb-8">
                  <label>電子信箱</label>
                  <input
                    type="text"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* 密碼 */}
                <div className="mb-6 sm:mb-8">
                  <label>密碼<span className="text-[12px]">（ 請輸入8位以上包含英文、數字 ）</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      name="password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-14"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="顯示或隱藏密碼"
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-white hover:cursor-pointer hover:text-[#68BBC3]"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                      autoComplete="new-password"
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
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* <div className="mt-4 text-right">
                    <Link
                      href="/auth/forgot-password"
                      className="text-[16px] hover:text-[#68BBC3]"
                    >
                      忘記密碼?
                    </Link>
                  </div> */}

                {/* 登入按鈕 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 h-[56px] w-full rounded-full border border-sky-200 bg-[#68BBC3]/85 text-2xl font-bold tracking-wide text-white hover:bg-[#68BBC3] sm:h-[70px] sm:text-[24px]"
                >
                  {isLoading ? "註冊中..." : "註冊"}
                </button>

                {/* 分隔線 */}
                <div className="my-7 flex items-center gap-4 sm:my-9">
                  <div className="h-px flex-1 bg-white/80" />
                  <span className="text-lg">or</span>
                  <div className="h-px flex-1 bg-white/80" />
                </div>

                {/* Google 登入 */}
                <button
                    type="button"
                    disabled={isGoogleLoading}
                    onClick={() => {
                      loginGoogle(handleGoogleLogin);
                    }}
                    className="flex h-[56px] w-full items-center justify-center gap-3 rounded-xl border border-white/80 bg-white/5 text-xl font-bold hover:bg-white/15 sm:h-[64px] sm:gap-4 sm:text-[24px]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-2xl font-bold sm:h-9 sm:w-9">
                      <FcGoogle />
                    </span>
                    <span>
                      {isGoogleLoading ? "Google 登入中..." : "使用 Google 登入"}
                    </span>
                  </button>

                <p className="mt-6 text-center text-[16px]">
                  已有帳號?
                  <Link
                    href="/auth/login"
                    className="ml-2 text-[16px] hover:text-[#68BBC3]"
                  >
                    立即登入
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
