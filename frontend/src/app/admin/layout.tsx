import type { Metadata } from "next";
import { AdminNav } from "./admin-nav";
import { AdminGuard } from "./admin-guard";

export const metadata: Metadata = {
  title: "관리자 - 지방단속",
  description: "지방단속 관리자 페이지",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <AdminNav />
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
