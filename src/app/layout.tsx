import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import SocialProofWrapper from "@/components/SocialProofWrapper";
import { Providers } from "@/components/Providers";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { SpeedInsights } from "@vercel/speed-insights/next";
<<<<<<< HEAD
import { Analytics } from "@vercel/analytics/next";
import { BASE_METADATA, BASE_VIEWPORT } from "@/lib/seo";

=======

import { BASE_METADATA, BASE_VIEWPORT } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { BASE_METADATA } from "@/lib/seo";

main
>>>>>>> 29eaedae4d0679596b8099ca692c327278038a1a
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
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <Providers>
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
