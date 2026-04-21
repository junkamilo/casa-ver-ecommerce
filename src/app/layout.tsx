import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import SocialProofWrapper from "@/components/SocialProofWrapper";
import { Providers } from "@/components/Providers";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { BASE_METADATA } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = BASE_METADATA;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <Providers> {/* <--- ENVUELVE TODO AQUÍ */}
          <CartProvider>
            {children}
            <SocialProofWrapper />
            <WhatsAppFloatingButton />
          </CartProvider>
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
