"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { API_SERVER } from "../config/api-path";
import { z } from "zod";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { IoIosWarning } from "react-icons/io";

// 接收進來的資料類型
export type Auth = {
  id: number;
  name: string;
  email: string;
  member_level?: string;     // 💡 新增：等級中文名稱 (例如 '金牌會員 (享95折優惠)')
  current_points?: number;   // 💡 新增：會員現有的 M 幣存量

};

// 初始值
export const emptyAuth: Auth = {
  id: 0,
  name: "",
  email: "",
  member_level: "一般會員 (無折扣)",
  current_points: 0, // 沒登入時預設為 0
};

type AuthApiResponse = {
  success: boolean;
  message?: string;
  data?: Auth;
};

// 要廣播的資料
type AuthContextValue = {
  auth: Auth;
  authInit: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>; // 因為裡面有用到 async/await，所以要用 Promise
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
AuthContext.displayName = "MyAuthContext"; // 方便除錯

// 前端格式驗證
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message : "請輸入 Email"})
    .email({ message: "請輸入正確的 Email 格式" }),
  password: z.string().min(1, { message: "請輸入密碼" }),
});

// 元件
export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, setAuth] = useState(emptyAuth);
  const [authInit, setAuthInit] = useState(false); // true：後端已經回答，目前可安全判斷是否登入 false：還在問後端登入狀態
  const router = useRouter();
  const searchParams = useSearchParams();

  // 這個函式負責向後端確認目前 Cookie 對應哪位使用者。
  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_SERVER}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        // 401、Cookie 過期、JWT 無效，都視為未登入。
        setAuth(emptyAuth);
        return;
      }

      const result = (await response.json()) as AuthApiResponse;

      if (result.success && result.data) {
        setAuth(result.data);
        return;
      }

      setAuth(emptyAuth);
    } catch (error) {
      console.warn("取得登入狀態失敗：", error);
      setAuth(emptyAuth);
    } finally {
      // 不論成功或失敗，都代表「登入狀態已確認完畢」。
      setAuthInit(true);
    }
  }, []);

  // 網頁第一次載入或重新整理時，只檢查一次登入狀態。
  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const resendVerifyEmail = async (email: string): Promise<void> => {
  try {
    // 把登入表單中的 Email 傳給後端
    const response = await fetch(
      `${API_SERVER}/api/auth/resend-verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      },
    );

    // 後端會回傳 { success, message }
    const result = (await response.json()) as AuthApiResponse;

    if (!response.ok || !result.success) {
      toast.error(result.message || "驗證信寄送失敗，請稍後再試");
      return;
    }

    toast.success(result.message || "驗證信已重新寄出，請至信箱查看");
  } catch (error) {
    console.warn("resendVerifyEmail error:", error);
    toast.error("目前無法連線到伺服器，請稍後再試");
  }
};

  const login = async (email: string, password: string): Promise<boolean> => {
    // step1. 前端格式驗證

    const trimmedEmail = email.trim();
    const zodResult = loginSchema.safeParse({
      email: trimmedEmail,
      password,
    });

    if (!zodResult.success) {
      if (zodResult.error?.issues?.length) {
        toast.error(zodResult.error.issues[0].message);
        return false;
      }
    }

    // step2. 送資料到後端
    const next = searchParams.get("next"); // 轉址用
    try {
      const response = await fetch(`${API_SERVER}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });
      const result = (await response.json()) as AuthApiResponse;

      // TODO 特殊情況 : 使用者尚未進行信箱驗證
      if (response.status === 403) {
        toast(
          (t) => (
            <>
              <p className="mr-2 py-2 "><IoIosWarning className="text-yellow-400 text-[25px] inline"/> {result.message}</p>
              <button
                className="rounded-[8px] bg-red-400 px-3 py-2 text-center text-white"
                onClick={() => void resendVerifyEmail(trimmedEmail)}
              >
                重新發送驗證信
              </button>
            </>
          ),
          {
            style: {
              minWidth: "415px",
            },
          },
        );
        return false;
      }

      // 如果後端說登入失敗
      if (!response.ok) {
        toast.error(result.message || "登入失敗(前端)");
        return false;
      }

      if (response.ok) {
        setAuth(result.data);
        setAuthInit(true);
        toast.success(result.message || "登入成功(前端)");
        router.replace(next ?? "/"); // 登入成功後跳轉到首頁(💡看有沒有要換成其他的)
        return true; // ❓❓❓為什麼要回傳 true 目的是甚麼?
      }
    } catch (error) {
      // 如果網路壞掉、後端沒開，會進到這裡
      console.warn(error);
      toast.error("系統發生錯誤，請稍後再試(後端有問題)");
    }
    return false;
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch(`${API_SERVER}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn(error);
    }

    setAuth(emptyAuth);
    setAuthInit(true);
    // 💡💡💡TODO : 點下登出後 如果使用者原本是在會員中心或購物車 要跳轉到首頁
    router.push("/auth/login");
  };

  return (
    // 要廣播的資料記得寫在這裡
    <AuthContext.Provider
      value={{
        auth, // 目前登入的使用者的資料
        authInit, // 是否已經問完後端登入狀態
        isAuthenticated: auth.id !== 0, // 是否已登入的簡單 true / false 判斷 (true-->已登入、false-->未登入)
        login,
        logout,
        refreshAuth, // 呼叫 /api/auth/me 重新確認 Cookie 的函式
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 自訂鉤子
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必須在 AuthContextProvider 內使⽤");
  return ctx;
};

export default AuthContext;
