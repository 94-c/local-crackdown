"use client";

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
} as const;

interface ProgressBarProps {
  value: number;
  size?: keyof typeof sizeClasses;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  size = "md",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>달성률</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${sizeClasses[size]}`}
      >
        <div
          className={`${sizeClasses[size]} rounded-full bg-black transition-all duration-500 dark:bg-white`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
