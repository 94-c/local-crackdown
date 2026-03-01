import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

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
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
          <ServiceWorkerRegister />
          {children}
        </body>
    </html>
  );
}
