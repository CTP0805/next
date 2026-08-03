//建立context
"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { API_SERVER } from "@/config/api-path";
import toast from "react-hot-toast";

//定義商品項目型別
export interface ProductItem {
  id?: number;
  experienceId: number;
  name: string;
  title?: string;
  price: number;
  adultPrice?: number;
  childPrice?: number;
  image_url?: string;
  image?: string;
}

//定義購買的商品項目的型別
export interface CartItem {
  cartId?: number;
  experienceId: number;
  sessionId: number;
  name: string;
  adultPrice: number;
  childPrice: number;
  adultQuantity: number;
  childQuantity: number;
  quantity: number; //購物車項目數量屬性
  sessionName?: string; //可讀的場次資訊 (例如：2026-08-01 14:00)
  image?: string;
  isSoldOut?: boolean; //新增：是否完售/過期
  maxParticipants?: number; // 接收後端的上限人數
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
    adultQuantity?: number,
    childQuantity?: number,
    sessionName?: string,
  ) => void;

  //更新大人小孩人數
  onUpdateQuantity: (
    experienceId: number,
    sessionId: number,
    type: "adult" | "child",
    delta: number,
  ) => void;

  //刪除功能
  onRemove: (experienceId: number, sessionId: number) => void;

  //編輯功能
  onEdit: (
    oldExperienceId: number,
    oldSessionId: number,
    newProduct: ProductItem,
    newSessionId: number,
    newAdultQty: number,
    newChildQty: number,
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
    fetch(`${API_SERVER}/api/cart/cart`, {
      method: "GET",
      credentials: "include",
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

  //更新數量（大人/小孩按鈕點擊）
  const onUpdateQuantity = async (
    experienceId: number,
    sessionId: number,
    type: "adult" | "child",
    delta: number,
  ) => {
    // 1. 先找出原本的項目，計算加 1 後的最新數量
    const currentItem = items.find(
      (v) => v.experienceId === experienceId && v.sessionId === sessionId,
    );
    if (!currentItem) return;

    let targetAdult = Number(currentItem.adultQuantity) || 0;
    let targetChild = Number(currentItem.childQuantity) || 0;
    const maxLimit = Number(currentItem.maxParticipants) || 8;

    // 如果是在「增加」人數，檢查總人數是否會超過上限
  if (delta > 0 && maxLimit > 0) {
    const nextTotal = targetAdult + targetChild + delta;
    if (nextTotal > maxLimit) {
      toast.error(`該場次最多只能預訂 ${maxLimit} 位！`);
      return; // 阻擋繼續增加
    }
  }
    
    if (type === "adult") {
      const nextAdult = targetAdult + delta;
      
    // 核心防呆：如果兒童 > 0，成人不能被按到少於 1 人！
      if (targetChild > 0 && nextAdult < 1) {
        toast.error("兒童需有至少一位成人陪同");
        return; // 阻止變更成 0 人大人
      }

      targetAdult = Math.max(0, nextAdult);
    } else {
      const nextChild = Math.max(0, targetChild + delta);

    // 核心防呆：當增加兒童 (nextChild > 0) 時，如果大人原本是 0，自動幫忙補 1 位大人！
      if (nextChild > 0 && targetAdult === 0) {
      // 補 1 位大人後再次檢查是否超過總上限
      if (maxLimit > 0 && 1 + nextChild > maxLimit) {
        toast.error(`該場次最多只能預訂 ${maxLimit} 位！`);
        return;
      }
      targetAdult = 1;
    }

      targetChild = nextChild;
    }

    // 至少要有一位成人或兒童 (若都變 0 則不處理，讓使用者透過刪除按鈕刪除)
    if (targetAdult + targetChild < 1) return;


    // 2. 先更新前端狀態，讓使用者點擊時數字瞬間改變
    const nextItems = items.map((v) => {
      // 必須同時符合商品 ID 與 場次 ID
      if (v.experienceId === experienceId && v.sessionId === sessionId) {
        // 對符合條件的物件作修改
        // 用展開運算子作複製物件，並修改quantity屬性值+1
        return {
          ...v,
          adultQuantity: targetAdult,
          childQuantity: targetChild,
          quantity: targetAdult + targetChild,
        };
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
          experienceId,
          sessionId,
          adultQuantity: targetAdult,
          childQuantity: targetChild,
        }),
      });
    } catch (err) {
      console.error("同步後端數量失敗", err);
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
    adultQuantity = 1,
    childQuantity = 0,
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
          const nextAdult = v.adultQuantity + adultQuantity;
          const nextChild = v.childQuantity + childQuantity;
          return {
            ...v,
            adultQuantity: nextAdult,
            childQuantity: nextChild,
            quantity: nextAdult + nextChild,
          };
        }
        return v;
      });
      setItems(nextItems);
    } else {
      // 沒找到：新加入一筆
      const newItem: CartItem = {
        image: product.image || product.image_url || "/images/experiences/seine-picnic.jpg",
        experienceId: product.experienceId,
        name: product.name,
        adultPrice: product.adultPrice ?? product.price ?? 0,
        childPrice: product.childPrice ?? 0,
        sessionName: sessionName,
        adultQuantity,
        childQuantity,
        quantity: adultQuantity + childQuantity,
        sessionId: sessionId,
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
          experienceId: product.experienceId,
          sessionId,
          adultQuantity,
          childQuantity,
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
    newAdultQty: number,
    newChildQty: number,
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
          const nextAdult = v.adultQuantity + newAdultQty;
          const nextChild = v.childQuantity + newChildQty;
          return {
            ...v,
            adultQuantity: nextAdult,
            childQuantity: nextChild,
            quantity: nextAdult + nextChild,
          };
        }
        return v;
      });
      setItems(nextItems);
    } else {
      // 如果是一筆全新的商品+場次組合，就建立新項目並塞進去
      const newItem: CartItem = {
        image: newProduct.image || newProduct.image_url || "/images/experiences/seine-picnic.jpg", 
        experienceId: newProduct.experienceId,
        name: newProduct.name,
        adultPrice: newProduct.adultPrice ?? newProduct.price ?? 0,
        childPrice: newProduct.childPrice ?? 0,
        sessionId: newSessionId,
        adultQuantity: newAdultQty,
        childQuantity: newChildQty,
        quantity: newAdultQty + newChildQty,
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
          oldSessionId,
          newSessionId,
          newAdultQuantity: newAdultQty,
          newChildQuantity: newChildQty,
        }),
      });
    } catch (error) {
      console.error("同步後端編輯失敗:", error);
    }
  };

  // 計算總件數與金額（排除掉已完售/過期的項目）
  const activeItems = items.filter((item) => !item.isSoldOut);

  const totalQty = activeItems.reduce((acc, item) => {
    const adult = Number(item.adultQuantity) || 0;
    const child = Number(item.childQuantity) || 0;
    // 若兩個都是 0，至少計算舊機制的 item.quantity
    const itemQty =
      adult + child > 0 ? adult + child : Number(item.quantity) || 0;
    return acc + itemQty;
  }, 0);

  const totalAmount = activeItems.reduce((acc, item) => {
    const adult = Number(item.adultQuantity) || 0;
    const child = Number(item.childQuantity) || 0;
    const adultP = Number(item.adultPrice) || 0;
    const childP = Number(item.childPrice) || 0;

    // 如果大人小孩數量都有算出來
    let sum = adult * adultP + child * childP;
    // 若都沒有（舊資料情境），備用舊邏輯
    if (sum === 0 && item.quantity) {
      sum = (Number(item.quantity) || 0) * adultP;
    }
    return acc + sum;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        setItems,
        totalQty,
        totalAmount,
        onEdit,
        onAdd,
        onUpdateQuantity,
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
