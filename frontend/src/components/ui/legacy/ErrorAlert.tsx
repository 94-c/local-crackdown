"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function ErrorAlert({
  message,
  onRetry,
  onDismiss,
  className,
}: ErrorAlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/10 p-4",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 shrink-0 text-destructive mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-destructive">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="mt-2 flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium text-destructive underline hover:text-destructive/80"
                >
                  다시 시도
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm text-destructive/70 hover:text-destructive"
                >
                  닫기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
