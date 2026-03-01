"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Challenge, WeeklyResult } from "@/lib/types";
import { LoadingSkeleton, ErrorAlert, EmptyState, useToast } from "@/components/ui";

export default function WeeklyClosePage() {
  const toast = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [results, setResults] = useState<WeeklyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");

  const fetchChallenges = useCallback(async () => {
    try {
      const data = await apiClient.get<Challenge[]>("/api/admin/challenges");
      setChallenges(data);
      if (data.length > 0) {
        setSelectedChallengeId(data[0].id);
        setSelectedChallenge(data[0]);
      }
    } catch {
      setError("챌린지 목록을 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    const found = challenges.find((c) => c.id === selectedChallengeId);
    setSelectedChallenge(found || null);
    setResults([]);
    setError("");
  }, [selectedChallengeId, challenges]);

  const handleCloseWeek = async () => {
    if (!selectedChallenge) return;

    const weekNumber = selectedChallenge.currentWeek;
    if (weekNumber < 1) {
      setError("현재 주차가 설정되지 않았습니다");
      return;
    }

    if (
      !confirm(
        `${selectedChallenge.title}의 ${weekNumber}주차를 마감하시겠습니까?`
      )
    )
      return;

    setClosing(true);
    setError("");

    try {
      const data = await apiClient.post<WeeklyResult[]>(
        "/api/admin/weekly-close",
        {
          challengeId: selectedChallenge.id,
          weekNumber,
        }
      );
      setResults(data);
      toast.success(`${weekNumber}주차 마감이 완료되었습니다.`);
      // 챌린지 목록 새로고침 (currentWeek 업데이트 반영)
      fetchChallenges();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "주간 마감에 실패했습니다"
      );
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">주간 마감</h1>
        <LoadingSkeleton variant="list" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">주간 마감</h1>

      {error && (
        <ErrorAlert message={error} onRetry={fetchChallenges} onDismiss={() => setError("")} />
      )}

      {/* 챌린지 선택 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <label
          htmlFor="challenge-select"
          className="block text-sm font-medium text-gray-500 dark:text-gray-400"
        >
          챌린지 선택
        </label>
        <select
          id="challenge-select"
          value={selectedChallengeId}
          onChange={(e) => setSelectedChallengeId(e.target.value)}
          className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
        >
          {challenges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.status === "ACTIVE" ? "진행중" : c.status === "PREPARING" ? "준비중" : "완료"})
            </option>
          ))}
        </select>

        {selectedChallenge && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                현재 주차
              </span>
              <span className="text-lg font-bold">
                {selectedChallenge.currentWeek}주차
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                기간
              </span>
              <span className="text-sm">
                {selectedChallenge.startDate} ~ {selectedChallenge.endDate}
              </span>
            </div>
          </div>
        )}

        {selectedChallenge && selectedChallenge.currentWeek >= 1 && (
          <button
            onClick={handleCloseWeek}
            disabled={closing}
            className="mt-4 w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {closing
              ? "마감 처리 중..."
              : `${selectedChallenge.currentWeek}주차 마감하기`}
          </button>
        )}
      </div>

      {/* 결과 테이블 */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">마감 결과</h2>
          {results.map((result) => (
            <div
              key={result.teamName}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold dark:bg-gray-800">
                    {result.teamRank}
                  </span>
                  <span className="font-semibold">{result.teamName}</span>
                  {result.isBottomTeam && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      하위팀
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold">
                  {Number(result.teamScore).toFixed(1)}점
                </span>
              </div>
              <div className="mt-3 space-y-1">
                {result.members.map((member) => (
                  <div
                    key={member.nickname}
                    className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span>{member.nickname}</span>
                    <span>{Number(member.achievementRate).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
