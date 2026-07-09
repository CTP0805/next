"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_SERVER } from "../config/api-path";

// 接收進來的資料類型
export type Auth = {
  id: number;
  name: string;
  email: string;
  token: string;
};

// 初始值
export const emptyAuth: Auth = {
  id:0 ,
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

  const login: LoginFunction = async (email, password) => {
    try {
      const r = await fetch(`${API_SERVER}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await r.json();
      if (result.success) {        
        setAuth(result.data); // 記在 state
        localStorage.setItem(storageKey, JSON.stringify(result.data)); // 記在 localStorage
        return true;
      }
    } catch (error) {
      console.warn(error);
    }
    return false;
  };

  const logout = ():void => {
    setAuth(emptyAuth); // 清除 state，還原成初始值
    localStorage.removeItem(storageKey); // 清除 localStorage
  }

  const getAuthHeader = (): Record<string, string> => {
    if (auth.token) {
      return { Authorization: "Bearer " + auth.token };
    }
    return {};
  };

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

  return ( // 要廣播的資料記得寫在這裡
    <AuthContext.Provider value={{ auth, authInit, login, logout, getAuthHeader }}>
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
