"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastItemProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

const bgClasses: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30",
  error: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30",
  info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30",
};

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 2700);
    const removeTimer = setTimeout(() => onRemove(toast.id), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 ${bgClasses[toast.type]} ${
        exiting ? "animate-[fade-out_0.3s_ease-out_forwards]" : "animate-[slide-in-right_0.3s_ease-out]"
      }`}
    >
      {icons[toast.type]}
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
