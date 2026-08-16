import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Public_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { VercelAnalytics } from "@/components/analytics/VercelAnalytics";

import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Plausible } from "@/components/analytics/Plausible";
import { InstallPwaPrompt } from "@/components/share/InstallPwaPrompt";
import { siteConfig } from "@/components/seo/SiteConfig";
import { KeepAlive } from "@/components/system/KeepAlive";
import { AdSenseScript } from "@/components/ads/AdSenseScript";

/**
 * Three faces, three jobs.
 *
 * Display is a variable grotesque with actual character - deliberately not
 * Inter or Geist, which are the default on every AI-built site. Body is a
 * clean neutral that stays out of the way. Mono carries every number that
 * represents data, so data looks like data.
 */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: `/og?title=${encodeURIComponent(siteConfig.name)}&subtitle=${encodeURIComponent(siteConfig.tagline)}`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // No global canonical: every real page sets its own (see each page's
  // generateMetadata / metadata). A blanket "/" canonical wrongly pointed the
  // homepage-less routes (404, widgets) at the homepage.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION ?? "",
    },
  },
};

/**
 * Theme colour follows the page surface in each scheme.
 *
 * It used to be a single value taken from the PDF domain hue, which meant the
 * mobile address bar rendered PDF-red on a mortgage calculator. Matching the
 * surface makes the browser chrome blend instead.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColorLight },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColorDark },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${publicSans.variable} ${bricolage.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = JSON.parse(localStorage.getItem('pdf-tool-theme') || '{}');
                // Dark is the first-visit default; a saved preference overrides it.
                var t = (s && s.state && s.state.theme) || 'dark';
                var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.toggle('dark', dark);
              } catch (e) { document.documentElement.classList.add('dark'); }
            `,
          }}
        />
      </head>
      <body className="min-h-full">
        <Plausible />
        <KeepAlive />
        <AdSenseScript />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <InstallPwaPrompt />
          <Toaster
            position="top-right"
            theme="system"
            closeButton
            richColors
            toastOptions={{ duration: 3500 }}
          />
        </ThemeProvider>
        <VercelAnalytics />
      </body>
    </html>
  );
}
