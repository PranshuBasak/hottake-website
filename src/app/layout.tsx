import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Atkinson_Hyperlegible, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConsentProvider } from "@/components/site/consent";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageTransition } from "@/components/site/page-transition";
import { ServiceWorkerRegister } from "@/components/site/sw-register";
import { Tracker } from "@/components/site/tracker";
import { JsonLd, organizationLd, softwareLd, websiteLd } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

const head = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-head", display: "swap" });
const body = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "HotTake — party games where every phone is a controller",
    template: "%s · HotTake",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [...site.keywords],
  authors: [{ name: site.creator.name, url: site.creator.linkedin }],
  creator: site.creator.name,
  publisher: site.creator.name,
  category: "games",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    url: "/",
    title: "HotTake — party games where every phone is a controller",
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    title: "HotTake — party games where every phone is a controller",
    description: site.description,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#120d0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${head.variable} ${body.variable} ${mono.variable} antialiased`}>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <a
          href="#main"
          className="sr-only z-[200] rounded-full bg-ember px-4 py-2 font-semibold text-[#1a120d] focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <JsonLd data={[websiteLd(), organizationLd(), softwareLd()]} />
        <ConsentProvider>
          <TooltipProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <PageTransition />
            <Tracker />
            <ServiceWorkerRegister />
            <Toaster theme="dark" position="bottom-center" richColors />
          </TooltipProvider>
        </ConsentProvider>
        <Script src="/vendor/ascii-magic/runtime/ascii.js" type="module" strategy="lazyOnload" />
      </body>
    </html>
  );
}
