"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

export default function KakaoCallbackPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

    if (!code) {
      setError("인증 코드가 없습니다. 다시 로그인해주세요.");
      return;
    }

    const authenticate = async () => {
      try {
        const data = await apiClient.post<{ accessToken: string }>(
          "/api/auth/kakao",
          { code, redirectUri }
        );
        localStorage.setItem("token", data.accessToken);
        window.location.href = "/";
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "로그인에 실패했습니다. 다시 시도해주세요."
        );
      }
    };

    authenticate();
  }, [searchParams]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="flex justify-center">
          <svg
            className="h-8 w-8 animate-spin text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          로그인 처리 중...
        </p>
      </div>
    </main>
  );
}
