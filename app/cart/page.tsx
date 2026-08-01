"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { HiStar } from "react-icons/hi";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  // 從自訂的 useCart 鉤子中解構出狀態與方法
  const { items, setItems, totalQty, totalAmount, onUpdateQuantity, onRemove } =
    useCart();

  // 記錄全選勾選
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // 🚀 新增這段 useEffect：當購物車資料 (items) 載入完成時，預設自動全選！
useEffect(() => {
  if (items.length > 0) {
    // 找出所有未過期的可勾選商品 key
    const allKeys = items
      .filter((item) => !item.isSoldOut)
      .map((item) => `${item.experienceId}-${item.sessionId}`);

    setSelectedKeys(allKeys);
  }
}, []); // 當 items 載入或更新時觸發

  // 存推薦商品的state
  const [recommendProducts, setRecommendProducts] = useState<
    RecommendProduct[]
  >([]);

  //綁定daisyUI Modal 的 ref
  const deleteModalRef = useRef<HTMLDialogElement>(null);

  // 記錄當前準備要刪除的單一商品 (如果為 null 代表是批量多選刪除)
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  // ==========================================
  // 🗑️ 觸發 DaisyUI Modal 彈窗
  // ==========================================

  // 1. 點擊卡片旁邊的「刪除」按鈕 (單一商品刪除)
  const handleRemoveSingleClick = (item: any) => {
    setItemToDelete(item); // 記錄準備刪除的這一筆商品
    deleteModalRef.current?.showModal();
  };

  // 2. 點擊「刪除選中活動」按鈕 (批量刪除)
  const handleRemoveSelected = async () => {
    if (selectedKeys.length === 0) {
      toast.error("請先勾選要刪除的商品！");
      return;
    }
    // 代替 confirm(...)，跳出 daisyUI Modal 讓使用者確認
    setItemToDelete(null); // 設為 null 代表批量刪除
    deleteModalRef.current?.showModal();
  };

  // 3. 點擊 Modal 裡面的「確定刪除」按鈕
  const confirmDelete = async () => {
    deleteModalRef.current?.close();

    // 遍歷所有被選中的 key，例如 "2-101"
    try {
      if (itemToDelete) {
        // === A. 刪除單一商品 ===
        await onRemove(itemToDelete.experienceId, itemToDelete.sessionId);

        // 如果該商品原本有被勾選，順便清除其 selectedKeys 狀態
        const itemKey = `${itemToDelete.experienceId}-${itemToDelete.sessionId}`;
        setSelectedKeys((prev) => prev.filter((key) => key !== itemKey));

        toast.success("已成功刪除活動！");
      } else {
        // === B. 批量刪除多個商品 ===
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
      }
    } catch (error) {
      console.error("批次刪除失敗:", error);
      toast.error("刪除時發生錯誤，請重整網頁。");
    } finally {
      setItemToDelete(null); // 重設為 null
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

  // 🚀 計算勾選商品的件數與金額 + 處理點擊前往結帳
  const selectedItems = items.filter((item) =>
    selectedKeys.includes(`${item.experienceId}-${item.sessionId}`),
  );

  const selectedTotalQty = selectedItems.reduce((acc, item) => {
    const adult = Number(item.adultQuantity) || 0;
    const child = Number(item.childQuantity) || 0;
    return acc + (adult + child || Number(item.quantity) || 0);
  }, 0);

  const selectedTotalAmount = selectedItems.reduce((acc, item) => {
    const adult = Number(item.adultQuantity) || 0;
    const child = Number(item.childQuantity) || 0;
    const adultP = Number(item.adultPrice) || Number(item.price) || 0;
    const childP = Number(item.childPrice) || 0;
    return acc + (adult * adultP + child * childP);
  }, 0);

  const handleGoToCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedKeys.length === 0) {
      toast.error("請至少勾選一項活動進行結帳！");
      return;
    }

    sessionStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
    router.push("/checkout");
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
      })
      .catch((err) => {
        console.error("無法取得推薦商品:", err);
      });
  }, []);

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
                      className="checkbox h-5 w-5 rounded-md border-[#DDE2E4] bg-white checked:border-[#68BBC3] checked:bg-[#68BBC3] checked:text-white"
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

                  const adultPrice =
                    Number(item.adultPrice) || Number(item.price) || 0;
                  const childPrice = Number(item.childPrice) || 0;

                  // 計算該卡片項目的總小計金額
                  const itemSubtotal =
                    adultQty * adultPrice + childQty * childPrice;

                  return (
                    <div
                      key={itemKey}
                      className={`relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all ${
                        item.isSoldOut ? "bg-gray-50 opacity-60" : ""
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                        {/* 左側：勾選框 + 圖片 + 標題與單價 */}
                        <div className="flex flex-1 items-start gap-4">
                          <input
                            type="checkbox"
                            disabled={item.isSoldOut}
                            className="checkbox checkbox-sm mt-1 h-5 w-5 rounded-md border-[#DDE2E4] bg-white checked:border-[#68BBC3] checked:bg-[#68BBC3] checked:text-white"
                            checked={selectedKeys.includes(itemKey)}
                            onChange={() =>
                              handleSelectItem(
                                item.experienceId,
                                item.sessionId,
                              )
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
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white">
                                已完售
                              </div>
                            )}
                          </div>

                          {/* 名稱與場次 */}
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-1 text-base font-bold text-gray-900">
                              {item.name}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.sessionName || "一般場次"}
                            </p>
                          </div>
                        </div>

                        {/* 右側：成人與兒童加減按鈕控制器 */}
                        <div className="flex shrink-0 flex-col items-end gap-3">
                          {!item.isSoldOut ? (
                            <>
                              {/* 成人按鈕控制區 */}
                              <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-600">成人</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-circle btn-outline border-gray-300 text-gray-600 hover:bg-gray-100"
                                    onClick={() => {
                                      if (childQty > 0 && adultQty <= 1) {
                                        toast.error("兒童需有至少一位成人陪同");
                                        return;
                                      }

                                      onUpdateQuantity(
                                        item.experienceId,
                                        item.sessionId,
                                        "adult",
                                        -1,
                                      );
                                    }}
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
                                        1,
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
                                        -1,
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
                                        1,
                                      )
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs font-medium text-red-400">
                              已截止
                            </span>
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
                          {/* 🚀 單一商品刪除按鈕，呼叫 handleRemoveSingleClick(item) */}
                          <button
                            type="button"
                            className="hover:text-red-500 hover:underline"
                            onClick={() => handleRemoveSingleClick(item)}
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
                  已選擇 {selectedKeys.length} 項活動
                </p>
                <div className="mb-4 text-2xl font-bold text-gray-900">
                  NT$ {selectedTotalAmount.toLocaleString()}
                </div>

                <button
                  type="button"
                  onClick={handleGoToCheckout}
                  disabled={selectedKeys.length === 0}
                  className={`button-main block w-full py-2.5 text-center ${
                    selectedKeys.length === 0
                      ? "pointer-events-none bg-gray-300 opacity-60"
                      : ""
                  }`}
                >
                  前往結帳
                </button>

                <p className="mt-2 text-center text-xs text-cyan-600">
                  預估可獲得約 {Math.round(totalAmount * 0.01).toLocaleString()}
                  M幣
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
                <Link
                  key={product.id}
                  href={`/experiences/${product.id}`}
                  className="group block overflow-hidden rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-2 flex h-40 items-center justify-center overflow-hidden rounded-md bg-gray-200">
                    {product.primaryImage ? (
                      <img
                        src={product.primaryImage}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">暫無圖片</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{product.city}</span>
                  <h5 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-bold text-gray-800">
                    {product.title}
                  </h5>

                  <p className="mt-1 flex items-center gap-1 text-[12px] font-bold">
                    {Number(product.review_count) > 0 ? (
                      <>
                        <HiStar
                          className="size-3 shrink-0 text-[#FFA938]"
                          aria-hidden="true"
                        />
                        <span className="text-[#F4A629]">{product.rating}</span>
                        <span className="font-medium text-[#8A9196]">
                          ({product.review_count} 則評價)
                        </span>
                      </>
                    ) : (
                      <span className="font-medium text-[#8A9196]">
                        尚無評價
                      </span>
                    )}
                  </p>

                  <p className="mt-3 text-sm font-bold text-gray-800">
                    NT${" "}
                    {product.minPrice
                      ? Number(product.minPrice).toLocaleString()
                      : "---"}{" "}
                    起
                  </p>
                </Link>
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
            {itemToDelete
              ? `確定要刪除「${itemToDelete.name || itemToDelete.name}」嗎？`
              : `確定要刪除這 ${selectedKeys.length} 項活動嗎？`}
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost">取消</button>
            </form>
            <button
              className="btn btn-error text-white"
              onClick={confirmDelete}
            >
              確定刪除
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
