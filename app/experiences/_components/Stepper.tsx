type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  price?: number;
  min?: number;
};

export default function Stepper({
  value,
  onChange,
  label,
  price,
  min = 0,
}: StepperProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#EBEEEF] py-4 last:border-0">
      <div>
        <span className="block text-sm font-bold text-[#555D63]">{label}</span>

        {price !== undefined && (
          <span className="mt-1 block text-xs font-bold text-[#9AA1A6]">
            NT${price.toLocaleString("zh-TW")} / 人
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={`減少${label}人數`}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid size-7 place-items-center rounded-full border border-[#D9DFE1] text-[#697178] hover:border-[#68BBC3]"
        >
          −
        </button>

        <span className="w-4 text-center text-sm font-extrabold">{value}</span>

        <button
          type="button"
          aria-label={`增加${label}人數`}
          onClick={() => onChange(value + 1)}
          className="grid size-7 place-items-center rounded-full border border-[#D9DFE1] text-[#697178] hover:border-[#68BBC3]"
        >
          ＋
        </button>
      </div>
    </div>
  );
}
