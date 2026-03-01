"use client";

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
} as const;

interface SpinnerProps {
  size?: keyof typeof sizes;
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-gray-300 border-t-black dark:border-gray-600 dark:border-t-white ${sizes[size]} ${className}`}
      role="status"
      aria-label="로딩 중"
    />
  );
}
