import MemberPanel from "@/components/MemberPanel";

export default function OrderLayout({
  children,
}:{
  children: React.ReactNode;
}) {
  return (
    <>
   <div className="mx-auto flex w-full max-w-[1280px] bg-white">
      <main className="min-h-screen bg-zinc-100 p-6">
        <MemberPanel />
      </main>
      <div className="min-h-screen flex-1 bg-amber-200 p-6">
        {children}
      </div>
    </div>
      
    </>
  );
}
