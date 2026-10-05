import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope, Noto_Sans_Gurmukhi } from "next/font/google";
import { DemoProvider } from "@/lib/demo-store";
import { LanguageProvider } from "@/lib/i18n";
import { DemoBanner, SiteFooter, SiteHeader, SkipLink } from "@/components/SiteChrome";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const gurmukhi = Noto_Sans_Gurmukhi({
  subsets: ["gurmukhi"],
  weight: ["400", "600", "700"],
  variable: "--font-gurmukhi",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dr. Grewal — Grewal Homeo Remedies, Mohali",
    template: "%s · Dr. Grewal",
  },
  description:
    "Approval demonstration for Grewal Homeo Remedies, Mohali. Sample catalogue and simulated enquiries only.",
  applicationName: "Dr. Grewal demo",
  robots: { index: false, follow: false, nocache: true },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f5c32",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${gurmukhi.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <LanguageProvider>
          <DemoProvider>
            <SkipLink />
            <DemoBanner />
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </DemoProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
