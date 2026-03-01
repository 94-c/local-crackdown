"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/challenges", label: "챌린지" },
  { href: "/admin/users", label: "사용자" },
  { href: "/admin/teams", label: "팀 관리" },
  { href: "/admin/weekly-close", label: "주간마감" },
  { href: "/admin/rankings", label: "순위" },
  { href: "/admin/missions", label: "미션" },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex h-14 items-center gap-2">
          <Link href="/admin" className="mr-4 shrink-0">
            <Image
              src="/images/logo.png"
              alt="지방단속"
              width={100}
              height={36}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive(item.href)
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-gray-600 hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
