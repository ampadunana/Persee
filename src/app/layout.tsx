import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import ThemeFade from "@/components/theme-fade";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Persee — Keep visitors moving",
  description:
    "Monitor broken pages, guide lost visitors, and protect your revenue with a modern, real-time dashboard.",
  // Don't set icons here; Next will auto-generate from src/app/icon.png
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ThemeProvider>
          <Navbar />
          {children}
          <Footer />
          <ThemeFade />
        </ThemeProvider>
      </body>
    </html>
  );
}