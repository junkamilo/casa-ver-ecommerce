


import type { Metadata } from "next";
import { AnnouncementBar, Header, HeroSection } from "@/components";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Casa Verde — moda con esencia natural. Ropa con conciencia, estilo y calidad colombiana. Envíos a todo el país.",
  openGraph: {
    title: "Casa Verde",
    description:
      "Moda con esencia natural. Descubre ropa con conciencia, estilo y calidad colombiana.",
    type: "website",
  },
};
import Footer from "@/components/Footer";

import BestSellers from "@/components/layout/BestSellers";
import Categories from "@/components/layout/Categories";
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
