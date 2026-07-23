"use client";

/**
 * 【新手】輸入券碼兌換表單（如 C1）
 * 真正打 API 在父層 onRedeem → redeemCouponCode
 */
import { useState } from "react";

interface RedeemCouponFormProps {
  onRedeem: (code: string) => Promise<void> | void;
  disabled?: boolean;
}

export default function RedeemCouponForm({
  onRedeem,
  disabled = false,
}: RedeemCouponFormProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 表單送出：避免連點（submitting 鎖）
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled || submitting) return;
    setSubmitting(true);
    try {
      await onRedeem(code);
      setCode("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-b border-gray-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center"
    >
      <label className="sr-only" htmlFor="redeem-code">
        輸入優惠券代碼
      </label>
      <input
        id="redeem-code"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="輸入優惠券代碼，例如 C1"
        disabled={disabled || submitting}
        className="input input-bordered input-sm h-10 w-full flex-1 bg-white text-sm text-gray-800"
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="submit"
        disabled={disabled || submitting || !code.trim()}
        className="btn btn-sm h-10 border-none bg-[#45cad5] px-5 font-semibold text-white hover:bg-[#36b3be] disabled:bg-gray-300"
      >
        {submitting ? "兌換中…" : "兌換"}
      </button>
    </form>
  );
}
