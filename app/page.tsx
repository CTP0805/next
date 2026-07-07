import Image from "next/image";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import IconMenu from "@/components/IconMenu";
export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <div className="mx-auto mt-25 flex h-10 w-20 items-center justify-center bg-teal-400">
        熱門地區
      </div>
      <Footer />
    </>
  );
}
