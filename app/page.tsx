import HeroSection from "@/components/HeroSection";
import PopularDestinations from "@/components/PopularDestinations";
import ExperienceCard from "@/components/ExperienceCard";
import ReviewSection from "@/components/ReviewSection";
import ChatWidget from "@/components/ChatWidget";
export default function Home() {
  return (
    <>
      <HeroSection />
      <PopularDestinations />
      <ExperienceCard />
      <ReviewSection />
      <ChatWidget />
    </>
  );
}
