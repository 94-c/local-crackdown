"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Camera, Users, BarChart3, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"

const NAV_ITEMS = [
  { href: "/home", icon: Home, label: "홈" },
  { href: "/verify", icon: Camera, label: "인증" },
  { href: "/team", icon: Users, label: "팀" },
  { href: "/result", icon: BarChart3, label: "결과" },
  { href: "/profile", icon: User, label: "마이" },
]

export function MobileNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await apiClient.get<{ unreadCount: number }>(
          "/api/notifications/unread-count"
        )
        setUnreadCount(data.unreadCount)
      } catch {
        // silently fail
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "stroke-[2.5]")}
              />
              <span className={cn("font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
              {item.href === "/profile" && unreadCount > 0 && (
                <span className="absolute right-1.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-card" />
    </nav>
  )
}
