"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

export function UserGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setAuthorized(true);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">확인 중...</p>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
