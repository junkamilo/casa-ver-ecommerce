
import AnnouncementBar from "@/components/AnnouncementBar";
import ElevaTuLook from "@/components/ElevaTuLook";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import InstagramCTA from "@/components/InstagramCTA";
import BestSellers from "@/components/layout/BestSellers";
import Categories from "@/components/layout/Categories";
import Header from "@/components/layout/Header";
import NewCollection from "@/components/layout/NewCollection";
import Testimonials from "@/components/layout/Testimonials";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";
import ValueProps from "@/components/ValueProps";

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
