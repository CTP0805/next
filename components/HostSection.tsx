import Image from "next/image";

export default function HostSection() {
  const data = [
    {
      title: "Oliver Bennett",
      content: "文史導覽員",
      image: "/images/hosts/host-1.jpg",
    },
    {
      title: "Hannah Keller",
      content: "藝文解說員",
      image: "/images/hosts/host-9.jpg",
    },
    {
      title: "James Carter",
      content: "私廚料理人",
      image: "/images/hosts/host-13.jpg",
    },
    {
      title: "George Wilson",
      content: "戶外活動領隊",
      image: "/images/hosts/host-19.jpg",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
       <h2 className="relative inline-block text-3xl font-extrabold tracking-tight text-[#2E3338]">
           <span className="relative z-10">在地嚮導們</span>
           <span className="absolute right-0 -bottom-1 z-0 h-3 w-full bg-[#BCEFF2]" />
        </h2>
        <p className="mt-4 mb-10 text-gray-500">為你帶來最道地的體驗 </p>
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 md:grid-cols-4 md:gap-20">
          {data.map((v, i) => {
            return (
              <div key={i} className="mb-10 flex w-full flex-col items-center">
                <div key={i} className="flex w-full flex-col items-center">
                  <div className="rounded-full border border-[#45cad5] p-1">
                    <div className="relative aspect-square h-[70px] w-[70px] overflow-hidden rounded-full md:h-[128px] md:w-[128px]">
                      <Image src={v.image} alt="" fill />
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center text-black">
                  <p className="text-[24px]">{v.title}</p>
                  <span className="text-[12px] font-[100]">{v.content}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
