import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Learning Agency - 学びは、対話から生まれる",
  description: "AIとの対話を通じて自ら学び続ける力を育てる学習プラットフォーム",
  keywords: ["学習", "AI", "対話", "教育", "探究", "思考整理"],
  authors: [{ name: "Learning Agency" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`antialiased ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
