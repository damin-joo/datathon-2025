import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SessionProviderWrapper from "./components/SessionProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const brandFont = Cormorant_Garamond({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EcoCard",
  description: "Environmental Impact Credit Card",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${brandFont.variable} antialiased`}>
        <SessionProviderWrapper>
          <Navbar />
          <main className="p-6 pb-24 md:pb-6">
            {children}
          </main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
