import { AuthProvider } from "@/components/layout/AuthProvider";
import Footer from "@/components/layout/Footer";
import { LangProvider } from "@/components/layout/LangContext";
import Navbar from "@/components/layout/Navbar";
import PageTracker from "@/components/layout/PageTracker";
import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fenibloodline.com"),
  title: {
    default: "Feni Blood Line — Save Lives Through Blood Donation",
    template: "%s | Feni Blood Line",
  },
  description:
    "Connect with verified blood donors across Feni District. Feni Blood Line is a community-driven platform ensuring medical precision meets human empathy when it matters most.",
  keywords: [
    "blood donation",
    "Feni",
    "blood donors",
    "emergency blood",
    "Bangladesh",
    "B+ blood",
    "A+ blood",
    "O+ blood",
    "blood bank",
    "feni blood",
    "রক্তদান",
    "ফেনী রক্ত",
    "রক্তদাতা",
    "জরুরি রক্ত",
    "ফেনী জেলা",
    "blood donor Feni District",
    "রক্ত খুঁজি",
    "fenibloodline",
    "blood group Bangladesh",
    "voluntary blood donation",
  ],
  authors: [{ name: "Feni Blood Line" }],
  creator: "Feni Blood Line",
  publisher: "Feni Blood Line",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fenibloodline.com",
    siteName: "Feni Blood Line",
    title: "Feni Blood Line — Save Lives Through Blood Donation",
    description:
      "Connect with verified blood donors across Feni. Our clinical sanctuary ensures privacy while prioritizing urgent life-saving needs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Feni Blood Line",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Feni Blood Line",
    description: "Connect with verified blood donors across Feni District.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://fenibloodline.com",
  },
  category: "health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Ahmed ReFat" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.ico" type="image/x-icon"/>

      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <LangProvider>
          <AuthProvider>
            <PageTracker />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="top-center" richColors closeButton />
          </AuthProvider>
        </LangProvider>

        {/* Structured Data */}
        <Script id="structured-data" type="application/ld+json" strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://fenibloodline.com/#organization",
                "name": "Feni Blood Line",
                "url": "https://fenibloodline.com",
                "logo": { "@type": "ImageObject", "url": "https://fenibloodline.com/favicon.png" },
                "description": "Community-driven blood donor platform connecting patients with verified donors across Feni District, Bangladesh.",
                "areaServed": { "@type": "Place", "name": "Feni, Bangladesh" },
                "foundingLocation": { "@type": "Place", "name": "Feni, Bangladesh" },
                "slogan": "Saving Lives in Feni District",
              },
              {
                "@type": "WebSite",
                "@id": "https://fenibloodline.com/#website",
                "url": "https://fenibloodline.com",
                "name": "Feni Blood Line",
                "inLanguage": ["en", "bn"],
                "description": "Find verified blood donors across Feni District. Fast, secure, and community-driven.",
                "publisher": { "@id": "https://fenibloodline.com/#organization" },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": { "@type": "EntryPoint", "urlTemplate": "https://fenibloodline.com/find-donor?bloodGroup={search_term_string}" },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "MedicalOrganization",
                "name": "Feni Blood Line",
                "url": "https://fenibloodline.com",
                "medicalSpecialty": "Blood Donation",
                "availableService": {
                  "@type": "MedicalTherapy",
                  "name": "Blood Donor Registry",
                  "description": "Free blood donor matching service for Feni District",
                },
              },
            ],
          })}}
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z8EHK4D8XV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z8EHK4D8XV');
          `}
        </Script>
      </body>
    </html>
  );
}
