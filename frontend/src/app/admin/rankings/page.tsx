"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Challenge, WeeklyResult } from "@/lib/types";
import { LoadingSkeleton, ErrorAlert, EmptyState } from "@/components/ui";

export default function RankingsPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [weekNumber, setWeekNumber] = useState(1);
  const [results, setResults] = useState<WeeklyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    try {
      const data = await apiClient.get<Challenge[]>("/api/admin/challenges");
      setChallenges(data);
      if (data.length > 0) {
        setSelectedChallengeId(data[0].id);
        setSelectedChallenge(data[0]);
        setWeekNumber(Math.max(1, data[0].currentWeek - 1));
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
    if (found) {
      setWeekNumber(Math.max(1, found.currentWeek - 1));
    }
    setResults([]);
    setError("");
  }, [selectedChallengeId, challenges]);

  const fetchResults = async () => {
    if (!selectedChallengeId) return;

    setFetching(true);
    setError("");

    try {
      const data = await apiClient.get<WeeklyResult[]>(
        `/api/admin/weekly-results?challengeId=${selectedChallengeId}&weekNumber=${weekNumber}`
      );
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "순위 조회에 실패했습니다"
      );
      setResults([]);
    } finally {
      setFetching(false);
    }
  };

  const toggleTeam = (teamName: string) => {
    setExpandedTeam(expandedTeam === teamName ? null : teamName);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">순위표</h1>
        <LoadingSkeleton variant="table" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">순위표</h1>

      {error && (
        <ErrorAlert message={error} onRetry={fetchResults} onDismiss={() => setError("")} />
      )}

      {/* 필터 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label
              htmlFor="challenge-select"
              className="block text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              챌린지
            </label>
            <select
              id="challenge-select"
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="week-select"
              className="block text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              주차
            </label>
            <select
              id="week-select"
              value={weekNumber}
              onChange={(e) => setWeekNumber(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
            >
              {selectedChallenge &&
                Array.from(
                  { length: Math.max(selectedChallenge.currentWeek, 1) },
                  (_, i) => i + 1
                ).map((w) => (
                  <option key={w} value={w}>
                    {w}주차
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchResults}
              disabled={fetching}
              className="w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {fetching ? "조회 중..." : "조회"}
            </button>
          </div>
        </div>
      </div>

      {/* 순위 테이블 */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.teamName}
              className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            >
              <button
                type="button"
                onClick={() => toggleTeam(result.teamName)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      result.teamRank === 1
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : result.teamRank === 2
                          ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          : result.teamRank === 3
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {result.teamRank}
                  </span>
                  <div>
                    <span className="font-semibold">{result.teamName}</span>
                    {result.isBottomTeam && (
                      <span className="ml-2 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        하위팀
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">
                    {Number(result.teamScore).toFixed(1)}점
                  </span>
                  <span className="text-gray-400">
                    {expandedTeam === result.teamName ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedTeam === result.teamName && (
                <div className="border-t border-gray-100 px-5 pb-4 pt-3 dark:border-gray-800">
                  <div className="space-y-2">
                    {result.members.map((member) => (
                      <div
                        key={member.nickname}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {member.nickname}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div
                              className="h-full rounded-full bg-black transition-all dark:bg-white"
                              style={{
                                width: `${Math.min(Number(member.achievementRate), 100)}%`,
                              }}
                            />
                          </div>
                          <span className="w-14 text-right text-sm font-medium">
                            {Number(member.achievementRate).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !fetching && !error && (
        <EmptyState
          title="순위 데이터가 없습니다"
          description="챌린지와 주차를 선택한 후 조회 버튼을 눌러주세요."
        />
      )}
    </div>
  );
}
