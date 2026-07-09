import Image from "next/image";
interface Props {
  image: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
}
import { Star } from "lucide-react";

interface StarProps {
  score: number;
  count: number;
}
import { Heart } from "lucide-react"; // 建議使用 lucide-react

export const FavoriteButton = () => (
  <button className="absolute top-3 right-3 rounded-full bg-white/80 p-2 transition-colors hover:bg-white">
    <Heart className="h-5 w-5 text-gray-600" />
  </button>
);
export const RatingBadge = ({ score, count }: StarProps) => (
  <div className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-sm font-medium shadow-sm">
    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    <span>
      {score} ({count})
    </span>
  </div>
);
export const ExperienceCard = ({
  image,
  title,
  description,
  price,
  rating,
  reviewCount,
}: Props) => (
  <div className="group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-lg">
    <div className="relative h-64 w-full overflow-hidden">
      <Image
        src={image}
        alt={title}
        width={234}
        height={369}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <RatingBadge score={rating} count={reviewCount} />
      <FavoriteButton />
    </div>

    <div className="p-4">
      <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mb-4 line-clamp-2 text-sm text-gray-600">{description}</p>
      <p className="font-semibold text-teal-600">
        TWD {price.toLocaleString()}起
      </p>
    </div>
  </div>
);
export default function Page() {
  const experiences = [
    {
      title: "雲霧山林...",
      description: "攀登不為人知的...",
      price: 2800,
      rating: 4.8,
      reviewCount: 190,
      image: "/images/carousel1.jpg",
    },
    {
      title: "雲霧山林...",
      description: "攀登不為人知的...",
      price: 2800,
      rating: 4.8,
      reviewCount: 190,
      image: "/images/carousel1.jpg",
    },
    {
      title: "雲霧山林...",
      description: "攀登不為人知的...",
      price: 2800,
      rating: 4.8,
      reviewCount: 190,
      image: "/images/carousel1.jpg",
    },
    {
      title: "雲霧山林...",
      description: "攀登不為人知的...",
      price: 2800,
      rating: 4.8,
      reviewCount: 190,
      image: "/images/carousel1.jpg",
    },
    {
      title: "雲霧山林...",
      description: "攀登不為人知的...",
      price: 2800,
      rating: 4.8,
      reviewCount: 190,
      image: "/images/carousel1.jpg",
    },
    {
      title: "雲霧山林...",
      description: "攀登不為人知的...",
      price: 2800,
      rating: 4.8,
      reviewCount: 190,
      image: "/images/carousel1.jpg",
    },
    {
      title: "雲霧山林...",
      description: "攀登不為人知的...",
      price: 2800,
      rating: 4.8,
      reviewCount: 190,
      image: "/images/carousel1.jpg",
    },
    {
      title: "雲霧山林...",
      description: "攀登不為人知的...",
      price: 2800,
      rating: 4.8,
      reviewCount: 190,
      image: "/images/carousel1.jpg",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="mb-8 text-center text-3xl font-bold">超夯在地體驗</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {experiences.map((exp, i) => (
          <ExperienceCard key={i} {...exp} />
        ))}
      </div>
    </section>
  );
}
