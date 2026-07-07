import Image from "next/image";

type Experience = {
  id: number;
  title: string;
  location: string;
  rating: string;
  reviews: string;
  price: string;
  image: string;
};

export default function ExperienceCard({
  experience,
}: {
  experience: Experience;
}) {
  return (
    <article className="group min-w-0 rounded-lg bg-white transition-[transform,box-shadow] duration-500 ease-out will-change-transform hover:-translate-y-2 hover:shadow-[0_16px_34px_rgba(39,68,72,0.16)] focus-within:-translate-y-2 focus-within:shadow-[0_16px_34px_rgba(39,68,72,0.16)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#EEF1F2]">
        <Image
          src={experience.image}
          alt={experience.title}
          fill
          sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 45vw, 300px"
          className="object-cover"
        />
        <button
          type="button"
          aria-label={`將「${experience.title}」加入我的最愛`}
          className="absolute right-3 top-3 grid size-9 place-items-center text-[29px] leading-none text-black/45 [-webkit-text-stroke:2px_white] [paint-order:stroke_fill] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68BBC3]"
        >
          ♥
        </button>
      </div>

      <div className="px-4 pb-5 pt-3">
        <p className="text-xs font-medium text-[#858C91]">
          {experience.location}
        </p>
        <h2 className="mt-1 line-clamp-2 text-[16px] font-extrabold leading-6 text-[#2E3338]">
          {experience.title}
        </h2>
        <p className="mt-0.5 text-sm font-bold">
          <span className="text-[#F4A629]">{experience.rating}</span>
          <span className="ml-1 font-medium text-[#8A9196]">
            ({experience.reviews})
          </span>
        </p>
        <p className="mt-3 text-[18px] font-extrabold text-[#30353A]">
          {experience.price}
        </p>
      </div>
    </article>
  );
}
