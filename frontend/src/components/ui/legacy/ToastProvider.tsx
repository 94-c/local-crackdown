"use client"

import { toast } from "sonner"

// useToast — re-mapped to sonner's imperative API for backward compatibility.
// Pages that previously called `const { success, error, info } = useToast()`
// can continue to do so without any changes.
export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
  }
}

// ToastProvider — sonner's <Toaster> must be placed in the root layout instead.
// This stub keeps legacy imports from breaking during the migration period.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
