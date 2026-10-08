import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const description = "Personal design and development work by Thvgger. Brand identities, interfaces, and considered digital experiences.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Thvgger | Designer & Developer", template: "%s | Thvgger" },
  description,
  openGraph: { title: "Thvgger | Designer & Developer", description, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title: "Thvgger | Designer & Developer", description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      {/* Extensions such as ColorZilla add body attributes before hydration. */}
      <body suppressHydrationWarning>
        <MotionProvider>
          <a className="skip-link" href="#main">Skip to content</a>
          <Header />
          <main id="main" className="site-main">{children}</main>
          <SiteFooter />
        </MotionProvider>
      </body>
    </html>
  );
}
