import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import SocialProofWrapper from "@/components/SocialProofWrapper";
import InterestPopupWrapper from "@/components/InterestPopupWrapper";
import PromoPopupHost from "@/components/promo-popup/PromoPopupHost";
import LaunchLockWrapper from "@/components/LaunchLock/LaunchLockWrapper";
import { Providers } from "@/components/Providers";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import ThemePreviewBanner from "@/components/ThemePreviewBanner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { BASE_METADATA, BASE_VIEWPORT } from "@/lib/seo";
import { buildThemeCssVariables } from "@/modules/posIntegration/contracts/pos-themes.schema";
import { fetchActiveThemeTokens } from "@/modules/posIntegration/infrastructure/pos-theme.client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = BASE_METADATA;
export const viewport: Viewport = BASE_VIEWPORT;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeTheme = await fetchActiveThemeTokens();
  const dynamicThemeCss = buildThemeCssVariables(activeTheme);

  return (
    <html lang="es" suppressHydrationWarning data-theme={activeTheme.slug}>
      <head>
        <style id="cv-active-theme" dangerouslySetInnerHTML={{ __html: dynamicThemeCss }} />
      </head>
      <body
        className={`${geistSans.variable} antialiased bg-[var(--theme-bg)] text-[var(--theme-text)]`}
        suppressHydrationWarning
      >
        <Providers>
          <CartProvider>
            {children}
            <ThemePreviewBanner />
            <LaunchLockWrapper />
            <SocialProofWrapper />
            <InterestPopupWrapper />
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
