"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

//定義從後端拿到的推薦商品型別
interface RecommendProduct {
  id: number;
  title: string;
  city: string;
  primaryImage: string | null;
  minPrice: string | number | null;
}

interface CartItem {
  cartId?: number;
  experienceId: number;
  sessionId: number;
  name: string;
  price: number;
  adultPrice?: number;
  childPrice?: number;
  adultQuantity?: number;
  childQuantity?: number;
  quantity: number; //購物車項目數量屬性
  sessionName?: string; // 可讀的場次資訊 (例如：2026-08-01 14:00)
  image?: string;
  isSoldOut?: boolean;
}

export default function CartPage() {
  // 從自訂的 useCart 鉤子中解構出狀態與方法
  const { items, setItems, totalQty, totalAmount, onUpdateQuantity, onRemove } =
    useCart();

  // 進入購物車載入中(轉圈圈)
  const [pageLoading, setPageLoading] = useState(true);
  // 記錄全選勾選
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  // 存推薦商品的state
  const [recommendProducts, setRecommendProducts] = useState<
    RecommendProduct[]
  >([]);

  //綁定daisyUI Modal 的 ref
  const deleteModalRef = useRef<HTMLDialogElement>(null);

  // 刪除選中活動
  const handleRemoveSelected = async () => {
    if (selectedKeys.length === 0) {
      toast.error("請先勾選要刪除的商品！");
      return;
    }
    // 代替 confirm(...)，跳出 daisyUI Modal 讓使用者確認
    deleteModalRef.current?.showModal();
  };

  const confirmDeleteSelected = async () => {
    deleteModalRef.current?.close();
    // 遍歷所有被選中的 key，例如 "2-101"
    try {
      //直接在前端過濾掉「所有被勾選的項目」並更新畫面
      // 這裡直接用 filter 過濾掉勾選的 key，保證畫面「一次性」同時刪除所有選中的商品
      const remainingItems = items.filter(
        (item) =>
          !selectedKeys.includes(`${item.experienceId}-${item.sessionId}`),
      );

      const deletePromises = selectedKeys.map((key) => {
        const [experienceId, sessionId] = key.split("-").map(Number);
        // 執行onRemove（確保後端 fetch 有被發送去刪除）
        return onRemove(experienceId, sessionId);
      });

      // 同時發送所有後端刪除請求
      await Promise.all(deletePromises);

      // 重點：強行把前端 items 設定為我們過濾好的狀態
      setItems(remainingItems);

      // 刪除完成後，清空勾選狀態
      setSelectedKeys([]);
      toast.success("已成功刪除選中活動！");
    } catch (error) {
      console.error("批次刪除失敗:", error);
      toast.error("刪除時發生錯誤，請重整網頁。");
    }
  };

  // ==========================================
  //「全選與單選邏輯」
  // ==========================================

  // 可供勾選的項目（排除完售與過期）
  const selectableItems = items.filter((item) => !item.isSoldOut);

  // A. 判定：是不是「所有的購物車商品」都已經被勾選了？
  const isAllSelected =
    selectableItems.length > 0 &&
    selectableItems.every((item) =>
      selectedKeys.includes(`${item.experienceId}-${item.sessionId}`),
    );

  // B. 處理「全選/全不選」checkbox 的點擊事件
  const handleSelectAll = () => {
    if (isAllSelected) {
      // 如果已經全選，點擊後就「全不選」
      setSelectedKeys([]);
    } else {
      // 如果沒有全選，點擊後把「所有購物車項目」的唯一 key 塞進去
      const allKeys = selectableItems.map(
        (item) => `${item.experienceId}-${item.sessionId}`,
      );
      setSelectedKeys(allKeys);
    }
  };

  // C. 處理「單一商品」checkbox 的點擊事件
  const handleSelectItem = (experienceId: number, sessionId: number) => {
    const itemKey = `${experienceId}-${sessionId}`;
    if (selectedKeys.includes(itemKey)) {
      // 原本有勾選 -> 取消勾選
      setSelectedKeys(selectedKeys.filter((key) => key !== itemKey));
    } else {
      // 原本沒勾選 -> 加上勾選
      setSelectedKeys([...selectedKeys, itemKey]);
    }
  };

  // ==========================================
  // 🚀 3. 在 useEffect 中向你的 Express 後端拉取商品資料
  // ==========================================
  useEffect(() => {
    fetch("http://localhost:3001/api/cart/experience")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setRecommendProducts(resData.data);
        }
        // 資料成功載入後，過一小段時間關閉載入畫面
        setTimeout(() => {
          setPageLoading(false);
        }, 500);
      })
      .catch((err) => {
        console.error("無法取得推薦商品:", err);
        setPageLoading(false); //即使失敗也要關掉，不然使用者會永遠卡在轉圈圈
      });
  }, []);

  // ==========================================
  // 載入畫面中
  if (pageLoading) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4">
        {/* DaisyUI 經典轉圈圈 */}
        <span className="loading loading-spinner loading-lg text-secondary"></span>
        <p className="animate-pulse font-medium text-gray-500">
          正在為您準備購物車...
        </p>
      </div>
    );
  }

  return (
    <>
      {items.length > 0 ? (
        <div className="min-h-[calc(100vh-160px)] w-full py-10">
          <div className="mx-auto w-full max-w-7xl bg-white px-4">
            <div className="flex flex-col items-start gap-8 lg:flex-row">

              {/* 左側購物車商品清單區域 */}
              <div className="w-full space-y-4 lg:flex-[2]">

                {/* 全選與批次刪除工具列卡片 */}
                <div className="flex w-full items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary h-5 w-5 rounded-md"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                    <span className="font-medium whitespace-nowrap text-gray-900">
                      全選
                    </span>
                  </label>
                  <button
                    className="btn btn-outline btn-sm rounded-lg text-gray-600 hover:bg-gray-100"
                    onClick={handleRemoveSelected}
                  >
                    刪除選中活動
                  </button>
                </div>

                {/* 獨立卡片清單：每一筆商品獨立成一個圓角白底卡片 */}
                {items.map((item) => {
                  const itemKey = `${item.experienceId}-${item.sessionId}`;

                  // 🚀 1. 數值絕對安全防呆轉型 (遇到 null/undefined/NaN 通通變成 0)
                  const adultQty = Number.isNaN(Number(item.adultQuantity))
                    ? 1
                    : Number(item.adultQuantity) || 0;
                  const childQty = Number.isNaN(Number(item.childQuantity))
                    ? 0
                    : Number(item.childQuantity) || 0;

                  const adultPrice = Number(item.adultPrice) || Number(item.price) || 0;
                  const childPrice = Number(item.childPrice) || 0;

                  // 計算該卡片項目的總小計金額
                 const itemSubtotal = adultQty * adultPrice + childQty * childPrice;

                  return (
                    <div
                      key={itemKey}
                      className={`relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all ${item.isSoldOut ? "opacity-60 bg-gray-50" : ""
                    }`}
                    >
                      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                      {/* 左側：勾選框 + 圖片 + 標題與單價 */}
                      <div className="flex flex-1 items-start gap-4">
                        <input
                          type="checkbox"
                          disabled={item.isSoldOut}
                          className="checkbox checkbox-primary checkbox-sm mt-1"
                          checked={selectedKeys.includes(itemKey)}
                          onChange={() => handleSelectItem(item.experienceId, item.sessionId)
                          }
                        />

                        {/* 商品縮圖 */}
                        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              商品圖片
                              </div>
                            )}
                            {item.isSoldOut && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs">
                                已完售
                              </div>
                            )}
                          </div>

                          {/* 名稱與場次 */}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-base font-bold text-gray-900 line-clamp-1">
                              {item.name}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.sessionName || "一般場次"}
                            </p>
                          </div>
                        </div>

                       {/* 右側：成人與兒童加減按鈕控制器 */}
                      <div className="flex flex-col gap-3 items-end shrink-0">
                        {!item.isSoldOut ? (
                          <>
                            {/* 成人按鈕控制區 */}
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-600">成人</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="btn btn-xs btn-circle btn-outline border-gray-300 text-gray-600 hover:bg-gray-100"
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.experienceId,
                                      item.sessionId,
                                      "adult",
                                      -1
                                    )
                                  }
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-bold text-gray-800">
                                  {adultQty}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-circle btn-outline border-gray-300 text-gray-600 hover:bg-gray-100"
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.experienceId,
                                      item.sessionId,
                                      "adult",
                                      1
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* 兒童按鈕控制區 */}
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-600">兒童</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="btn btn-xs btn-circle btn-outline border-gray-300 text-gray-600 hover:bg-gray-100"
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.experienceId,
                                      item.sessionId,
                                      "child",
                                      -1
                                    )
                                  }
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-bold text-gray-800">
                                  {childQty}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-circle btn-outline border-gray-300 text-gray-600 hover:bg-gray-100"
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.experienceId,
                                      item.sessionId,
                                      "child",
                                      1
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-red-400 font-medium">已截止</span>
                        )}
                      </div>
                    </div>

                    {/* 卡片底欄：左側編輯/刪除，右側單項總計金額 */}
                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                        {!item.isSoldOut && (
                          <Link
                            href={`/experiences/${item.experienceId}?edit=true&oldSession=${item.sessionId}&oldAdult=${adultQty}&oldChild=${childQty}`}
                            className="hover:text-[#45cad5] hover:underline"
                          >
                            編輯
                          </Link>
                        )}
                        <button
                          type="button"
                          className="hover:text-red-500 hover:underline"
                          onClick={async () => {
                            await onRemove(item.experienceId, item.sessionId);
                            toast.success("已成功刪除活動！");
                          }}
                        >
                          刪除
                        </button>
                      </div>

                      {/* 右下角：精緻的單卡片小計金額 */}
                      <div className="text-right text-lg font-black text-gray-900">
                        NT$ {itemSubtotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

              {/* 右側結帳卡片 */}
              <div className="w-full rounded-lg bg-white p-6 shadow-sm lg:flex-[1]">
                <p className="mb-1 text-sm font-medium text-gray-500">
                  {selectedKeys.length > 0 ? selectedKeys.length : items.length} 件總計
                </p>
                <div className="mb-4 text-2xl font-bold text-gray-900">
                  NT$ {totalAmount.toLocaleString()}
                </div>

                <Link href="/checkout/">
                  <button
                    disabled={totalQty === 0}
                    className="btn w-full border-none bg-[#45cad5] text-white hover:bg-[#36b3be] disabled:bg-gray-300"
                  >        
                    前往結帳
                  </button>
                </Link>

                <p className="mt-2 text-center text-xs text-cyan-600">
                  預估可獲得約 {Math.round(totalAmount * 0.01).toLocaleString()} M幣
                </p>
              </div>
          </div>

              {/* 下方推薦商品區 */}
            <div className="mt-16">
              <h3 className="mb-6 border-l-4 border-red-500 pl-3 text-xl font-bold text-gray-800">
                其他旅人也買了...
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recommendProducts.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex h-40 items-center justify-center overflow-hidden rounded-md bg-gray-200">
                    {product.primaryImage ? (
                      <img
                        src={product.primaryImage}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">暫無圖片</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{product.city}</span>
                  <h5 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-bold text-gray-800">
                    {product.title}
                  </h5>
                  <p className="mt-3 text-sm font-bold text-gray-800">
                    NT${" "}
                    {product.minPrice
                      ? Number(product.minPrice).toLocaleString()
                      : "---"}{" "}
                    起
                  </p>
                </div>
              ))}
              </div>
          </div>
      </div>
        ) : (
        /* 購物車空介面  */
        <div className="flex min-h-[calc(100vh-200px)] w-full flex-col items-center justify-center bg-white py-16">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center bg-white px-4">
            <img
              src="/cat-cart.jpg"
              alt="購物車空空的"
              className="mx-auto h-auto w-48 object-contain"
            />
            <h3 className="mb-2 text-2xl font-bold text-gray-700">
              購物車空空的
            </h3>
            <Link href="/experiences/search">
              <p className="mb-8 cursor-pointer text-base text-[#45cad5] hover:underline">
                馬上選購你喜歡的商品吧！
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* DaisyUI Modal Dialog */}
      <dialog ref={deleteModalRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold text-gray-900">確認刪除</h3>
          <p className="py-4 text-gray-600">
            確定要刪除這 {selectedKeys.length} 項活動嗎？
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost">取消</button>
            </form>
            <button
              className="btn btn-error text-white"
              onClick={confirmDeleteSelected}
            >
              確定刪除
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

