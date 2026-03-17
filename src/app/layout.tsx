import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import SocialProofPopup from "@/components/SocialProofPopup";
import { Providers } from "@/components/Providers";
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Casa Verde",
  description: "Casa Verde eCommerce",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers> {/* <--- ENVUELVE TODO AQUÍ */}
          <CartProvider>
            {children}
            <SocialProofPopup />
          </CartProvider>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
