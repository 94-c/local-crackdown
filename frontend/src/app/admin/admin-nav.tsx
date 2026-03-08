"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  Users,
  UserCog,
  UsersRound,
  CalendarCheck,
  BarChart3,
  Sword,
  Monitor,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/challenges", label: "챌린지", icon: Trophy },
  { href: "/admin/participants", label: "참여자", icon: Users },
  { href: "/admin/users", label: "사용자", icon: UserCog },
  { href: "/admin/teams", label: "팀관리", icon: UsersRound },
  { href: "/admin/weekly-close", label: "주간마감", icon: CalendarCheck },
  { href: "/admin/rankings", label: "순위", icon: BarChart3 },
  { href: "/admin/missions", label: "미션", icon: Sword },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center gap-4">
          {/* Logo */}
          <Link href="/admin" className="flex shrink-0 items-center gap-2">
            <span className="text-lg font-bold tracking-tight">지방단속</span>
            <Badge variant="outline" className="text-xs">Admin</Badge>
          </Link>

          <Separator orientation="vertical" className="h-6" />

          {/* Nav links */}
          <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/home">
                <Monitor className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline">사용자 화면</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">로그아웃</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
