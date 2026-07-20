type LoadingProps = {
  /** 圓圈大小，預設 48px */
  size?: number;
  /** 是否顯示文字 */
  showText?: boolean;
  /** 載入文字 */
  text?: string;
};

export default function Loading({
  size = 100,
  showText = true,
  text = "載入中...",
}: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      {/* 外圈 */}
      <div
        className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      />

      {showText && (
        <p className="text-sm text-gray-500">{text}</p>
      )}
    </div>
  );
}