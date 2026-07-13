"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_SERVER } from "../config/api-path";
import { z } from "zod";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

// 接收進來的資料類型
export type Auth = {
  id: number;
  name: string;
  email: string;
  token: string;
};

// 初始值
export const emptyAuth: Auth = {
  id: 0,
  name: "",
  email: "",
  token: "",
};

type LoginFunction = (email: string, password: string) => Promise<boolean>; // 因為裡面有用到 async/await，所以要用 Promise

// 要廣播的資料
export type AuthContextValue = {
  auth: Auth;
  authInit: boolean;
  login: LoginFunction;
  logout: () => void;
  getAuthHeader: () => Record<string, string>; // 定義回傳內容為物件 且 key、value 都為 string
};

const AuthContext = createContext<AuthContextValue | null>(null);
AuthContext.displayName = "MyAuthContext"; // 方便除錯

const storageKey = "kenny-auth";

// 前端格式驗證
const loginSchema = z.object({
  email: z.email({ message: "請輸入正確的 Email 格式" }),
  password: z.string().min(8, { message: "請輸入8位以上的密碼(要做這個嗎?)" }),
});


/* 
1. 登⼊ 
2. 登出 
3. 取得登⼊者的資料 
4. 取得已登⼊者的 token (或直接拿到 Authorization headers) 
5. 是否已從 localStorage 取得登⼊狀態資料 (authInit) 
*/

// 元件
export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, setAuth] = useState(emptyAuth);
  const [authInit, setAuthInit] = useState(false); // 標示有沒有檢查過 localStorage，true 為已檢查，false 為未檢查
  const router = useRouter();

  const login: LoginFunction = async (email, password) => {
    // step1. 前端格式驗證
    // 如果帳號或密碼沒填，就先提醒使用者
    if (!email || !password) {
      toast.error("請輸入帳號和密碼");
      return;
    }

    const trimmedEmail = email.trim();
    const zodResult = loginSchema.safeParse({
      email: trimmedEmail,
      password,
    });

    if (!zodResult.success) {
      if (zodResult.error?.issues?.length) {
        toast.error(zodResult.error.issues[0].message);
        return;
      }
    }

    // step2. 送資料到後端
    try {
      const response = await fetch(`${API_SERVER}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: trimmedEmail, password
        }),
      });
      const result = await response.json();

      // 如果後端說登入失敗
      if (!response.ok) {
        toast.error(result.message || "登入失敗(前端)");
        return;
      }

      if (response.ok) {
        setAuth(result.data); // 記在 state
        // 💡💡💡 待修改 HttpOnly Cookie
        // localStorage.setItem(storageKey, JSON.stringify(result.data)); // 記在 localStorage
        toast.success(result.message || "登入成功(前端)");
        // 之後你可以改成 router.push("/")
        router.push("/");
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
    // 💡💡💡TODO : 點下登出後 如果使用者原本是在會員中心或購物車 要跳轉到首頁
    router.push("/auth/login");
  };

  /*
  const logout = (): void => {
    setAuth(emptyAuth); // 清除 state，還原成初始值
    // localStorage.removeItem(storageKey); // 清除 localStorage
    
  };
  */

  const getAuthHeader = (): Record<string, string> => {
    if (auth.token) {
      return { Authorization: "Bearer " + auth.token };
    }
    return {};
  };

  // 這邊也可以註解掉了
  useEffect(() => {
    if (authInit) return; // authInit = true --> 已經檢查過了，就什麼事都不做

    // authInit = false --> 沒檢查過，就把 localStorage 的資料讀出來
    setAuthInit(true); // 同時標記為 true (已檢查過)
    const txt = localStorage.getItem(storageKey);
    if (txt) {
      try {
        const data = JSON.parse(txt);
        // TODO: 檢查必要欄位是不是都有 (token)
        setAuth(data);
      } catch (ex) {
        console.warn(ex);
      }
    }
  }, [auth, authInit]);

  console.log(`AuthContextProvider Render`);

  return (
    // 要廣播的資料記得寫在這裡
    <AuthContext.Provider
      value={{ auth, authInit, login, logout, getAuthHeader }}
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
