import Image from "next/image";

export default function Features() {
  const data = [
    {
      title: "職人帶路",
      content: "在地人帶來獨特的體驗行程",
      image: "/images/features/Ship.svg",
    },
    {
      title: "單人友善",
      content: "超過 30%旅人為單獨報名",
      image: "/images/features/Group.svg",
    },
    {
      title: "小團限定",
      content: "在地人帶來獨特的體驗行程",
      image: "/images/features/Island.svg",
    },
    {
      title: "彈性預約",
      content: "多時段選擇，說走就走",
      image: "/images/features/Map.svg",
    },
  ];

  return (
    <div className="mx-auto grid max-w-[1280px] grid-cols-2 items-center justify-center gap-2 md:grid-cols-4">
      {data.map((v, i) => {
        return (
          <div key={i} className="flex w-full flex-col items-center">
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
  );
}
