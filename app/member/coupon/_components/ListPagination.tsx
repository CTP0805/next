interface ListPaginationProps {
  page: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export default function ListPagination({
  page,
  totalItems,
  pageSize,
  onChange,
}: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row">
      <p className="text-xs text-gray-400">
        顯示 {start}–{end}／共 {totalItems} 筆 · 每頁 {pageSize} 筆
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn btn-sm border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          上一頁
        </button>
        <span className="min-w-[4.5rem] text-center text-sm font-medium text-gray-700">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-sm border-none bg-[#45cad5] text-white hover:bg-[#36b3be] disabled:bg-gray-300"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          下一頁
        </button>
      </div>
    </div>
  );
}
