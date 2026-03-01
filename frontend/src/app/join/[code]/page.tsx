"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import type { ChallengeInvite } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export default function JoinPage() {
  const params = useParams();
  const code = params.code as string;

  const [challenge, setChallenge] = useState<ChallengeInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasToken = !!getToken();

  useEffect(() => {
    // 비로그인 시 로그인 페이지로 자동 리다이렉트
    if (!hasToken) {
      window.location.href = `/login?invite=${code}`;
      return;
    }

    const fetchInvite = async () => {
      try {
        const data = await apiClient.get<ChallengeInvite>(
          `/api/challenges/invite/${code}`
        );
        setChallenge(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "유효하지 않은 초대 코드입니다."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [code, hasToken]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "PREPARING":
        return "준비 중";
      case "ACTIVE":
        return "진행 중";
      case "COMPLETED":
        return "종료";
      default:
        return status;
    }
  };

  const handleJoin = () => {
    if (challenge) {
      localStorage.setItem("pendingChallengeId", challenge.id);
      window.location.href = "/home";
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-gray-500 dark:text-gray-400">불러오는 중...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6 text-center">
          <Image
            src="/images/mascot.png"
            alt="지방단속"
            width={100}
            height={100}
            className="mx-auto"
          />
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
          <Link
            href="/"
            className="inline-block text-sm text-gray-500 underline hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/images/mascot.png"
            alt="지방단속"
            width={120}
            height={120}
            priority
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            챌린지에 초대되었습니다
          </p>
        </div>

        {challenge && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h1 className="text-xl font-bold">{challenge.title}</h1>
            {challenge.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {challenge.description}
              </p>
            )}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">상태</span>
                <span className="font-medium">
                  {statusLabel(challenge.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  시작일
                </span>
                <span className="font-medium">
                  {formatDate(challenge.startDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  종료일
                </span>
                <span className="font-medium">
                  {formatDate(challenge.endDate)}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleJoin}
          className="w-full rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          참가하기
        </button>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 underline hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
