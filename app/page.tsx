import Image from "next/image";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PopularDestinations from "@/components/PopularDestinations";
import Footer from "@/components/Footer";
import IconMenu from "@/components/IconMenu";
import ExperienceCard from "@/components/ExperienceCard";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <PopularDestinations />
      <ExperienceCard />
      <Footer />
    </>
  );
}
