"use client";

interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
}

export function SuccessAlert({ message, onDismiss }: SuccessAlertProps) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 shrink-0 text-green-500 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="flex-1 text-sm text-green-700 dark:text-green-400">{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
