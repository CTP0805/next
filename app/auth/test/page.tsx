"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import Loading from "@/components/Loading";
import Link from "next/link";


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
      <h1>按鈕樣式(還有disable的)</h1>
      <h1>目前身分{auth.role}</h1>
      <div className="flex flex-wrap items-center mt-5 gap-2 sm:gap-3">
        <Link className="button-blue inline-flex gap-1.5" href="#">立即訂購</Link>
        <Link className="button-green inline-flex gap-1.5" href="#">立即訂購</Link>
        <Link className="button-red inline-flex gap-1.5" href="#">立即訂購</Link>
        <Link className="button-main-1 inline-flex gap-1.5" href="#">立即訂購</Link>
        <Link className="button-main-2 inline-flex gap-1.5" href="#">立即訂購</Link>
        <Link className="button-white inline-flex gap-1.5" href="#">立即訂購</Link>
        <Link className="button-pagination inline-flex gap-1.5" href="#">›</Link>
        <Link className="button-people inline-flex gap-1.5" href="#">+</Link>
      </div>
    </>
  );
}
