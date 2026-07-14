import MemberPanel from "@/components/MemberPanel";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col bg-white lg:flex-row">
      {/* 側欄：手機全寬、桌機固定寬，避免外部窄螢幕擠爆版面 */}
      <aside className="w-full shrink-0 bg-zinc-100 p-4 sm:p-6 lg:w-auto">
        <MemberPanel />
      </aside>
      <div className="min-h-screen min-w-0 flex-1 bg-zinc-50 p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
