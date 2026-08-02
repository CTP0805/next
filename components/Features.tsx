import Image from "next/image";

export default function Features() {
  const data = [
    {
      title: "職人帶路",
      content: "在地人帶來獨特的體驗行程",
      image: "/images/features/tourguide.png",
    },
    {
      title: "單人友善",
      content: "超過 30%旅人為單獨報名",
      image: "/images/features/solo.png",
    },
    {
      title: "小團限定",
      content: "高品質 8 人內精緻小團",
      image: "/images/features/group.png",
    },
    {
      title: "彈性預約",
      content: "多時段選擇，說走就走",
      image: "/images/features/calender.png",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 pt-10">
      <div className="text-center">
        <h2 className="relative inline-block text-3xl font-extrabold tracking-tight text-[#2E3338] ">
          <span className="relative z-10">四大特色</span>
          <span className="absolute right-0 -bottom-1 z-0 h-3 w-full bg-[#BCEFF2]"/>
        </h2>
         <p className="mt-4 text-sm text-gray-500">
          跟著在地職人隨時出發，獨旅或小團都能輕鬆享受深度旅程。
        </p>
        <div className="pt-14 mx-auto grid max-w-[1280px] grid-cols-2 md:grid-cols-4 md:gap-20">
          {data.map((v, i) => {
            return (
              <div key={i} className="mb-10 flex w-full flex-col items-center">
                <div className="relative h-[70px] w-[70px] md:h-[128px] md:w-[128px]">
                  <Image src={v.image} alt="" fill />
                </div>

                <div className="mt-3 text-center text-[#ACACAC]">
                  <p className="text-[24px]">{v.title}</p>
                  <span>{v.content}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
