"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import Loading from "@/components/Loading";

export default function TestPage() {
  const { isAuthenticated, authInit } = useAuth();
  if (!authInit) {
    return <Loading />;
  }
  return (
    <>
      <div className="mx-auto text-2xl">
        {isAuthenticated ? "已登入" : "未登入"}
      </div>
    </>
  );
}
