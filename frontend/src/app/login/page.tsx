"use client";

import Link from "next/link";

export default function LoginPage() {
  const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${redirectUri}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Challenge</h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            4주 챌린지로 목표를 달성하세요
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleKakaoLogin}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-medium transition hover:brightness-95"
            style={{ backgroundColor: "#FEE500", color: "#191919" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 0.5C4.029 0.5 0 3.591 0 7.408c0 2.46 1.594 4.627 4.006 5.88-.132.476-.852 3.065-.879 3.26 0 0-.018.146.077.203.095.056.208.013.208.013.274-.038 3.179-2.088 3.68-2.444.29.04.586.064.888.064 4.971 0 9-3.091 9-6.908C18 3.591 13.971 0.5 9 0.5"
                fill="#191919"
              />
            </svg>
            카카오로 시작하기
          </button>
        </div>

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
