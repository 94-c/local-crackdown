"use client";

import { useEffect, useState } from "react";
import { getToken, isAdmin } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      window.location.href = isAdmin(token) ? "/admin" : "/home";
      return;
    }
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">확인 중...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <Image
          src="/images/mascot.png"
          alt="지방단속 마스코트"
          width={240}
          height={240}
          priority
          className="mx-auto"
        />
        <p className="text-lg text-gray-600 dark:text-gray-400">
          4주 챌린지로 목표를 달성하세요
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-gray-300 px-6 py-3 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            회원가입
          </Link>
        </div>
      </div>
    </main>
  );
}
