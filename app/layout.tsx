import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { APP_NAME } from "@/lib/constants";
import Script from "next/script";

export const metadata: Metadata = {
  title: `${APP_NAME} — 50 Free AI-Powered Online Tools`,
  description:
    "50 free AI-powered tools for PDF, image, video, and writing. Remove backgrounds, upscale images, compress PDFs, write essays, convert videos and much more. No signup required.",
  keywords: "free online tools, AI tools, PDF merge, remove background, image upscale, compress PDF, essay writer, colorize photo, video compress",
  openGraph: {
    title: `${APP_NAME} — 50 Free AI-Powered Online Tools`,
    description: "PDF, image, video, AI writing — 50 free tools, no signup, privacy-first.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID !== "ca-pub-demo" && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
          ></script>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": APP_NAME,
              "url": "https://toolnode.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://toolnode.app/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": APP_NAME,
              "url": "https://toolnode.app",
              "logo": "https://toolnode.app/logo.png",
              "description": "A comprehensive suite of free AI-powered digital utilities."
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Navigation />
        <main>{children}</main>
        <Footer />
        <MobileNav />
        
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful');
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
