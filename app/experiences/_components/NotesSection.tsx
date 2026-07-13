export default function NotesSection() {
  const notes = [
    ["參加條件", "建議年滿 12 歲；每團最多 8 人，未滿 18 歲需由成人陪同。"],
    ["取消政策", "體驗開始前 48 小時可免費取消，逾期恕不退款。"],
    ["天候安排", "小雨照常進行；遇惡劣天候將協助改期或全額退款。"],
    ["行走強度", "全程約步行 2.5 公里，建議穿著舒適好走的鞋。"],
  ];

  return (
    <section
      id="notes"
      className="scroll-mt-36 border-t border-[#DDE3E5] pt-12 pb-8"
    >
      <h4>注意事項</h4>
      <div className="mt-7 grid grid-cols-2 gap-x-12 gap-y-8 max-sm:grid-cols-1">
        {notes.map(([title, content]) => (
          <div
            key={title}
            className="grid grid-cols-[28px_minmax(0,1fr)] gap-3"
          >
            <span className="text-lg text-[#68BBC3]">◉</span>
            <div>
              <p className="text-[16px] font-extrabold">{title}</p>
              <p className="mt-2 text-[14px] leading-6 text-[#747C81]">
                {content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
