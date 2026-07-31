"use client";

import { useEffect, useRef } from "react";

const features = [
  {
    number: "01",
    title: "極致簡約的視覺",
    description: "以乾淨的版面與細膩的留白，讓每一段旅行故事都成為視線的焦點。",
  },
  {
    number: "02",
    title: "人性化會員中心",
    description: "從收藏、優惠券到旅程紀錄，把你的旅行偏好好好收進同一個地方。",
  },
  {
    number: "03",
    title: "精準搜尋與篩選",
    description: "依照地點、主題與需求，快速找到此刻最想體驗的在地生活。",
  },
  {
    number: "04",
    title: "流暢訂購流程",
    description: "少一點繁瑣步驟，多一點期待出發的時間，輕鬆完成每一次預訂。",
  },
];

const functions = [
  {
    title: "首頁",
    items: ["全域搜尋功能", "輪播牆", "即時客服聊天室"],
  },
  {
    title: "會員中心",
    items: [
      "註冊、登入、登出與第三方登入",
      "忘記密碼、心願清單、會員資料修改",
      "最近瀏覽、優惠券、會員分級權益與會員點數",
    ],
  },
  {
    title: "商品列表",
    items: ["多圖照片牆", "搜尋、篩選、排序功能", "分頁與收藏功能"],
  },
  {
    title: "購物車",
    items: [
      "購物車分車系統",
      "商品移除與數量調整",
      "結帳、訂單流程、LINE Pay 與綠界金流",
      "評分與評論功能",
    ],
  },
  {
    title: "部落格",
    items: ["新增與編輯部落格", "上下架管理", "文章詳細頁"],
  },
];

const members = ["王廷安", "楊博惟", "陳彥程", "王冠勛", "王冠煒"];

