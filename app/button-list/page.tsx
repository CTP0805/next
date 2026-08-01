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
      {/* <h1>按鈕樣式(原本、hover、disable)</h1>
      <h1>主色、橘色、白色</h1>
      
      <div className="flex flex-wrap items-center ml-5 my-5 gap-3">
        <h2>大按鈕</h2>
        
        <Link className="button-main inline-flex gap-1.5" href="#">立即訂購</Link>
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
      </div> */}

      <div className=" items-center ml-5 my-5 gap-3">
        <h2>按鈕樣式一覽表</h2>
        <p className="pt-4">button-orange</p>
        <Link className="button-orange inline-flex gap-1.5" href="#">加入購物車</Link>
        
        <p className="pt-4">button-main</p>
        <Link className="button-main inline-flex gap-1.5" href="#">立即預定</Link>
        <p className="pt-4">button-main 客製化範例 px-9</p>
        <Link className="button-main inline-flex gap-1.5 px-9" href="#">立即預定</Link>
        <p className="pt-4">button-white</p>
        <Link className="button-white inline-flex gap-1.5" href="#">儲存草稿</Link>
        <p className="pt-4">button-green</p>
        <Link className="button-green inline-flex gap-1.5" href="#">回到登入</Link>
        <p className="pt-4">button-red</p>
        <Link className="button-red inline-flex gap-1.5" href="#">回到註冊</Link>
        <p className="pt-4">button-circle</p>
        <Link className="button-circle inline-flex gap-1.5" href="#">選擇圖片</Link>
        <p className="pt-4">button-status-focus</p>
        <Link className="button-status-focus inline-flex gap-1.5" href="#">全部(0)</Link>
        <p className="pt-4">button-status</p>
        <Link className="button-status inline-flex gap-1.5" href="#">已付款(1)</Link>
        <p className="pt-4">button-s-red</p>
        <Link className="button-s-red inline-flex gap-1.5" href="#">刪除</Link>
        <p className="pt-4">button-s-green</p>
        <Link className="button-s-green inline-flex gap-1.5" href="#">通過</Link>
        <p className="pt-4">button-s-yellow</p>
        <Link className="button-s-yellow inline-flex gap-1.5" href="#">退回原因</Link>
        <p className="pt-4">button-s-white</p>
        <Link className="button-s-white inline-flex gap-1.5" href="#">查看</Link>
        <div className="bg-[url('/images/banner/carousel5.jpeg')] bg-center h-100 mt-5">
        <p className="pt-4 pl-2 text-white">button-status-blog-focus</p>
        <Link className="button-status-blog-focus inline-flex gap-1.5" href="#">全部</Link>
        <p className="pt-4 pl-2 text-white">button-status-blog</p>
        <Link className="button-status-blog inline-flex gap-1.5" href="#">慕尼黑</Link>
        </div>

      </div>
      <h1>首頁分類標題</h1>
      <h2>第一種</h2>
      {/* 深色標題 + 副標 + 小短線：最乾淨、最不容易像按鈕 */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#2E3338]">
          熱門地區
        </h2>

        <p className="mt-3 text-sm text-gray-500">
          探索下一趟旅程的靈感
        </p>

        {/* mx-auto 讓短線保持置中 */}
        <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-[#45cad5]" />
      </div>
      <h2>第二種</h2>
      {/* 上方的小英文是區塊分類，不是按鈕 */}
      <div className="mb-10 text-center">
        <p className="text-xs font-bold tracking-[0.28em] text-[#45cad5]">
          EXPLORE
        </p>

        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#2E3338]">
          熱門地區
        </h2>

        <p className="mt-3 text-sm text-gray-500">
          從城市風景開始規劃下一趟旅程
        </p>
      </div>
      <h2>第三種</h2>
      {/* 線條只是裝飾，標題本身沒有背景色 */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-gray-200 sm:w-20" />

          <h2 className="text-3xl font-extrabold tracking-tight text-[#2E3338]">
            熱門地區
          </h2>

          <div className="h-px w-12 bg-gray-200 sm:w-20" />
        </div>

        <p className="mt-3 text-sm text-gray-500">
          尋找下一個想去的地方
        </p>
      </div>
      <h2>第四種</h2>
      {/* 01 像旅遊雜誌的章節編號；標題仍然是純文字 */}
      <div className="mb-10 text-center">
        <p className="mx-auto flex size-8 items-center justify-center rounded-full bg-[#E5FAFB] text-xs font-extrabold text-[#249EAA]">
          01
        </p>

        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2E3338]">
          熱門地區
        </h2>

        <p className="mt-3 text-sm text-gray-500">
          從城市風景開始出發
        </p>
      </div>
      <h2>第五種</h2>
      {/* 青綠色只在文字底部露出，不會變成一整顆按鈕 */}
      <div className="mb-10 text-center">
        <h2 className="relative inline-block text-3xl font-extrabold tracking-tight text-[#2E3338]">
          {/* absolute 的色塊在文字後面，z-10 讓文字顯示在最上層 */}
          <span className="relative z-10">熱門地區</span>

          {/* -bottom-1 讓色塊貼在文字底部；w-3/4 表示只有文字寬度的 75% */}
          <span className="absolute right-0 -bottom-1 z-0 h-3 w-full bg-[#BCEFF2]" />
        </h2>

        <p className="mt-4 text-sm text-gray-500">
          探索下一趟旅程的靈感
        </p>
      </div>      
      <h2>第六種</h2>
      {/* 小圖案作為視覺焦點，品牌色只用在裝飾上 */}
      <div className="mb-10 text-center">
        <p
          className="text-xl leading-none text-[#45cad5]"
          aria-hidden="true"
        >
          ✦
        </p>

        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2E3338]">
          熱門地區
        </h2>

        <p className="mt-3 text-sm text-gray-500">
          探索下一趟旅程的靈感
        </p>

        <div className="mx-auto mt-4 flex w-12 items-center justify-center gap-1">
          <span className="size-1 rounded-full bg-[#45cad5]" />
          <span className="h-px flex-1 bg-[#45cad5]" />
          <span className="size-1 rounded-full bg-[#45cad5]" />
        </div>
      </div>
    </>
  );
}


