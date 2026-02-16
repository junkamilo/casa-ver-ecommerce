
import AnnouncementBar from "@/components/AnnouncementBar";
import BestSellers from "@/components/BestSellers";
import Categories from "@/components/Categories";
import ElevaTuLook from "@/components/ElevaTuLook";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import InstagramCTA from "@/components/InstagramCTA";
import NewCollection from "@/components/NewCollection";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";
import Testimonials from "@/components/Testimonials";
import ValueProps from "@/components/ValueProps";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <HeroSection />
      <BestSellers />
      <NewCollection />
      <Categories />
      <ElevaTuLook />
      <ValueProps />
      <PaymentMethodsBanner />
      <Testimonials />
      <InstagramCTA />
      <Footer />
    </div>
  );
}
