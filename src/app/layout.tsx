import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${urbanist.variable} ${inter.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
