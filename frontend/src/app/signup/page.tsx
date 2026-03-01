"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ErrorAlert, FormField, Spinner } from "@/components/ui";
import { validateEmail, validatePassword, validateRequired } from "@/lib/validation";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner size="lg" /></div>}>
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

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
          {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

          <FormField label="닉네임" error={fieldErrors.nickname ?? undefined} required>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onBlur={() =>
                setFieldErrors((prev) => ({
                  ...prev,
                  nickname: validateRequired(nickname, "닉네임"),
                }))
              }
              className={`block w-full rounded-lg border px-4 py-3 focus:outline-none dark:bg-gray-900 ${
                fieldErrors.nickname
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black dark:border-gray-700 dark:focus:border-white"
              }`}
              placeholder="닉네임을 입력하세요"
            />
          </FormField>

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
              placeholder="email@example.com"
            />
          </FormField>

          <FormField label="비밀번호" error={fieldErrors.password ?? undefined} required>
            <input
              type="password"
              required
              minLength={8}
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
              placeholder="8자 이상 입력하세요"
            />
          </FormField>

          <FormField
            label="비밀번호 확인"
            error={fieldErrors.passwordConfirm ?? undefined}
            required
          >
            <input
              type="password"
              required
              minLength={8}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              onBlur={() =>
                setFieldErrors((prev) => ({
                  ...prev,
                  passwordConfirm:
                    passwordConfirm !== password
                      ? "비밀번호가 일치하지 않습니다"
                      : null,
                }))
              }
              className={`block w-full rounded-lg border px-4 py-3 focus:outline-none dark:bg-gray-900 ${
                fieldErrors.passwordConfirm
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black dark:border-gray-700 dark:focus:border-white"
              }`}
              placeholder="비밀번호를 다시 입력하세요"
            />
          </FormField>

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
