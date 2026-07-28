"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import Loading from "@/components/Loading";
import Link from "next/link";
import Image from "next/image";


export default function TestPage() {
  // const { isAuthenticated, authInit } = useAuth();
  // if (!authInit) {
  //   return <Loading />;
  // }
  const { auth } = useAuth();
  return (
    <>
      
      {/* <div className="mx-auto text-2xl">
        {isAuthenticated ? "已登入" : "未登入"}
      </div> */}
      {/* <h1>目前身分{auth.role}</h1> */}
      <h1>按鈕樣式(原本、hover、disable)</h1>
      <h1>主色、橘色、白色</h1>
      
      <div className="flex flex-wrap items-center ml-5 my-5 gap-3">
        <h2>大按鈕</h2>
        
        <Link className="button-main-1 inline-flex gap-1.5" href="#">立即訂購</Link>
        <Link className="button-main-2 inline-flex gap-1.5" href="#">立即訂購</Link>
        <Link className="button-white inline-flex gap-1.5" href="#">立即訂購</Link>
        
        <Link className="rounded-lg border border-zinc-300 px-5 py-2 text-zinc-700 transition hover:bg-zinc-100" href="#">取消</Link>
        <Link className="rounded-lg bg-[#68BBC3] px-5 py-2 text-white transition hover:bg-[#53AAB2] disabled:cursor-not-allowed disabled:opacity-60" href="#">使用這張圖片</Link>
        <Link className="rounded-md bg-[#FF9224] px-5 py-3 text-center   text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50" href="#">加入購物車</Link>
        <Link className="rounded-md bg-[#45cad5] px-5 py-3 text-center   text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50" href="#">立即預定</Link>
        <Link className="rounded-md border border-zinc-300 px-5 py-3 text-zinc-700 transition hover:bg-zinc-100 inline-flex gap-1.5" href="#">儲存草稿</Link>
        <Link className="button-main-2" href="#">送出審查</Link>
        
        <Link className="button-green inline-flex gap-1.5" href="#">回到登入</Link>
        <Link className="button-red inline-flex gap-1.5" href="#">回到註冊</Link>
      </div> 
      <div className="flex flex-wrap items-center ml-5 my-5 gap-3">
        <h2>小按鈕</h2>
        <Link className="rounded-full bg-[#68BBC3] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#53AAB2] inline-flex gap-1.5" href="#">選擇圖片</Link>
        
        
      </div>
      <div className="flex flex-wrap items-center ml-5 my-5 gap-3">
        <h2>分頁、加減按鈕</h2>
        <Link className="button-pagination inline-flex gap-1.5" href="#">›</Link>
        <Link className="button-people inline-flex gap-1.5" href="#">+</Link>
      </div>

    </>
  );
}
