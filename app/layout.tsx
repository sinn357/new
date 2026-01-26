import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { AdminProvider } from "@/contexts/AdminContext";
import AdminLoginModal from "@/components/AdminLoginModal";
import AdminButton from "@/components/AdminButton";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollProgress from "@/components/ScrollProgress";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://testshinblog.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '신우철 블로그',
    template: '%s',
  },
  description: '신우철의 개인 블로그 - 포트폴리오, 글, 리뷰, 여행기',
  keywords: ['블로그', '포트폴리오', '개발', '신우철'],
  authors: [{ name: '신우철' }],
  creator: '신우철',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: baseUrl,
    siteName: '신우철 블로그',
    title: '신우철 블로그',
    description: '신우철의 개인 블로그 - 포트폴리오, 글, 리뷰, 여행기',
  },
  twitter: {
    card: 'summary_large_image',
    title: '신우철 블로그',
    description: '신우철의 개인 블로그 - 포트폴리오, 글, 리뷰, 여행기',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '3FrMTdylmcSS6FakRkS3YXsszxKsOkCeB-ZFWajq9Nc',
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <ScrollProgress />
            <AdminProvider>
              <Navigation />
              <main className="pt-24">{children}</main>
              <Footer />
              <AdminButton />
              <AdminLoginModal />
            </AdminProvider>
          </Providers>
        </ThemeProvider>
        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
