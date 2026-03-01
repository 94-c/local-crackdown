import { UserNav } from "./user-nav";
import { UserGuard } from "./user-guard";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserGuard>
      <div className="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex h-14 max-w-lg md:max-w-2xl lg:max-w-3xl items-center justify-center px-4">
            <span className="text-lg font-bold tracking-tight">지방단속</span>
          </div>
        </header>
        <main className="mx-auto max-w-lg md:max-w-2xl lg:max-w-3xl px-4 py-6">{children}</main>
        <UserNav />
      </div>
    </UserGuard>
  );
}
