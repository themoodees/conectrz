import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Inter, Urbanist } from "next/font/google";
import "./globals.css";

/*
 * Fonts are self-hosted by next/font at build time.
 * Urbanist → headings/display (font-display). Inter → all UI text (font-sans).
 */
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://conectrz.com"),
  title: {
    default: "Conectrz",
    template: "%s · Conectrz",
  },
  description:
    "Discover and connect with creators living in Japan — UGC, influencer and content creators.",
  openGraph: {
    type: "website",
    siteName: "Conectrz",
    title: "Conectrz",
    description:
      "Discover and connect with creators living in Japan — UGC, influencer and content creators.",
    images: [{ url: "/logo.png" }],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${urbanist.variable} ${inter.variable}`}>
      {/* Google Tag Manager: production only, so local and preview work never sends hits. */}
      {process.env.NODE_ENV === "production" && <GoogleTagManager gtmId="GTM-MFVS9ZP6" />}
      <body className="min-h-dvh">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
