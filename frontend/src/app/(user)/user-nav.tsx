"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiClient } from "@/lib/api-client";

const NAV_ITEMS = [
  { href: "/home", label: "홈", icon: "🏠" },
  { href: "/feed", label: "피드", icon: "📢" },
  { href: "/verify", label: "인증", icon: "📸" },
  { href: "/team", label: "팀", icon: "👥" },
  { href: "/notifications", label: "알림", icon: "🔔" },
  { href: "/profile", label: "내정보", icon: "👤" },
];

export function UserNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await apiClient.get<{ unreadCount: number }>(
          "/api/notifications/unread-count"
        );
        setUnreadCount(data.unreadCount);
      } catch {
        // silently fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition ${
                active
                  ? "text-black dark:text-white"
                  : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
              {item.href === "/notifications" && unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
