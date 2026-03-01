import type { Metadata } from "next";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = {
  title: "관리자 - Challenge",
  description: "Challenge 관리자 페이지",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
