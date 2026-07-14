// 這個檔案參考 Eddy 範例的 firebase-config.js
// 用來告訴 Firebase：我們現在要連到哪一個 Firebase 專案

export const firebaseConfig = {
  // 下面這些值請到 Firebase Console 複製你的 Web App 設定
  // Eddy 範例裡有寫死一組，但正式專案建議用自己的 Firebase 專案
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};