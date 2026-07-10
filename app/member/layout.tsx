import MemberPanel from "@/components/MemberPanel";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto flex w-full max-w-[1280px] bg-white">
        <main className="min-h-screen bg-zinc-100 py-6 pr-6">
          <MemberPanel />
        </main>
        <div className="min-h-screen flex-1 rounded-[12px] border border-zinc-200 bg-sky-50/20  mt-6 shadow-xl">
          {children}
        </div>
      </div>
    </>
  );
}
