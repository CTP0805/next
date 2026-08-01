"use client";
import Link from "next/link";
import Image from "next/image";
import { HiTrash } from "react-icons/hi";
import { useCart } from "@/contexts/cart";

export default function CartDropdown() {
  const { items, totalQty, totalAmount, onRemove } = useCart();

  return (
    <li className="group relative mr-6 cursor-pointer px-3 py-2">
      <Link href="/cart" className="relative flex shrink-0 items-center">
        <Image src="/icon/cart.svg" alt="Cart" width={20} height={20} />
        {items.length > 0 && (
          <span className="absolute -top-2.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm">
            {items.length}
          </span>
        )}
      </Link>

      <div className="absolute top-full right-0 h-4 w-full bg-transparent"></div>

      <div className="absolute top-[calc(100%+1rem)] right-0 z-50 hidden w-80 rounded-xl border border-gray-100 bg-white p-4 shadow-xl transition-all group-hover:block">
        {items.length === 0 ? (
          <div className="py-2 text-center">
            <div className="relative mx-auto mb-4 h-48 w-48">
              <Image
                src="/cat-cart.jpg"
                alt="購物車空空的"
                fill
                className="object-contain text-black"
              />
            </div>
            <h4 className="mb-2 text-2xl font-bold text-gray-700">
              購物車暫無商品
            </h4>
            <Link href="/experiences/search">
              <p className="mb-8 cursor-pointer text-[12px] text-[#45cad5] hover:text-[#028B9E]">
                您的購物車目前是空的，
                <br />
                快去尋找下一個冒險目的地吧！
              </p>
            </Link>
            <Link
              href="/cart"
              className="block w-full text-center button-main"
            >
              前往購物車
            </Link>
          </div>
        ) : (
          <div className="text-black">
            <h4 className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2 text-xs font-bold text-gray-400">
              <span>最近加入的商品</span>
              <span className="font-black text-[#45cad5]">
                共 {items.length} 件
              </span>
            </h4>

            <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
              {items.slice(0, 3).map((item) => {
                const adultQty = Number(item.adultQuantity) || 0;
                const childQty = Number(item.childQuantity) || 0;
                const adultPrice =
                  Number(item.adultPrice) || Number(item.price) || 0;
                const childPrice = Number(item.childPrice) || 0;

                const subtotal =
                  adultQty * adultPrice + childQty * childPrice ||
                  (Number(item.quantity) || 1) * adultPrice;
                const totalPeople =
                  adultQty + childQty > 0
                    ? adultQty + childQty
                    : Number(item.quantity) || 1;

                return (
                  <div
                    key={`${item.experienceId}-${item.sessionId}`}
                    className="flex gap-3 border-b border-gray-50 pb-2.5 last:border-0"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={
                          item.image || "/images/experiences/seine-picnic.jpg"
                        }
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <h5 className="truncate text-[12px] font-black text-gray-800">
                        {item.name}
                      </h5>
                      <p className="truncate text-[10px] text-gray-400">
                        {item.sessionName || "未定場次"}
                      </p>
                      <div className="mt-0.5 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-500">
                          NT$ {subtotal.toLocaleString()}{" "}
                          <span className="text-[10px] text-gray-400">
                            x {totalPeople} 人
                          </span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onRemove(item.experienceId, item.sessionId);
                          }}
                          className="p-0.5 text-gray-300 transition-colors hover:text-red-500"
                          title="移除此商品"
                        >
                          <HiTrash className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 border-t border-gray-100 pt-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-400">
                  總計金額
                </span>
                <span className="text-sm font-black text-red-500">
                  NT$ {totalAmount.toLocaleString()}
                </span>
              </div>
              <Link
                href="/cart"
                className="button-main block w-full py-2.5 text-center text-xs font-bold"
              >
                進入購物車頁面
              </Link>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
