"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-sm text-gray-500">로딩 중...</p></div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (password.length < 8) {
      return "비밀번호는 8자 이상이어야 합니다";
    }
    if (password !== passwordConfirm) {
      return "비밀번호가 일치하지 않습니다";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await apiClient.post("/api/auth/signup", { email, password, nickname });
      if (invite) {
        window.location.href = `/login?invite=${invite}&registered=true`;
      } else {
        window.location.href = "/login?registered=true";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "회원가입에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  const loginHref = invite ? `/login?invite=${invite}` : "/login";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/images/mascot.png"
            alt="지방단속"
            width={100}
            height={100}
            priority
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            새 계정을 만들어 챌린지에 참여하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              placeholder="닉네임을 입력하세요"
            />
          </div>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              placeholder="8자 이상 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium"
            >
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              required
              minLength={8}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="space-y-3 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            이미 계정이 있으신가요?{" "}
            <Link
              href={loginHref}
              className="font-medium underline hover:text-black dark:hover:text-white"
            >
              로그인
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
