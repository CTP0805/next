import MemberPanel from "@/components/MemberPanel";

export default function Page() {
  return (
    <>
      <div className="mx-auto flex w-[1280px] bg-amber-300">
        <main className="min-h-screen bg-zinc-100 p-6">
          <MemberPanel />
        </main>
        <div className="h-[50px] w-[50px] bg-amber-300">
          <div className="h-[100%] w-[100%] ">
          </div>
        </div>
      </div>
      
    </>
  );
}
