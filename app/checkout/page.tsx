"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart";
import { useAuth } from "@/contexts/auth-context";
import { HiOutlineTicket, HiCurrencyDollar, HiUser } from "react-icons/hi";


const MOCK_COUPONS = [
  { id: "c1", title: "新會員註冊禮 - 折$100", value: 100 },
  { id: "c2", title: "夏季消暑大禮包 - 折$50", value: 50 },
  { id: "c3", title: "全站滿千折$150", value: 150 },
];

export default function CheckPage() {
  const router = useRouter();
  const { items, totalAmount } = useCart();
  const { auth, isAuthenticated, authInit } = useAuth();

  // --- 狀態管理 ---
  // 聯絡人資料狀態
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    phoneCode: "+886",
    phone: "",
    email: "",
  });

  // 是否顯示"新增/編輯聯絡資料"表單
  const [showForm, setShowForm] = useState(false);
  // 優惠折扣狀態 , 單選優惠券 (通常一筆訂單只能用一張)
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [useLevelDiscount, setUseLevelDiscount] = useState(true); // 是否套用會員等級折扣 Checkbox
  const [mCoinsInput, setMCoinsInput] = useState<number>(0); // M 幣折抵控制狀態

  // 計算後的金額金額狀態
  const [levelDiscountAmount, setLevelDiscountAmount] = useState(0);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);


  // 歷史資料安全攔截：當登入狀態確認完畢 (authInit === true)
  // 發現這個人根本沒有登入 (isAuthenticated === false)，直接把他踢回登入頁
  useEffect(() => {
    if (authInit && !isAuthenticated) {
      alert("請先登入會員，才能進行結帳流程！");
      router.push("/auth/login");
    }
  }, [authInit, isAuthenticated, router]);

  // --- 點擊常用聯絡人，自動帶入表單並打開 ---
  const handleQuickInput = () => {
    setFormData({
      lastName: "",
      firstName: "",
      phoneCode: "+886",
      phone: "0912345678",
      email: auth.email,
    });
    setShowForm(true);
  };

  // 宣告一個前端動態配對資料庫會員等級的折扣換算函式
  const getDiscountRate = (level: string | undefined) => {
    if (level === "金") return 0.95; // 金牌享 95 折
    if (level === "銀") return 0.98; // 銀牌享 98 折
    return 1.0;                      // 資料庫預設是 "銅" 牌，即無折扣 (1.0)
  };

  // --- 精準動態折扣計算 useEffect (隨購物車與折扣動態變更) ---
  useEffect(() => {
    let currentPrice = totalAmount;
    let levelDiscount = 0;
    let couponDiscount = 0;

    // 透過函式，將資料庫吐出來的 "銅"、"金" 動態換算成 1.0 或 0.95
    const currentDiscountRate = getDiscountRate(auth.member_level);

    // A. 優先判定並套用會員階級折抵
    if (useLevelDiscount) {
      // 算出打折後省了多少錢 (四捨五入)
      levelDiscount = Math.round(totalAmount * (1 - currentDiscountRate));
      currentPrice -= levelDiscount;
    }

    // B. 再算優惠券折抵
    if (selectedCouponId) {
      const activeCoupon = MOCK_COUPONS.find((c) => c.id === selectedCouponId);
      if (activeCoupon) {
        couponDiscount = activeCoupon.value;
        currentPrice -= couponDiscount;
      }
    }

    // C. 扣除 M 幣折抵 (1 M幣 = 1 TWD)
    if (mCoinsInput > 0) {
      currentPrice -= mCoinsInput;
    }

    // D. 確保金額不會變負數
    if (currentPrice < 0) currentPrice = 0;

    setLevelDiscountAmount(levelDiscount);
    setCouponDiscountAmount(couponDiscount);
    setFinalPrice(currentPrice);
  }, [totalAmount, useLevelDiscount, selectedCouponId, mCoinsInput, auth.member_level]);

  // --- M 幣輸入防呆機制 ---
  const handleMCoinsChange = (val: number) => {
    const maxCoins = auth.current_points ?? 0;

    // 限制：不能是負數
    if (val < 0) val = 0;
    // 限制：不能超過會員手頭擁有的最大上限
    if (val > maxCoins) val =maxCoins;

    // 計算出在扣除會員折和優惠券後的剩餘可折抵最大金額
    const currentMaxAllowed =
      totalAmount - levelDiscountAmount - couponDiscountAmount;
    if (val > currentMaxAllowed)
      val = currentMaxAllowed > 0 ? currentMaxAllowed : 0;

    setMCoinsInput(val);
  };

  if (!authInit) {
    return <div className="py-20 text-center text-gray-400">正在確認會員安全憑證...</div>;
  }

  return (
    <>
      <div className="min-h-[calc(100vh-160px)] w-full bg-slate-50 py-10 text-gray-800">
        <div className="mx-auto w-full max-w-[1280px] px-4">
          {/* ==================== 1. 頂部步驟進度條 ==================== */}
          <div className="mb-10 flex w-full justify-center">
            <ul className="steps id-steps grid w-full max-w-7xl grid-cols-3 text-sm">
              <li className="step step-accent">填寫資料</li>
              <li className="step">選擇付款</li>
              <li className="step">完成付款</li>
            </ul>
          </div>

          {/* ==================== 2. 主要兩欄式排版 ==================== */}
          <div className="flex flex-col items-start gap-8 lg:flex-row">
            {/* 【左欄：表單與預訂資料區】 */}
            <div className="flex w-full flex-col gap-6 lg:flex-[2]">
              {/* 區塊 A：預訂資料摘要 */}
              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 border-l-4 border-[#45cad5] pl-2 text-base font-black text-gray-800">
                  預訂行程明細
                </h3>

                {items.length === 0 ? (
                  <p className="py-2 text-sm text-gray-400">
                    目前沒有選購任何商品，請返回購物車。
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div
                        key={`${item.experienceId}-${item.sessionId}`}
                        className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                          <Image
                            src={
                              item.image ||
                              "/images/experiences/seine-picnic.jpg"
                            }
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-bold text-gray-800">
                            {item.name}
                          </h4>
                          <p className="mt-1 text-xs text-gray-400">
                            {item.sessionName || "選擇場次"} × {item.quantity}人
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-black text-gray-700">
                          NT$ {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 區塊 B：聯絡資料 */}
              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-2 border-l-4 border-[#45cad5] pl-2 text-base font-black text-gray-800">
                  聯絡資料
                </h3>
                <p className="mb-4 text-xs text-gray-400">
                  如訂單有變動，我們將通知您
                </p>

                {/* 常用聯絡人快速按鈕 */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400">
                    點擊帶入常用聯絡人：
                  </span>
                  <button
                    onClick={handleQuickInput}
                    className="btn rounded-full border-[#45cad5] bg-[#45cad5]/10 px-4 font-bold text-[#45cad5] hover:bg-[#45cad5] hover:text-white"
                  >
                    {auth.name || "載入中"}
                  </button>
                </div>

                {/* 資訊卡片 */}
                <div className="mb-6 flex items-start justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-xs text-gray-700">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <span className="mr-2 text-gray-400">姓氏(英) :</span>{" "}
                      <strong>
                        {formData.lastName || "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="mr-2 text-gray-400">名 (英) :</span>{" "}
                      <strong>
                        {formData.firstName || "—"}
                      </strong>
                    </div>
                    <div className="col-span-2">
                      <span className="mr-2 text-gray-400">聯絡電話:</span>{" "}
                      <strong>{formData.phone || "—"}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="mr-2 text-gray-400">電子郵件:</span>{" "}
                      <strong>{formData.email || auth.email}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="shrink-0 text-xs font-bold text-[#45cad5] hover:underline"
                  >
                    {showForm ? "收起" : "修改編輯"}
                  </button>
                </div>

                {showForm && (
                  <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50/70 p-5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="text-xs font-bold text-gray-600">
                            姓氏 (英文) *
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value.toUpperCase(),
                            })
                          }
                          className="input input-bordered input-sm w-full rounded-md bg-white text-gray-800"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="text-xs font-bold text-gray-600">
                            名字 (英文) *
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value.toUpperCase(),
                            })
                          }
                          className="input input-bordered input-sm w-full rounded-md bg-white text-gray-800"
                        />
                      </div>
                      <div className="form-control md:col-span-2">
                        <label className="label py-1">
                          <span className="text-xs font-bold text-gray-600">
                            手機號碼 *
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="input input-bordered input-sm w-full rounded-md bg-white text-gray-800"
                        />
                      </div>
                      <div className="form-control md:col-span-2">
                        <label className="label py-1">
                          <span className="text-xs font-bold text-gray-600">
                            電子信箱 *
                          </span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="input input-bordered input-sm w-full rounded-md bg-white text-gray-800"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setShowForm(false)}
                        className="btn btn-sm rounded-md border-none bg-[#45cad5] px-6 text-white"
                      >
                        套用變更
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 區塊 C：優惠折扣*/}
              <div className="flex flex-col gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="border-l-4 border-[#45cad5] pl-2 text-base font-black text-gray-800">
                  平台專屬優惠
                </h3>

                {/* 1. 會員階級特惠折抵 */}
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-sm">
                    <div>
                      <span className="flex items-center gap-1 font-bold text-gray-700">
                        <HiUser className="size-4 text-gray-400" />{" "}
                        已套用尊榮會員階級折扣
                      </span>
                      <p className="text-[11px] text-gray-400">
                        {auth.member_level ? `${auth.member_level}牌會員特權` : "一般會員權益"}
                      </p>
                    </div>
                  <span className="font-bold text-emerald-600">
                    {useLevelDiscount
                      ? `-NT$ ${levelDiscountAmount}`
                      : "未選用"}
                  </span>
                </div>

                {/* 2. 領取與選用折價券介面 */}
                <div className="flex flex-col gap-2 text-sm">
                  <span className="mb-1 flex items-center gap-1 font-bold text-gray-700">
                    <HiOutlineTicket className="size-4 text-gray-400" />{" "}
                    使用折價券：
                  </span>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {MOCK_COUPONS.map((coupon) => (
                      <label
                        key={coupon.id}
                        className={`flex cursor-pointer flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                          selectedCouponId === coupon.id
                            ? "border-[#45cad5] bg-[#45cad5]/5 ring-1 ring-[#45cad5]"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="mb-2 flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="checkout-coupon"
                            className="radio radio-xs radio-accent mt-0.5"
                            checked={selectedCouponId === coupon.id}
                            onChange={() => setSelectedCouponId(coupon.id)}
                          />
                          <span className="text-xs leading-tight font-bold text-gray-700">
                            {coupon.title}
                          </span>
                        </div>
                        <span className="text-right text-sm font-black text-orange-500">
                          -NT$ {coupon.value}
                        </span>
                      </label>
                    ))}
                  </div>

                  {selectedCouponId && (
                    <div className="mt-1 flex justify-end">
                      <button
                        onClick={() => setSelectedCouponId(null)}
                        className="text-xs text-gray-400 underline hover:text-red-500"
                      >
                        清除已選優惠券
                      </button>
                    </div>
                  )}
                </div>

                {/* 3.M 幣折抵控制項 */}
                <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-bold text-gray-700">
                      <HiCurrencyDollar className="size-4 text-orange-400" /> M
                      幣點數折抵：
                    </span>
                    <span className="text-xs text-gray-400">
                      目前可用餘額：
                      <strong className="text-gray-600">
                        {auth.current_points ?? 0}
                      </strong>{" "}
                      M幣
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-orange-100/60 bg-orange-50/50 p-3">
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="number"
                        value={mCoinsInput === 0 ? "" : mCoinsInput}// 關鍵防護：如果值是 0 就給空字串，方便使用者直接打字，不用先刪除 0
                        placeholder="輸入折抵點數 (1M幣 = 1元)"
                        onChange={(e) =>
                          handleMCoinsChange(Number(e.target.value))
                        }
                        className="input input-sm input-bordered w-full max-w-[200px] border-gray-300 bg-white px-3 text-xs font-bold text-gray-800 shadow-sm outline-none focus:border-[#45cad5]"
                      />
                      <button
                        onClick={() =>
                          handleMCoinsChange(auth.current_points ?? 0)
                        }
                        className="btn btn-xs border-gray-300 bg-white px-2.5 text-[11px] font-bold text-gray-500 hover:border-[#45cad5] hover:bg-gray-50 transition-colors"
                      >
                        全部折抵
                      </button>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-orange-600">
                      -NT$ {mCoinsInput}
                    </span>
                  </div>
                </div>
              </div>

              {/* 底部提示文字與主要按鈕 */}
              <div className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none">
                <span className="text-xs text-gray-500 sm:w-1/3 lg:w-2/3">
                  前往付款後，訂單即送出，請於下一步選擇付款方式
                </span>
                <Link href="/payment/">
                  <button className="btn border-none bg-[#45cad5] whitespace-nowrap text-white hover:bg-[#36b3be] sm:px-10">
                    前往付款
                  </button>
                </Link>
              </div>
            </div>

            {/* 【右欄：訂單明細摘要卡片】 */}
            <div className="sticky top-20 flex w-full flex-col gap-4 text-gray-800 lg:flex-[1]">
              {/*  第一塊白卡片：商品名稱與基本資料 */}
              <div className="w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-1 text-sm leading-snug font-bold text-gray-900">
                  
                  費用明細摘要
                </h3>
                {/* 明細折扣細目顯示 */}
                <div className="mt-2 flex flex-col gap-1 border-t border-gray-100 pt-3 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>商品原始總價</span>
                    <span>NT$ {totalAmount.toLocaleString()}</span>
                  </div>
                  {useLevelDiscount && (
                    <div className="flex justify-between text-emerald-600">
                      <span>會員階級折抵({auth.member_level ?? "銅"})</span>
                      <span>-NT$ {levelDiscountAmount}</span>
                    </div>
                  )}
                  {selectedCouponId && (
                    <div className="flex justify-between text-orange-600">
                      <span>優惠券折抵</span>
                      <span>-NT$ {couponDiscountAmount}</span>
                    </div>
                  )}
                {mCoinsInput > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>M 幣餘額折抵</span>
                    <span>-NT$ {mCoinsInput}</span>
                  </div>
                )}

                  <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-gray-100 pt-2">
                    <span className="text-xs font-medium text-gray-400">
                      應付總價
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      NT$ {finalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/*  第二塊白卡片：付款金額大橘字 */}
              <div className="w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    付款金額
                  </span>
                  <span className="text-xl font-black text-[#ff5722]">
                    NT$ {finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 第三塊白卡片：M幣回饋提示 */}
              <div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h5 className="text-xs font-bold text-gray-900">
                  輕鬆享M幣回饋！
                </h5>
                <p className="text-[11px] text-gray-400">
                  享以下額度折扣回饋：
                </p>
                <div className="mt-1 flex items-center">
                  <div className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
                    {/* 假設按最後付款金額的 0.1% 回饋 M 幣 */}
                    <span>≈ NT$ {Math.round(finalPrice * 1) || 1}</span>
                    <span className="text-[10px] font-normal text-gray-400">
                      ({Math.round(finalPrice * 1) || 1} M幣)
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-gray-400">
                  下次消費使用M幣輕鬆折抵！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
