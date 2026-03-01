"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { isAdmin } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      window.location.href = isAdmin(data.accessToken) ? "/admin" : "/home";
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
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/images/mascot.png"
            alt="지방단속"
            width={120}
            height={120}
            priority
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            4주 챌린지로 목표를 달성하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="space-y-3 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-medium underline hover:text-black dark:hover:text-white"
            >
              회원가입
            </Link>
          </p>
          <p>
            <Link
              href="/"
              className="underline hover:text-black dark:hover:text-white"
            >
              홈으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
