// components/ReviewCard.tsx
export const columns = [
  [
    { type: "review", id: 1 },
    { type: "image", id: 2 },
  ],
  [
    { type: "image", id: 3 },
    { type: "review", id: 4 },
  ],
  [
    { type: "review", id: 6 },
    { type: "image", id: 7 },
  ],
  [
    { type: "image", id: 8 },
    { type: "review", id: 9 },
  ],
];
export function ReviewCard() {
  return (
    <div className="rounded-3xl bg-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative aspect-square h-12 w-12 rounded-full bg-gray-300">
          <Image
            src="/images/carousel1.jpeg"
            alt=""
            className="rounded-full"
            fill
          />
        </div>
        <div>
          <p className="">Sarah W.</p>
          ⭐⭐⭐⭐⭐
        </div>
      </div>

      <p className="mt-4 text-gray-600">
        「這不是觀光行程，而是在交朋友。..........這不是觀光行程，而是在交朋友。這不是觀光行程，而是在交朋友。這不是觀光行程，而是在交朋友。.」
      </p>
    </div>
  );
}
// components/ImageCard.tsx

import Image from "next/image";

export function ImageCard() {
  return (
    <div className="relative h-96 overflow-hidden rounded-3xl">
      <Image
        src="/images/carousel1.jpeg"
        alt=""
        fill
        className="rounded-3xl object-cover"
      />
    </div>
  );
}

// app/page.tsx

export default function Home() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 text-center">
        <h2 className="inline-block w-[240px] rounded-[16px] bg-[#45cad5] px-6 py-2 text-xl font-bold text-white">
          旅人好評
        </h2>
        <p className="mt-4 text-gray-500">
          已有超過 10,000 位探險家在 Meet Locals 寫下故事
        </p>
      </div>
      <div className="grid grid-cols-2 gap-8 xl:grid-cols-4">
        {columns.map((column, index) => (
          <div
            key={index}
            className={`space-y-8 ${index % 2 === 0 ? "md:pt-24" : ""}`}
          >
            {column.map((item) =>
              item.type === "review" ? (
                <ReviewCard key={item.id} />
              ) : (
                <ImageCard key={item.id} />
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
