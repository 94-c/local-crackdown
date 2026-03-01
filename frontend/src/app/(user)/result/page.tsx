"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Team, UserWeeklyResult } from "@/lib/types";
import { LoadingSkeleton, ErrorAlert, EmptyState, ProgressBar } from "@/components/ui";

export default function ResultPage() {
  const [results, setResults] = useState<UserWeeklyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const teams = await apiClient.get<Team[]>("/api/teams/me");
      if (teams.length === 0) {
        setLoading(false);
        return;
      }

      const challengeId = teams[0].challengeId;
      const data = await apiClient.get<UserWeeklyResult[]>(
        `/api/weekly-results/me?challengeId=${challengeId}`
      );
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "결과를 불러올 수 없습니다"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <LoadingSkeleton variant="card" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">주간 결과</h1>

      {error && (
        <ErrorAlert message={error} onRetry={fetchResults} />
      )}

      {results.length === 0 ? (
        <EmptyState
          title="아직 주간 결과가 없습니다"
          description="주간 마감이 완료되면 결과를 확인할 수 있습니다."
        />
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.weekNumber}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{result.weekNumber}주차</h3>
                {result.isBottomTeam && (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    하위팀
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {/* 내 달성률 */}
                <div>
                  <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                    내 달성률
                  </p>
                  <ProgressBar
                    value={Math.min(Number(result.achievementRate), 100)}
                    showLabel
                  />
                </div>

                {/* 팀 점수 & 순위 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      팀 점수
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {Number(result.teamScore).toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      팀 순위
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {result.teamRank}위
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