export default function AboutPage() {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    const textElements =
      page?.querySelectorAll<HTMLElement>("h1, h2, h3, p, a");

    if (!textElements) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      textElements.forEach((element) => {
        element.classList.add("about-text-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("about-text-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    textElements.forEach((element, index) => {
      element.style.transitionDelay = `${(index % 4) * 80}ms`;
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main
      ref={pageRef}
      className="about-page overflow-hidden bg-[linear-gradient(to_bottom,#FEFDFC_0%,#FAF8F4_20%,#F2EBE0_50%,#FAF8F4_75%,#FFFFFF_100%)] text-[#1e3435]"
    >
      {/* 首屏：滿版封面 */}
      <section className="relative flex min-h-[calc(100svh-60px)] items-center justify-center overflow-hidden px-6 py-24 text-white">
        {/* 背景圖片 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1920&auto=format&fit=crop')",
          }}
        />

        {/* 黑色濾鏡 */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#102f3b]/30 via-transparent to-[#102b32]/75" />

        {/* 裝飾線條 */}
        <div className="absolute inset-5 border border-white/35 sm:inset-8 lg:inset-12" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-5 text-xs font-semibold tracking-[0.38em] text-[#d9b77b] sm:text-sm">
            DISCOVER THE WORLD DIFFERENTLY
          </p>

          <h1 className="text-6xl! font-normal! tracking-tight! sm:text-7xl! lg:text-9xl!">
            About Us
          </h1>

          <div className="mx-auto my-8 h-px w-16 bg-[#d9b77b]" />

          <p className="mx-auto max-w-2xl text-lg leading-8 text-white/95 sm:text-xl sm:leading-9">
            人生，就是一場由無數體驗編織而成的旅程。
          </p>

          <a
            href="#purpose"
            className="mt-12 inline-flex items-center gap-3 text-sm font-medium tracking-[0.2em] text-white hover:text-[#e7c98f]"
          >
            探索我們的故事
            <span aria-hidden="true" className="text-xl">
              ↓
            </span>
          </a>
        </div>
      </section>

      {/* 品牌目的 */}
      <section
        id="purpose"
        className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-12 lg:py-32"
      >
        <div>
          <p className="mb-4 text-sm font-bold tracking-[0.22em] text-[#a17435]">
            OUR PURPOSE
          </p>
          <h2 className="font-besley text-4xl! leading-tight! font-normal! text-[#1e3435] sm:text-5xl!">
            不只是旅行，
            <br />
            而是真正走進當地的生活。
          </h2>
        </div>

        <div className="space-y-6 text-[#526264]">
          <p>
            你是不是也厭倦了上車睡覺、下車打卡的跟團旅行？旅行最美的風景，往往不是著名的地標，而是與當地人不期而遇的溫度。
          </p>

          <p>
            Meet Locals
            為此而生。我們是一個專注於「在地深度體驗」的平台。在這裡，你不用當個格格不入的觀光客。
          </p>

          <p>
            我們連結最熱情的在地職人與生活家，帶你鑽進巷弄、探索獨家的私房景點、品嚐最道地的異國美味。
          </p>

          <p className="border-l-2 border-[#b48a4c] py-1 pl-5 font-semibold text-[#1e3435]">
            「 這一次，讓我們玩得像個當地人——你會發現，這比跟團好玩太多了！」
          </p>
        </div>
      </section>

      {/* 圖片橫幅 */}
      <section className="px-6 sm:px-10 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden">
          <div
            className="min-h-screen bg-cover bg-center sm:h-[480px]"
            style={{
              backgroundImage: "url('/images/about.jpg')",
            }}
          />
          {/* url('https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1800&q=85') */}
          <div className="absolute inset-0 bg-[#173b3d]/25" />

          <p className="absolute bottom-7 left-7 max-w-xs border-l-2 border-[#e4c78d] pl-4 text-sm leading-6 text-white sm:bottom-10 sm:left-10">
            每一條巷弄、每一張餐桌、每一次聊天，
            <br />
            都可能成為旅程裡最難忘的片段。
          </p>
        </div>
      </section>

      {/* 特色 */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12 lg:py-32">
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-4 text-sm font-bold tracking-[0.22em] text-[#a17435]">
              WHAT WE VALUE
            </p>
            <h2 className="font-besley text-4xl! font-normal! text-[#1e3435] sm:text-5xl!">
              我們重視的體驗
            </h2>
          </div>
          <p className="max-w-sm text-[#667577]">
            從找到靈感、挑選體驗，到完成旅程，每一步都希望讓你感到自在。
          </p>
        </div>

        <div className="grid border-t border-[#d9d2c6] sm:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group border-b border-[#d9d2c6] py-8 sm:px-8 sm:odd:border-r lg:px-12 lg:py-11"
            >
              <p className="mb-9 text-sm font-bold tracking-[0.16em] text-[#b48a4c]">
                {feature.number}
              </p>
              <h3 className="mb-3 text-2xl! font-semibold! text-[#1e3435]">
                {feature.title}
              </h3>
              <p className="max-w-sm text-[#667577]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 組員 */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="mb-4 text-sm font-bold tracking-[0.22em] text-[#a17435]">
              THE PEOPLE BEHIND
            </p>
            <h2 className="font-besley text-4xl! font-normal! text-[#1e3435] sm:text-5xl!">
              認識我們
            </h2>
            <p className="mt-5 max-w-sm text-[#667577]">
              一群相信旅行能讓人更靠近世界，也更靠近自己的夥伴。
            </p>
          </div>

          <div className="grid grid-cols-2 border-t border-[#d9d2c6] sm:grid-cols-3">
            {members.map((member, index) => (
              <div
                key={member}
                className="flex min-h-36 flex-col justify-between border-b border-[#d9d2c6] py-5 sm:px-5 sm:odd:border-r sm:nth-[3n+2]:border-r lg:px-7"
              >
                <span className="text-sm tracking-widest text-[#b48a4c]">
                  0{index + 1}
                </span>
                <p className="text-xl font-semibold text-[#1e3435]">{member}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 聯絡我們 */}
      <section className="text-[#1e3435]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 sm:px-10 lg:grid-cols-[0.75fr_1.25fr] lg:px-12 lg:py-32">
          {/* 左側標題 */}
          <div className="border-b border-[#d9d2c6] pb-8 lg:border-r lg:border-b-0 lg:pr-16 lg:pb-0">
            <p className="mb-4 text-sm font-bold tracking-[0.22em] text-[#a17435]">
              MEET LOCALS
            </p>

            <h2 className="font-besley text-4xl! font-normal! text-[#1e3435] sm:text-5xl!">
              聯絡我們
            </h2>

            <p className="mt-5 max-w-sm text-[#667577]">
              有任何旅程上的問題，歡迎隨時與我們聯絡。
            </p>
          </div>

          {/* 右側聯絡資訊 */}
          <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-10">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#a17435]">
                PHONE
              </p>
              <a
                href="tel:0912345678"
                className="text-lg text-[#1e3435] transition hover:text-[#b48a4c]"
              >
                0912-345-678
              </a>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#a17435]">
                EMAIL
              </p>
              <a
                href="mailto:meetlocals@example.com"
                className="text-lg text-[#1e3435] transition hover:text-[#b48a4c]"
              >
                meetlocals@example.com
              </a>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#a17435]">
                ADDRESS
              </p>
              <p className="text-lg text-[#1e3435]">
                台中市西屯區逢甲路 100 號
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#a17435]">
                SOCIAL MEDIA
              </p>

              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-10 place-items-center rounded-full border border-[#b48a4c] text-sm font-semibold text-[#1e3435] transition hover:bg-[#1e3435] hover:text-white"
                >
                  FB
                </a>

                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-10 place-items-center rounded-full border border-[#b48a4c] text-sm font-semibold text-[#1e3435] transition hover:bg-[#1e3435] hover:text-white"
                >
                  IG
                </a>

                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-10 place-items-center rounded-full border border-[#b48a4c] text-sm font-semibold text-[#1e3435] transition hover:bg-[#1e3435] hover:text-white"
                >
                  YT
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 頁尾 CTA */}
      <section className="flex flex-col items-center px-6 py-20 text-center sm:px-10 lg:py-30 lg:pb-60">
        {/* <p className="mb-4 text-center text-sm font-bold tracking-[0.22em] text-[#557473]">
          MEET LOCALS
        </p> */}
        <h2 className="mx-auto max-w-xl text-center text-4xl! leading-tight! font-normal! text-[#1e3435] sm:text-6xl!">
          “ 下一次旅行，
          <br />
          玩得像個當地人 ”
        </h2>
      </section>
    </main>
  );
}
