"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { TicketsPlane } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface OrderItem {
  item_id: number;
  order_id: string;
  order_status: string;
  payment_method: string;
  order_date: string;
  coupon_discount: number;
  points_redeemed: number;
  experience_id: number;
  title: string;
  location: string;
  image_url: string;
  booking_date: string;
  quantity: number;
  item_price: number;
  final_amount?: number;
  contact_name?: string;
}

// 🚀 時間格式化小工具：把 "2026-07-31T20:23:21.000Z" 格式化成 "2026/08/01 10:00"
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "詳見產品頁說明";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // 如果不是正規 Date 字串，直接原字串傳回

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
};

export default function OrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "all" | "paid" | "pending" | "cancelled"
  >("all");
  const [selectedVoucher, setSelectedVoucher] = useState<OrderItem | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  // 綁定 DaisyUI 取消訂單 Modal 的 ref
  const cancelModalRef = useRef<HTMLDialogElement>(null);
  // 記錄當前準備要取消的 itemId
  const [cancelingItemId, setCancelingItemId] = useState<number | null>(null);

  // 1. 撈取真實訂單資料
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/member-orders", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("撈取訂單失敗：", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2-1. 點擊卡片上的「取消」按鈕，打開 DaisyUI Modal
  const handleCancelClick = (itemId: number) => {
    setCancelingItemId(itemId);
    cancelModalRef.current?.showModal();
  };

  // 2-2. 在 DaisyUI Modal 裡面點擊「確定取消」時執行真正的取消 API
  const confirmCancelOrder = async () => {
    if (!cancelingItemId) return;
    cancelModalRef.current?.close();

    try {
      const res = await fetch(
        "http://localhost:3001/api/member-orders/cancel",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ item_id: cancelingItemId }),
        },
      );
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "訂單已成功取消！");
        fetchOrders(); // 重新整理列表
      } else {
        toast.error(data.message || "取消失敗，請稍後再試");
      }
    } catch (err) {
      toast.error("系統連線錯誤");
    } finally {
      setCancelingItemId(null);
    }
  };

  // 3. 過濾頁籤資料
  const filteredOrders = orders.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "paid")
      return item.order_status === "paid" || item.order_status === "confirmed";
    if (activeTab === "pending") return item.order_status === "pending";
    if (activeTab === "cancelled") return item.order_status === "cancelled";
    return true;
  });

  // 計算分類數量
  const counts = {
    all: orders.length,
    paid: orders.filter(
      (o) => o.order_status === "paid" || o.order_status === "confirmed",
    ).length,
    pending: orders.filter((o) => o.order_status === "pending").length,
    cancelled: orders.filter((o) => o.order_status === "cancelled").length,
  };

  return (
    <div className="w-full text-gray-800">
      {/* 1. 頁面大標題與頁籤分類 */}
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-bold text-gray-700">歷史訂單</h3>

        {/* 🌟 狀態分類 Tab 頁籤 */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              activeTab === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部 ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab("paid")}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              activeTab === "paid"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            已確認 ({counts.paid})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              activeTab === "pending"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            待付款 ({counts.pending})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              activeTab === "cancelled"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            已取消 ({counts.cancelled})
          </button>
        </div>
      </div>

      {/* 2. 訂單列表容器 */}
      {loading ? (
        <div className="p-8 text-center text-sm text-gray-400">
          載入訂單中...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          目前暫無相關訂單紀錄
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredOrders.map((order) => (
            <div
              key={`${order.order_id}-${order.item_id}`}
              className="flex w-full flex-col justify-between gap-6 rounded-xl border border-dashed border-gray-300 bg-white p-5 pl-7 shadow-sm transition hover:shadow-md md:flex-row md:items-center"
            >
              {/* 【左側資訊區】：完全響應式 RWD 適應 */}
              <div className="flex flex-1 flex-col gap-2">
                {/* 標題與類型 */}
                <div className="flex items-center gap-2">
                  <TicketsPlane className="h-5 w-5 shrink-0 text-[#FF9224]" />
                  <h4 className="text-base leading-snug font-bold text-gray-900">
                    {order.title}
                  </h4>
                </div>

                {/* 訂單編號與狀態標籤 */}
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">
                    訂單編號：{order.order_id}
                  </span>

                  {(order.order_status === "paid" ||
                    order.order_status === "confirmed") && (
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                      已確認
                    </span>
                  )}
                  {order.order_status === "pending" && (
                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600">
                      待付款
                    </span>
                  )}
                  {order.order_status === "cancelled" && (
                    <span className="rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">
                      已取消
                    </span>
                  )}
                </div>

                {/* 詳細資訊條目 */}
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                  <p>地點：{order.location || "精選景點"}</p>
                  <p>
                    體驗日期：
                    {order.booking_date
                      ? new Date(order.booking_date).toLocaleDateString()
                      : "未指定"}
                  </p>
                  <p>參加人數：共 {order.quantity} 人</p>
                  <p>
                    付款方式：
                    {order.payment_method?.toLowerCase().includes("line")
                      ? "LINE Pay"
                      : "信用卡"}
                  </p>

                  {/*  M 幣折抵 (點數 > 0 才顯示) */}
                  {Number(order.points_redeemed) > 0 && (
                    <p className="font-medium">
                      M幣折抵：{order.points_redeemed} 點
                    </p>
                  )}

                  {/* 優惠券折抵 (金額 > 0 才顯示) */}
                  {Number(order.coupon_discount) > 0 && (
                    <p className="font-medium">
                      優惠券：NT${" "}
                      {Number(order.coupon_discount).toLocaleString()}
                    </p>
                  )}
                  <p>下單時間：{new Date(order.order_date).toLocaleString()}</p>
                </div>

                {/* 金額顯示 */}
                <div className="mt-2 text-sm font-bold text-gray-800">
                  <span>實付金額：</span>
                  <span className="text-base text-cyan-600">
                    NT$ {Number(order.item_price).toLocaleString()}
                  </span>
                </div>

                {/* 操作按鈕群（憑證 / 取消） */}
                <div className="mt-3 flex items-center gap-2">
                  {/* 情況 A：待付款狀態 (pending) -> 顯示【前往付款】 */}
                  {order.order_status === "pending" && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/payment?order_id=${order.order_id}`)
                      }
                      className="button-main !h-auto min-h-0 !px-4 !py-2 !text-xs"
                    >
                      前往付款
                    </button>
                  )}

                  {/* 情況 B：已付款 / 已確認狀態 (paid / confirmed) -> 顯示【訂單憑證】與【取消行程】 */}
                  {(order.order_status === "paid" ||
                    order.order_status === "confirmed") && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedVoucher(order)}
                        className="button-s-white"
                      >
                        訂單憑證
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCancelClick(order.item_id)}
                        className="button-s-red"
                      >
                        取消
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 【右側區塊】：圖片與評價 */}
              <div className="flex w-full flex-shrink-0 flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 md:w-44 md:border-t-0 md:border-l md:pt-0 md:pl-5">
                <div className="h-28 w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <img
                    src={
                      order.image_url ||
                      "/images/experiences/montmartre-art.jpg"
                    }
                    alt={order.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {(order.order_status === "paid" ||
                  order.order_status === "confirmed") && (
                  <Link href={`/member/review?id=${order.experience_id}`}>
                    <span className="cursor-pointer text-xs font-medium text-gray-400 underline underline-offset-4 transition hover:text-cyan-500">
                      立即評價
                    </span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. 🌟 訂單憑證彈窗 (Modal) */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            id="printable-voucher"
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
          >
            {/* 1. 票券頂部 Banner */}
            <div className="bg-[#45cad5] p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest uppercase opacity-90">
                  MeetLocal Voucher
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
                  已確認入場
                </span>
              </div>
              <h3 className="mt-2 line-clamp-1 text-lg font-extrabold">
                {selectedVoucher.title}
              </h3>
            </div>

            {/* 2. QR Code 核銷區 */}
            <div className="flex flex-col items-center border-b border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
              <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-md">
                <QRCodeSVG value={selectedVoucher.order_id} size={140} />
              </div>
              <p className="mt-3 font-mono text-xs font-bold text-gray-500">
                憑證序號：{selectedVoucher.order_id}
              </p>
              <p className="mt-1 text-[11px] text-gray-400">
                現場請出示此 QR Code 供工作人員掃描核銷
              </p>
            </div>

            {/* 3. 行程詳細資料 */}
            <div className="space-y-3 p-6 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">體驗日期/場次</span>
                <span className="font-bold text-gray-800">
                  {formatDate(
                    selectedVoucher.booking_date || selectedVoucher.order_date,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">參加人數</span>
                <span className="font-bold text-gray-800">
                  共 {selectedVoucher.quantity} 人
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">集合地點</span>
                <span className="font-bold text-gray-800">
                  {selectedVoucher.location || "詳見產品頁說明"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">訂購人姓名</span>
                <span className="font-bold text-gray-800">
                  {selectedVoucher.contact_name || "YANG POWEI"}
                </span>
              </div>
            </div>

            {/* 4. 底部控制按鈕 */}
            <div className="print-btn-group flex gap-3 bg-gray-50 p-4 pt-0">
              <button
                onClick={() => window.print()}
                className="btn btn-outline btn-sm flex-1 border-gray-300 text-xs text-gray-600 hover:bg-gray-100"
              >
                🖨️ 列印憑證
              </button>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="btn btn-sm flex-1 bg-[#45cad5] text-xs text-white hover:bg-[#3bb1bb]"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 專屬取消行程的 DaisyUI Modal */}
      <dialog ref={cancelModalRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold text-gray-900">確認取消行程</h3>
          <p className="py-4 text-sm text-gray-600">
            確定要取消此行程嗎？取消後實付金額將全額轉換為 M 幣退還至您的帳戶。
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost btn-sm">取消</button>
            </form>
            <button
              type="button"
              className="btn btn-error btn-sm text-white"
              onClick={confirmCancelOrder}
            >
              確定取消
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
