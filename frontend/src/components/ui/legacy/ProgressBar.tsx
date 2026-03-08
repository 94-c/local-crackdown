"use client"

import * as React from "react"
import { Progress } from "../progress"
import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
} as const

interface ProgressBarProps {
  value: number
  size?: keyof typeof sizeClasses
  showLabel?: boolean
  className?: string
}

export function ProgressBar({
  value,
  size = "md",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>달성률</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <Progress
        value={clamped}
        className={cn(sizeClasses[size])}
      />
    </div>
  )
}
