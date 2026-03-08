"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Team, UserWeeklyResult } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Button,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, TrendingDown, Award, RefreshCw } from "lucide-react";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
        3
      </span>
    );
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
      {rank}
    </span>
  );
}

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
      <div className="space-y-4 p-4">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">주간 결과</h1>
          {results.length > 0 && (
            <Badge variant="outline" className="ml-auto">
              {results.length}주 기록
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-4">
              <p className="mb-3 text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchResults}>
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                다시 시도
              </Button>
            </CardContent>
          </Card>
        )}

        {results.length === 0 && !error ? (
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center">
              <Award className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">아직 주간 결과가 없습니다</p>
              <p className="mt-1 text-sm text-muted-foreground">
                주간 마감이 완료되면 결과를 확인할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {results.map((result) => {
              const achievementPct = Math.min(Number(result.achievementRate), 100);
              return (
                <Card
                  key={result.weekNumber}
                  className={cn(
                    result.isBottomTeam && "border-red-200 dark:border-red-900/50"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {result.weekNumber}주차
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {result.isBottomTeam && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                            하위팀
                          </Badge>
                        )}
                        <RankBadge rank={result.teamRank} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 내 달성률 */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {achievementPct >= 50 ? (
                            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                          )}
                          내 달성률
                        </span>
                        <span className="text-xs font-semibold">{achievementPct.toFixed(1)}%</span>
                      </div>
                      <Progress value={achievementPct} className="h-2" />
                    </div>

                    {/* 팀 점수 & 순위 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-primary/5 p-3">
                        <p className="text-xs text-muted-foreground">팀 점수</p>
                        <p className="mt-1 text-lg font-bold text-primary">
                          {Number(result.teamScore).toFixed(1)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-primary/5 p-3">
                        <p className="text-xs text-muted-foreground">팀 순위</p>
                        <p className="mt-1 text-lg font-bold text-primary">
                          {result.teamRank}위
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
