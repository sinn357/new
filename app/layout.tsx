import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/contexts/AdminContext";
import AdminLoginModal from "@/components/AdminLoginModal";
import AdminButton from "@/components/AdminButton";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog Testing",
  description: "신우철의 개인 블로그",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AdminProvider>
            <Navigation />
            <main className="pt-24">{children}</main>
            <Footer />
            <AdminButton />
            <AdminLoginModal />
          </AdminProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
