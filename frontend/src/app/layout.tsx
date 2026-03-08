import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "지방단속 | Fat Patrol",
  description: "4주 팀 경쟁 챌린지 관리 시스템",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/mascot.png",
    apple: "/images/mascot.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "지방단속",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ServiceWorkerRegister />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
