import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import SocialProofWrapper from "@/components/SocialProofWrapper";
import PromoPopupHost from "@/components/promo-popup/PromoPopupHost";
import LaunchLockWrapper from "@/components/LaunchLock/LaunchLockWrapper";
import { Providers } from "@/components/Providers";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { BASE_METADATA, BASE_VIEWPORT } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = BASE_METADATA;
export const viewport: Viewport = BASE_VIEWPORT;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} antialiased`}>
        <Providers>
          <CartProvider>
            {children}
            <LaunchLockWrapper />
            <SocialProofWrapper />
            <PromoPopupHost />
            <WhatsAppFloatingButton />
          </CartProvider>
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
