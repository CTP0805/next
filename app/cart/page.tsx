"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart";
import { useEffect, useState } from "react";

interface CartItem {
  cartId?: number;
  experienceId: number;
  sessionId: number;
  name: string;
  price: number;
  quantity: number; //購物車項目數量屬性
  sessionName?: string; // 可讀的場次資訊 (例如：2026-08-01 14:00)
  spec?: string;
  image?: string;
}

//定義從後端拿到的推薦商品型別
interface RecommendProduct {
  id: number;
  title: string;
  city: string;
  primaryImage: string | null;
  minPrice: string | number | null;
}

export default function CartPage() {
  // 從自訂的 useCart 鉤子中解構出狀態與方法
  const {
    items,
    setItems,
    totalQty,
    totalAmount,
    onIncrease,
    onDecrease,
    onRemove,
  } = useCart();
  
  //記錄全選勾選
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  //宣告用來存推薦商品的state
  const [recommendProducts, setRecommendProducts] = useState<
    RecommendProduct[]
  >([]);

  //刪除選中活動
  const handleRemoveSelected = async () => {
    if (selectedKeys.length === 0) {
      alert("請先勾選要刪除的商品！");
      return;
    }

    if (confirm(`確定要刪除這 ${selectedKeys.length} 項活動嗎？`)) {
      // 遍歷所有被選中的 key，例如 "2-101"
      try {
        //直接在前端過濾掉「所有被勾選的項目」並更新畫面
        // 這裡直接用 filter 過濾掉勾選的 key，保證畫面「一次性」同時刪除所有選中的商品
        const remainingItems = items.filter(
          (item) =>
            !selectedKeys.includes(`${item.experienceId}-${item.sessionId}`),
        );
        // 繞過 context 的 setItems 打架：
        // 利用一個 map，只讓 onRemove 去發後端 fetch，但「阻止」它們重複、混亂地修改前端 items 狀態D

        const deletePromises = selectedKeys.map((key) => {
          const [experienceId, sessionId] = key.split("-").map(Number);
          // 執行onRemove（確保後端 fetch 有被發送去刪除）
          return onRemove(experienceId, sessionId);
        });

        // 同時發送所有後端刪除請求
        await Promise.all(deletePromises);

        // 重點：因為剛才多個 onRemove 會互相覆蓋狀態，我們在最後「強行」把前端 items 設定為我們過濾好的乾淨狀態！
        //
        setItems(remainingItems);

        // 刪除完成後，清空勾選狀態
        setSelectedKeys([]);
        alert("已成功刪除選中活動！");
      } catch (error) {
        console.error("批次刪除失敗:", error);
        alert("刪除時發生錯誤，請重整網頁。");
      }
    }
  };

  // ==========================================
  //「全選與單選邏輯」
  // ==========================================

  // A. 判定：是不是「所有的購物車商品」都已經被勾選了？
  const isAllSelected =
    items.length > 0 &&
    items.every((item) =>
      selectedKeys.includes(`${item.experienceId}-${item.sessionId}`),
    );

  // B. 處理「全選/全不選」checkbox 的點擊事件
  const handleSelectAll = () => {
    if (isAllSelected) {
      // 如果已經全選，點擊後就「全不選」
      setSelectedKeys([]);
    } else {
      // 如果沒有全選，點擊後把「所有購物車項目」的唯一 key 塞進去
      const allKeys = items.map(
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
  useEffect(() => {
    fetch("http://localhost:3001/api/cart/experience")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setRecommendProducts(resData.data);
        }
      })
      .catch((err) => console.error("無法取得推薦商品:", err));
  }, []);
  return (
    <>
      {/* ======= 三元運算 判斷購物車有無商品====== */}
      {items.length > 0 ? (
        /* 購物車有商品介面 */
        <div className="min-h-[calc(100vh-160px)] w-full py-10">
          {/* 限制最大寬度1280px */}
          <div className="mx-auto w-full max-w-7xl bg-white px-4">
            {/* 上方購物區 */}
            <div className="flex flex-col items-start gap-8 lg:flex-row">
              {/* 左側欄位 */}
              <div className="w-full rounded-lg bg-white p-6 shadow-sm lg:flex-[2]">
                <div className="flex w-full items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="check checkbox-primary h-6 w-6 rounded-md"
                      checked={isAllSelected} // 自動同步是否全選的狀態
                      onChange={handleSelectAll} // 點擊全選/取消全選
                    />
                    <span className="whitespace-nowrap text-gray-900">
                      全選
                    </span>
                  </label>
                  <button
                    className="btn btn-outline"
                    onClick={handleRemoveSelected}
                  >
                    刪除選中活動
                  </button>
                </div>

                {/* 🚀 循環讀取來自 Context 的 items */}
                {items.map((item) => (
                  <div
                    key={`${item.experienceId}-${item.sessionId}`} // 唯一 Key 必須組合商品與場次
                    className="flex flex-col justify-between gap-4 border-b py-6 last:border-0 md:flex-row md:items-center"
                  >
                    <div className="flex flex-1 items-start gap-4">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm mt-1 md:mt-0 md:self-center"
                        checked={selectedKeys.includes(
                          `${item.experienceId}-${item.sessionId}`,
                        )}
                        //點擊時，切換這筆商品的勾選狀態
                        onChange={() =>
                          handleSelectItem(item.experienceId, item.sessionId)
                        }
                      />

                      {/* 這裡改成讀取真正的 item.image */}
                      <div className="flex w-24 flex-shrink-0 flex-col gap-2">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md bg-gray-200 text-xs text-gray-400">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            "商品圖片"
                          )}
                        </div>
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/experiences/${item.experienceId}?edit=true&oldSession=${item.sessionId}&oldQty=${item.quantity}`}
                            className="btn btn-sm text-gray-600 hover:bg-gray-100"
                          >
                            編輯
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                              if (confirm("確定要刪除此活動嗎？")) {
                                onRemove(item.experienceId, item.sessionId);
                              }
                            }}
                          >
                            刪除
                          </button>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold break-words text-gray-800 md:text-base">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 md:text-sm">
                          {item.sessionName}
                        </p>
                        {item.spec && (
                          <span className="badge badge-ghost badge-sm md:badge-md mt-2">
                            {item.spec}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 右半部：包含 數量按鈕 + 小計金額 */}
                    {/* 手機版會自動掉到下方，透過 w-full md:w-auto 撐開並對齊 */}
                    <div className="flex w-full items-center justify-between gap-6 border-t border-gray-100 pt-3 md:w-auto md:justify-end md:border-0 md:pt-0">
                      {/* 數量按鈕 */}
                      {/* ➖ 減少按鈕：支援防呆體驗確認 */}
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            if (item.quantity === 1) {
                              if (confirm("你確定要移除這個商品嗎?")) {
                                onRemove(item.experienceId, item.sessionId);
                              }
                            } else {
                              onDecrease(item.experienceId, item.sessionId);
                            }
                          }}
                        >
                          -
                        </button>
                        <span className="px-2 text-sm font-medium">
                          {item.quantity}
                        </span>
                        {/* ➕ 增加按鈕 */}
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() =>
                            onIncrease(item.experienceId, item.sessionId)
                          }
                        >
                          +
                        </button>
                      </div>

                      {/* 商品總額 */}
                      <div className="min-w-[80px] text-right text-base font-bold text-gray-800 md:text-lg">
                        NT$
                        {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 右側欄位 */}
              <div className="w-full rounded-lg bg-white p-6 shadow-sm lg:flex-[1]">
                <p className="mb-1 text-xs text-gray-500">{totalQty}件項目</p>
                <div className="mb-1 text-xl font-medium text-gray-700">
                  NT$ {totalAmount.toLocaleString()}
                </div>
                <Link href="/checkout/">
                  <button className="btn w-full border-none bg-[#45cad5] text-white hover:bg-[#36b3be]">
                    結帳
                  </button>
                </Link>
                <p className="mt-2 text-center text-xs text-cyan-500">
                  你可獲得 10 M幣
                </p>
              </div>
            </div>

            {/* 下方推薦商品區 */}
            <div className="mt-16">
              <h3 className="mb-6 border-l-4 border-red-500 pl-3 text-xl font-bold text-gray-800">
                其他旅人也買了...
              </h3>
            </div>

            {/* 🚀 4. 這裡改為使用 map 渲染從後端撈取到的推薦商品列表 */}
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
        /*購物車空介面 */
        <div className="flex w-full flex-col items-center justify-center bg-white py-16">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center bg-white px-4">
            <div>
              <img
                src="/cat-cart.jpg"
                alt="購物車空空的"
                className="mx-auto h-auto w-48 object-contain"
              />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-700">
              購物車空空的
            </h3>
            <Link href="experiences/search/1">
              <p className="mb-8 cursor-pointer text-base text-teal-500">
                馬上選購你喜歡的商品吧！
              </p>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
