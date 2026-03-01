"use client";

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorAlert({ message, onRetry, onDismiss }: ErrorAlertProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 shrink-0 text-red-500 mt-0.5"
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
          <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="mt-2 flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium text-red-700 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  다시 시도
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  닫기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
