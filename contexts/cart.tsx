//建立context
"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { API_SERVER } from "@/config/api-path";

//定義商品項目型別
export interface ProductItem {
  experienceId: number;
  name: string;
  price: number;
  spec?: string;
  image_url?: string;
}

//定義購買的商品項目的型別
export interface CartItem {
  image?: string;
  spec?: string;
  cartId?: number;
  experienceId: number;
  sessionId: number;
  name: string;
  price: number;
  quantity: number; //購物車項目數量屬性
  sessionName?: string; // 可讀的場次資訊 (例如：2026-08-01 14:00)
}

//要使用context共享的value類型
interface CartcontextType {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  totalQty: number;
  totalAmount: number;

  // 新增商品時，必須同時指定商品與選擇的場次
  onAdd: (
    product: ProductItem,
    sessionId: number,
    quantity?: number,
    sessionName?: string,
  ) => void;

  // 操作數量或移除時，因為唯一 Key 是「商品 ID + 場次 ID」，所以必須同時傳入這兩個參數
  onDecrease: (experienceId: number, sessionId: number) => void;
  onIncrease: (experienceId: number, sessionId: number) => void;
  onRemove: (experienceId: number, sessionId: number) => void;

  //編輯功能
  onEdit: (
    oldExperienceId: number,
    oldSessionId: number,
    newProduct: ProductItem,
    newSessionId: number,
    newQuantity: number,
    newSessionName?: string,
  ) => void;
}

//使用null最為預設值
const CartContext = createContext<CartcontextType | null>(null);

//設定context的名稱, 會在react devtools(瀏覽器擴充)上面會看到，方便除錯用
CartContext.displayName = "CartContext";

