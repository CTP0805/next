import type { PointTransaction } from "../types";
import { formatAmount, formatDate } from "../utils";

interface TransactionListProps {
  items: PointTransaction[];
}

function typeLabel(type: PointTransaction["type"]): string {
  switch (type) {
    case "earn":
      return "獲得";
    case "spend":
      return "使用";
    case "refund":
      return "退還";
    case "expire":
      return "過期";
  }
}

export default function TransactionList({ items }: TransactionListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white px-5 py-16 text-center text-sm text-gray-400">
        目前沒有符合條件的 M幣紀錄
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 bg-white px-5 pb-2">
      {items.map((item) => {
        const positive = item.amount > 0;
        return (
          <article
            key={item.id}
            className="flex items-start justify-between gap-4 py-4"
          >
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span>{formatDate(item.created_at)}</span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                  {typeLabel(item.type)}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
              {item.order_id ? (
                <p className="mt-1 text-[10px] text-gray-400">
                  訂單編號：{item.order_id}
                </p>
              ) : null}
              {item.expires_at && item.type === "earn" ? (
                <p className="text-[10px] text-gray-400">
                  有效至 {formatDate(item.expires_at)}
                </p>
              ) : null}
            </div>
            <span
              className={`shrink-0 text-lg font-semibold ${
                positive ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {formatAmount(item.amount)}
            </span>
          </article>
        );
      })}
    </div>
  );
}
