"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type {
  Team,
  Achievement,
  InBodyRecord,
} from "@/lib/types";
import Link from "next/link";
import InBodyModal from "@/components/InBodyModal";

export default function ProfilePage() {
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [inbodyRecords, setInbodyRecords] = useState<InBodyRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async (cId: string) => {
    try {
      const achievementPromise = cId
        ? apiClient.get<Achievement[]>(`/api/goals/achievement?challengeId=${cId}`)
        : Promise.resolve([]);

      const inbodyPromise = cId
        ? apiClient.get<InBodyRecord[]>(`/api/inbody?challengeId=${cId}`)
        : apiClient.get<InBodyRecord[]>("/api/inbody");

      const [achievementData, inbodyData] = await Promise.all([
        achievementPromise,
        inbodyPromise,
      ]);
      setAchievements(achievementData);
      setInbodyRecords(inbodyData);
    } catch {
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const teams = await apiClient.get<Team[]>("/api/teams/me");
        if (teams.length > 0) {
          const cId = teams[0].challengeId;
          setChallengeId(cId);
          await fetchData(cId);
        } else {
          const pendingId = localStorage.getItem("pendingChallengeId");
          if (pendingId) {
            setChallengeId(pendingId);
            await fetchData(pendingId);
          } else {
            setLoadingData(false);
          }
        }
      } catch {
        const pendingId = localStorage.getItem("pendingChallengeId");
        if (pendingId) {
          setChallengeId(pendingId);
          await fetchData(pendingId);
        } else {
          setLoadingData(false);
        }
      }
    };
    init();
  }, [fetchData]);

  const handleModalSuccess = () => {
    if (challengeId) {
      fetchData(challengeId);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loadingData) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-gray-500 dark:text-gray-400">불러오는 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">내 프로필</h1>
          <Link
            href="/"
            className="text-sm text-gray-500 underline hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            홈으로
          </Link>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Goal Achievement Section */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">내 목표</h2>
          {achievements.length === 0 ? (
            <div className="rounded-xl border border-gray-200 p-6 text-center dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                설정된 목표가 없습니다.
              </p>
              <Link
                href="/onboarding"
                className="mt-2 inline-block text-sm font-medium underline hover:text-black dark:hover:text-white"
              >
                목표 설정하기
              </Link>
            </div>
          ) : (
            achievements.map((a) => {
              const rate = Math.min(Math.max(a.achievementRate, 0), 100);
              return (
                <div
                  key={a.goalTypeName}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{a.goalTypeName}</span>
                    <span className="text-sm font-bold text-black dark:text-white">
                      {rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      시작: {a.startValue} {a.unit}
                    </span>
                    <span>
                      현재: {a.currentValue} {a.unit}
                    </span>
                    <span>
                      목표: {a.targetValue} {a.unit}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-black transition-all dark:bg-white"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* InBody Records Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">인바디 기록</h2>
            {challengeId && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                인바디 기록 추가
              </button>
            )}
          </div>
          {inbodyRecords.length === 0 ? (
            <div className="rounded-xl border border-gray-200 p-6 text-center dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                인바디 기록이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {inbodyRecords.map((record) => (
                <div
                  key={record.id}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(record.recordDate)}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        체중
                      </div>
                      <div className="text-sm font-semibold">
                        {record.weight} kg
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        골격근량
                      </div>
                      <div className="text-sm font-semibold">
                        {record.skeletalMuscleMass} kg
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        체지방량
                      </div>
                      <div className="text-sm font-semibold">
                        {record.bodyFatMass != null
                          ? `${record.bodyFatMass} kg`
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        체지방률
                      </div>
                      <div className="text-sm font-semibold">
                        {record.bodyFatPercentage} %
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* InBody Modal */}
      {challengeId && (
        <InBodyModal
          challengeId={challengeId}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </main>
  );
}
