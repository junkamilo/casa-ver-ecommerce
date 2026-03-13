
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import BestSellers from "@/components/layout/BestSellers";
import Categories from "@/components/layout/Categories";
import Header from "@/components/layout/Header";
import NewCollection from "@/components/layout/NewCollection";
import Testimonials from "@/components/layout/Testimonials";
import { TESTIMONIALS } from "@/components/layout/Testimonials/constants/constants";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <HeroSection />
      <BestSellers />
      <NewCollection />
      <Categories />
      <PaymentMethodsBanner />
      <Testimonials comments={TESTIMONIALS} />
      <Footer />
    </div>
  );
}
