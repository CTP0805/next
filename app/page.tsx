import HeroSection from "@/components/HeroSection";
import PopularDestinations from "@/components/PopularDestinations";
import ExperienceCard from "@/components/ExperienceCard";
import ReviewSection from "@/components/ReviewSection";
import ChatWidget from "@/components/ChatWidget";
import Features from "@/components/Features";
import HostSection from "@/components/HostSection";
export default function Home() {
  return (
    <>
      <HeroSection />
      <PopularDestinations />
      <ExperienceCard />
      <Features />
      <ReviewSection />
      <HostSection />
      <ChatWidget />
    </>
  );
}
