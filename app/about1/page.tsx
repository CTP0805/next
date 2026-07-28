export default function AboutPage() {
  return (
    <main className="relative flex min-h-[calc(100svh-80px)] items-center justify-center overflow-hidden px-6 py-20 text-white">
      {/* 背景圖片：之後可替換成自己的圖片路徑，例如 url('/images/about.jpg') */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/about.jpg')",
        }}
      />

      {/* 深色濾鏡：讓白色文字在圖片上更清楚 */}
      <div className="absolute inset-0 bg-[#163d4a]/65" />

      {/* 細框：模仿你參考圖片的設計 */}
      <div className="absolute inset-5 border border-white/40 sm:inset-8 lg:inset-12" />

      {/* 中間文字內容 */}
      <section className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="mb-5 text-xs font-semibold tracking-[0.3em] text-[#e4c78d] sm:text-sm">
          MEET LOCALS
        </p>

        <h1 className="font-besley text-6xl! font-normal! tracking-tight! sm:text-7xl! lg:text-8xl!">
          About Us
        </h1>

        <div className="mx-auto my-8 h-px w-16 bg-[#e4c78d]" />

        <p className="mb-7 text-xl font-semibold leading-9 sm:text-2xl">
          「人生，就是一場由無數體驗編織而成的旅程。」
        </p>

        <div className="space-y-5 text-base leading-8 text-white/90 sm:text-lg sm:leading-9">
          <p>
            你是不是也厭倦了上車睡覺、下車打卡的跟團旅行？
            旅行最美的風景，往往不是著名的地標，而是與當地人不期而遇的溫度。
          </p>

          <p>
            Meet Locals 為此而生，我們是一個專注於「在地深度體驗」的平台。
            在這裡，你不用當個格格不入的觀光客。
          </p>

          <p>
            我們連結最熱情的在地職人與生活家，帶你鑽進巷弄、
            探索獨家的私房景點、品嚐最道地的異國美味。
          </p>

          <p className="pt-2 font-semibold text-[#f3deb2]">
            「這一次，讓我們玩得像個當地人——
            你會發現，這比跟團好玩太多了！」
          </p>
        </div>
      </section>
    </main>
  );
}