//建立Provider元件
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  //新增useEffect,在 Provider 第一次渲染時，去後端拿真實的購物車商品
  useEffect(() => {
    fetch(`${API_SERVER}/api/cart/cart`,{
        method: "GET",
        credentials: "include"
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success) {
            // 將後端回傳的購物車陣列存進 state 中
            setItems(resData.data);
          }
        })
        .catch((err) => console.error("無法取得購物車資料:", err));
  }, []); // 空陣列代表只在網頁開啟時拿一次

  //處理遞增: 增加指定行程與場次的數量
  const onIncrease = async (experienceId: number, sessionId: number) => {
    // 1. 先找出原本的項目，計算加 1 後的最新數量
    const currentItem = items.find(
      (v) => v.experienceId === experienceId && v.sessionId === sessionId,
    );
    if (!currentItem) return;
    const targetQty = currentItem.quantity + 1;

    // 2. 先更新前端狀態，讓使用者點擊時數字瞬間改變
    const nextItems = items.map((v) => {
      // 必須同時符合商品 ID 與 場次 ID
      if (v.experienceId === experienceId && v.sessionId === sessionId) {
        // 對符合條件的物件作修改
        // 用展開運算子作複製物件，並修改quantity屬性值+1
        return { ...v, quantity: targetQty };
      } else {
        // 不符條件的直接回傳保持原樣
        return v;
      }
    });
    // 設定到狀態中成為新狀態
    setItems(nextItems);

    //在背景偷偷向後端發送更新 API
    try {
      await fetch(`http://localhost:3001/api/cart/update`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // 暫時寫死的會員 ID
          experienceId,
          sessionId,
          quantity: targetQty, // 告訴後端最新數量
        }),
      });
    } catch (err) {
      console.error("同步後端數量失敗", err);
    }
  };

  //處理遞減
  const onDecrease = async (experienceId: number, sessionId: number) => {
    // 1. 找出原本的項目，計算減 1 後的最新數量 (最少為 1)
    const currentItem = items.find(
      (v) => v.experienceId === experienceId && v.sessionId === sessionId,
    );
    if (!currentItem) return;
    const targetQty =
      currentItem.quantity - 1 < 1 ? 1 : currentItem.quantity - 1;

    // 2. 如果數量已經是 1 還點減，就不執行任何動作 (防止發送沒意義的 API 請求)
    if (currentItem.quantity === 1) return;

    // 3. 更新前端狀態
    const nextItems = items.map((v) => {
      if (v.experienceId === experienceId && v.sessionId === sessionId) {
        return { ...v, quantity: targetQty };
      } else {
        // 不符條件的直接回傳保持原樣
        return v;
      }
    });

    // 設定到狀態中成為新狀態
    setItems(nextItems);

    // 4. 背景發送更新 API
    try {
      await fetch("http://localhost:3001/api/cart/update", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId,
          sessionId,
          quantity: targetQty, // 告訴後端最新數量
        }),
      });
    } catch (error) {
      console.error("同步後端數量失敗:", error);
    }
  };

  //處理刪除:從購物車中刪除指定商品
  const onRemove = (experienceId: number, sessionId: number) => {
    //先通知後端資料庫刪除這筆資料
    fetch(
      `${API_SERVER}/api/cart/cart-items?experienceId=${experienceId}&sessionId=${sessionId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          console.log("資料庫已成功同步刪除");
        } else {
          console.warn("後端刪除失敗:", resData.message);
        }
      })
      .catch((err) => console.error("同步後端刪除出錯:", err));

    const nextItems = items.filter((v) => {
      // 排除掉同時符合 experienceId 和 sessionId 的那一筆
      return !(v.experienceId === experienceId && v.sessionId === sessionId);
    });
    // 設定到狀態中成為新狀態
    setItems(nextItems);
  };

  //處理新增商品到購物車中
  const onAdd = async (
    product: ProductItem,
    sessionId: number,
    quantity = 1,
    sessionName?: string,
  ) => {
    // 尋找購物車中是否已經有「同行程且同場次」的項目
    const foundIndex = items.findIndex(
      (v) =>
        v.experienceId === product.experienceId && v.sessionId === sessionId,
    );

    if (foundIndex !== -1) {
      // 找到了：直接增加數量 (增加傳入的 quantity，若沒傳入預設是 +1)量
      const nextItems = items.map((v, idx) => {
        if (idx === foundIndex) {
          return { ...v, quantity: v.quantity + quantity };
        }
        return v;
      });
      setItems(nextItems);
    } else {
      // 沒找到：新加入一筆
      const newItem: CartItem = {
        image: product.image,
        spec: product.spec,
        experienceId: product.experienceId,
        name: product.name,
        price: product.price,
        sessionId: sessionId,
        quantity: quantity,
        sessionName: sessionName,
      };
      // 讓新加入的商品在最上面
      const nextItems = [newItem, ...items];
      setItems(nextItems);
    }
    try {
      await fetch("http://localhost:3001/api/cart/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId: product.experienceId || product.id,
          sessionId: sessionId,
          quantity: quantity,
        }),
      });
    } catch (error) {
      console.error("同步後端新增購物車失敗:", error);
    }
  };

  //處理編輯:移除舊的，並塞入新的
  const onEdit = async (
    oldExperienceId: number,
    oldSessionId: number,
    newProduct: ProductItem,
    newSessionId: number,
    newQuantity: number,
    newSessionName?: string,
  ) => {
    // 1. 先過濾掉舊的那一筆資料
    const filteredItems = items.filter(
      (v) =>
        !(v.experienceId === oldExperienceId && v.sessionId === oldSessionId),
    );

    // 2. 檢查新選擇的商品+場次，是否已經存在於「剩餘的」購物車中
    const foundIndex = filteredItems.findIndex(
      (v) =>
        v.experienceId === newProduct.experienceId &&
        v.sessionId === newSessionId,
    );

    if (foundIndex !== -1) {
      // 如果新選擇的場次本來就在購物車其他地方有了，就直接合併數量
      const nextItems = filteredItems.map((v, idx) => {
        if (idx === foundIndex) {
          return { ...v, quantity: v.quantity + newQuantity };
        }
        return v;
      });
      setItems(nextItems);
    } else {
      // 如果是一筆全新的商品+場次組合，就建立新項目並塞進去
      const newItem: CartItem = {
        experienceId: newProduct.experienceId,
        name: newProduct.name,
        price: newProduct.price,
        sessionId: newSessionId,
        quantity: newQuantity,
        sessionName: newSessionName,
      };
      setItems([newItem, ...filteredItems]);
    }
    // 2. 🚀 同步發送請求到後端更新資料庫！
    try {
      await fetch("http://localhost:3001/api/cart/edit", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 冒號左邊是「後端收的名字」，冒號右邊是「前端本函式擁有的變數」
          experienceId: oldExperienceId,
          oldSessionId: oldSessionId,
          newSessionId: newSessionId,
          newQuantity: newQuantity,
        }),
      });
    } catch (error) {
      console.error("同步後端編輯失敗:", error);
    }
  };

  // 計算總數量：使用 reduce 方法累加所有商品的數量
  // reduce(累加器函數, 初始值) - acc是累加器，item是當前項目，0是初始值
  const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        setItems,
        totalQty,
        totalAmount,
        onEdit,
        onAdd,
        onDecrease,
        onIncrease,
        onRemove,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

//自訂名稱鉤子(先包裝useContext+CartContext)
export const useCart = () => {
  //從context值中解構出value中的值和切換函式
  const context = useContext(CartContext);

  if (!context) {
    throw Error("it must be used within CartProvider");
  }

  return context;
};
