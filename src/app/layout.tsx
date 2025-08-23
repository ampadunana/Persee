import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Revenue404 — Keep visitors moving",
  description: "Monitor broken pages, guide lost visitors, and protect your revenue with a modern, real-time dashboard.",
  icons: {
    icon: [
      { url: "/rev404_logo_on_black.png", sizes: "32x32", type: "image/png" },
      { url: "/rev404_logo_on_black.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/rev404_logo_on_black.png",
    apple: "/rev404_logo_on_black.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
