"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { ErrorAlert, FormField } from "@/components/ui";
import { validateEmail, validatePassword } from "@/lib/validation";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiClient.post<{ accessToken: string }>(
        "/api/auth/login",
        { email, password }
      );
      localStorage.setItem("token", data.accessToken);
      window.location.href = "/admin";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "로그인에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/images/mascot.png"
            alt="지방단속"
            width={100}
            height={100}
            priority
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            관리자 계정으로 로그인하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

          <FormField label="이메일" error={fieldErrors.email ?? undefined} required>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() =>
                setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }))
              }
              className={`block w-full rounded-lg border px-4 py-3 focus:outline-none dark:bg-gray-900 ${
                fieldErrors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black dark:border-gray-700 dark:focus:border-white"
              }`}
              placeholder="admin@example.com"
            />
          </FormField>

          <FormField label="비밀번호" error={fieldErrors.password ?? undefined} required>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() =>
                setFieldErrors((prev) => ({
                  ...prev,
                  password: validatePassword(password),
                }))
              }
              className={`block w-full rounded-lg border px-4 py-3 focus:outline-none dark:bg-gray-900 ${
                fieldErrors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black dark:border-gray-700 dark:focus:border-white"
              }`}
              placeholder="••••••••"
            />
          </FormField>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {loading ? "로그인 중..." : "관리자 로그인"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/"
            className="underline hover:text-black dark:hover:text-white"
          >
            홈으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}
