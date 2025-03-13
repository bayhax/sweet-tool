import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "甜言蜜语工具箱 | Sweet Tool",
  description: "集合各种哄女朋友开心或者说甜言蜜语的小工具网站",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
          {children}
        </main>
      </body>
    </html>
  );
}
