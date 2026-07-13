"use client";

// 這個檔案主要參考 Eddy 範例：
// Eddy 是用 Firebase 跟 Google 登入，拿到 Google 使用者資料後，再交給自己的後端處理登入。

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  type UserInfo,
} from "firebase/auth";
import { useEffect } from "react";
import { firebaseConfig } from "./firebase-config";

// 這個型別代表 Google / Firebase 回傳給我們的使用者資料
// 前端會把這包資料送給後端
export type GoogleProviderData = UserInfo;

// 初始化 Firebase
// 生活比喻：像是先打開 Google 登入服務的大門，後面才能使用 Google 登入功能
function initFirebaseApp() {
  // Next.js 開發模式可能會讓元件初始化多次
  // 如果已經初始化過，就不要重複 initializeApp
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
}

// Google 登入
async function loginGoogle(callback: (providerData: GoogleProviderData) => void) {
  // provider 代表「我要使用哪一種第三方登入」
  // 這裡是 Google，所以使用 GoogleAuthProvider
  const provider = new GoogleAuthProvider();

  // 取得 Firebase Auth 物件
  const auth = getAuth();

  try {
    // 打開 Google 登入彈出視窗
    const result = await signInWithPopup(auth, provider);

    // result.user 是 Firebase 整理後的使用者資料
    const user = result.user;

    // providerData[0] 通常就是 Google 帳號資料
    // 例如：uid、email、displayName、photoURL、providerId
    const providerData = user.providerData[0];
    
    
    // 把 Google 使用者資料交給外面的 callback
    callback(providerData);
  } catch (error) {
    console.warn("Google 登入失敗：", error);
  }
}

// Firebase 登出
// 注意：這只會登出 Firebase，不一定會把瀏覽器裡的 Google 帳號登出
async function logoutFirebase() {
  const auth = getAuth();

  try {
    await signOut(auth);
    console.log("Firebase 登出成功");
  } catch (error) {
    console.warn("Firebase 登出失敗：", error);
  }
}

export default function useFirebase() {
  useEffect(() => {
    initFirebaseApp();
  }, []);

  return {
    loginGoogle,
    logoutFirebase,
  };
}