"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
  required?: boolean
  className?: string
}

export function FormField({
  label,
  error,
  hint,
  children,
  required,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <div>{children}</div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {!error && hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
