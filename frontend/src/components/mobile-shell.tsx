"use client"

import { MobileNav } from "./mobile-nav"

interface MobileShellProps {
  children: React.ReactNode
  hideNav?: boolean
}

export function MobileShell({ children, hideNav = false }: MobileShellProps) {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background">
      <main className={hideNav ? "" : "pb-20"}>{children}</main>
      {!hideNav && <MobileNav />}
    </div>
  )
}
