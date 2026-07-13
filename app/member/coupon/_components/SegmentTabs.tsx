interface TabItem<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface SegmentTabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "primary" | "secondary";
}

export default function SegmentTabs<T extends string>({
  items,
  value,
  onChange,
  variant = "primary",
}: SegmentTabsProps<T>) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={
        isPrimary
          ? "flex border-b border-gray-100 bg-white px-2 text-sm sm:px-5"
          : "flex flex-wrap gap-2 px-5 py-3"
      }
      role="tablist"
    >
      {items.map((item) => {
        const active = item.key === value;

        if (!isPrimary) {
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-[#45cad5] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item.label}
              {typeof item.count === "number" ? ` (${item.count})` : ""}
            </button>
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={`px-4 py-3 font-medium transition sm:px-5 ${
              active
                ? "border-b-[3px] border-emerald-500 text-emerald-600"
                : "border-b-[3px] border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {item.label}
            {typeof item.count === "number" ? (
              <span className="ml-1 text-xs opacity-70">{item.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
