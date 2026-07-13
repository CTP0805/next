"use client";

import React from "react";
import { ArrowLeft, X, Crown } from "lucide-react";

interface MemberLevelDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MemberLevelDetailDrawer: React.FC<MemberLevelDetailDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 z-[70] flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b px-6 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-700 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">返回</span>
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-10 overflow-y-auto px-6 py-8 text-gray-800">
          {/* ELITE STATUS */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-teal-600">
              <Crown className="h-5 w-5" />
              <span className="text-xs font-semibold tracking-[2px]">
                ELITE STATUS
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight">黃金會員</h2>

            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-500">尚需進度</span>
              <span>
                下一級：
                <span className="font-semibold text-teal-600">白金會員</span>
              </span>
            </div>
            <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-[65%] bg-gradient-to-r from-teal-400 to-cyan-500" />
            </div>
            <p className="text-sm text-gray-600">
              再完成 <span className="font-semibold">3 筆訂單</span> 或消費{" "}
              <span className="font-semibold">NT$ 12,000</span> 即可升級。
            </p>
          </div>

          {/* C 級 會員權益 */}
          <div>
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-2xl font-bold">C 級 會員權益</h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                會員分級權益懶人包
              </span>
            </div>

            <div className="-mx-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">
                      等級/權益
                    </th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-600">
                      領航員
                    </th>
                    <th className="px-3 py-3 text-center font-semibold text-amber-600">
                      黃金會員
                    </th>
                    <th className="px-3 py-3 text-center font-semibold text-purple-600">
                      白金會員
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y text-center">
                  <tr>
                    <td className="px-3 py-3 text-left font-medium">
                      大使權益
                    </td>
                    <td className="px-3 py-3">1倍 (最高回饋1%)</td>
                    <td className="px-3 py-3">3倍 (最高回饋3%)</td>
                    <td className="px-3 py-3">5倍 (最高回饋5%)</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="px-3 py-3 text-left font-medium">會員日</td>
                    <td className="px-3 py-3">TWD 50 基礎會員日</td>
                    <td className="px-3 py-3">TWD 150 進階會員日</td>
                    <td className="px-3 py-3">TWD 300 尊榮會員日</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-left font-medium">會員價</td>
                    <td className="px-3 py-3 text-gray-400">-</td>
                    <td className="px-3 py-3">Gold價</td>
                    <td className="px-3 py-3">Platinum價</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="px-3 py-3 text-left font-medium">升等禮</td>
                    <td className="px-3 py-3 text-gray-400">-</td>
                    <td className="px-3 py-3">TWD 200升等禮</td>
                    <td className="px-3 py-3">TWD 500升等禮</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-left font-medium">續會禮</td>
                    <td className="px-3 py-3 text-gray-400">-</td>
                    <td className="px-3 py-3">TWD 200續會禮</td>
                    <td className="px-3 py-3">USD 500續會禮</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 會員升級辦法 */}
          <div>
            <h3 className="mb-4 text-2xl font-bold">會員升級辦法</h3>
            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
              <p>會員等級資格以「完成參加訂單活動」為準計算。</p>
              <p>
                升級條件：目前為黃金會員，需再完成{" "}
                <span className="font-semibold text-gray-900">3 筆訂單</span>{" "}
                或累積消費{" "}
                <span className="font-semibold text-gray-900">NT$ 12,000</span>{" "}
                即可升級為白金會員。
              </p>
              <p className="text-xs text-gray-500">
                *
                會員資格有效期為一年，系統將依據年度消費與訂單活動自動審核升降等。
              </p>
            </div>
          </div>

          {/* 常見問題 */}
          <div>
            <h3 className="mb-4 text-2xl font-bold">常見問題</h3>
            <div className="space-y-3">
              {[
                {
                  q: "C級會員是什麼？",
                  a: "C級會員為本平台會員分級制度，包含領航員（基礎）、黃金會員、白金會員三個等級，依消費與活動參與度給予不同權益。",
                },
                {
                  q: "如何加入會員權益？",
                  a: "註冊帳號後自動成為領航員。累積消費或完成體驗預訂即可自動升等，無需額外申請。",
                },
                {
                  q: "有哪些優惠？我該如何升等？",
                  a: "請參考上方「C 級 會員權益」表格。升等條件為年度內完成指定訂單數或消費金額，詳見升級辦法說明。",
                },
                {
                  q: "哪裡可以查詢會員資格？",
                  a: "於個人檔案 > 會員等級 頁面，即可查看當前等級、進度條與剩餘升等條件。",
                },
              ].map((item, idx) => (
                <details
                  key={idx}
                  className="group rounded-2xl border border-gray-200 px-5 py-4"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-800 group-open:mb-3">
                    {item.q}
                    <span className="text-gray-400 transition-transform group-open:rotate-180">
                      ⌄
                    </span>
                  </summary>
                  <p className="pr-6 text-sm text-gray-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 gap-4 border-t px-6 py-4 text-xs text-gray-400">
          <a href="#" className="hover:text-gray-600">
            隱私權政策
          </a>
          <a href="#" className="hover:text-gray-600">
            C級常見問題中心
          </a>
        </div>
      </div>
    </>
  );
};

export default MemberLevelDetailDrawer;
