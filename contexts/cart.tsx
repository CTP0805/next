//建立context
"use client";

import { createContext, useState, useContext } from "react";

//定義商品項目型別
interface ProductItem {
  id: number;
  name: string;
  price: number;
}

//定義購買的商品項目的型別
interface CartItem {
  id: number;
  name: string;
  count: number; //購物車項目才有數量屬性
  price: number;
}

//要使用context共享的value類型
interface CartcontextType {
  items: CartItem[];
  totalQty: number;
  totalAmount: number;
  onAdd: (product: ProductItem) => void;
  onDecrease: (itemId: number) => void;
  onIncrease: (itemId: number) => void;
  onRemove: (itemId: number) => void;
}

//使用null最為預設值
const CartContext = createContext<CartcontextType | null>(null);

//設定context的名稱, 會在react devtools(瀏覽器擴充)上面會看到，方便除錯用
CartContext.displayName = "CartContext";

//建立Provider元件
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <CartContext.Provider value={{}}>{children}</CartContext.Provider>;
}

//自訂名稱鉤子(先包裝useContext+CartContext)
export const useCart=()=>{
    //從context值中解構出value中的值和切換函式
    const context =useContext(CartContext);

    if(!context){
        throw Error('it must be used within CartProvider')
    }

    return context;
}