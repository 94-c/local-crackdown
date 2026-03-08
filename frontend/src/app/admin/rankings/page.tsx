"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Challenge, WeeklyResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorAlert } from "@/components/ui/legacy/ErrorAlert";
import { EmptyState } from "@/components/ui/legacy/EmptyState";
import { Search, ChevronDown, ChevronUp, Trophy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function RankBadge({ rank }: { rank: number }) {
  const classes = cn(
    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
    rank === 1 && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    rank === 2 && "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    rank === 3 && "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    rank > 3 && "bg-muted text-muted-foreground"
  );
  return <div className={classes}>{rank}</div>;
}

export default function RankingsPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
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
        <Card>
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxWeeks = selectedChallenge ? Math.max(selectedChallenge.currentWeek, 1) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">순위표</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          주차별 팀 순위 및 개인 달성률을 확인합니다
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onRetry={fetchResults} onDismiss={() => setError("")} />
      )}

      {/* 필터 */}
      <Card>
        <CardContent className="p-5">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">챌린지</label>
              <Select value={selectedChallengeId} onValueChange={setSelectedChallengeId}>
                <SelectTrigger>
                  <SelectValue placeholder="챌린지 선택" />
                </SelectTrigger>
                <SelectContent>
                  {challenges.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">주차</label>
              <Select
                value={weekNumber.toString()}
                onValueChange={(v) => setWeekNumber(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxWeeks }, (_, i) => i + 1).map((w) => (
                    <SelectItem key={w} value={w.toString()}>
                      {w}주차
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchResults}
                disabled={fetching}
                className="w-full"
              >
                <Search className="mr-2 h-4 w-4" />
                {fetching ? "조회 중..." : "조회"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 순위 결과 */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result) => (
            <Card key={result.teamName}>
              <button
                type="button"
                onClick={() => toggleTeam(result.teamName)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <RankBadge rank={result.teamRank} />
                  <div>
                    <span className="font-semibold">{result.teamName}</span>
                    {result.isBottomTeam && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        하위팀
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {Number(result.teamScore).toFixed(1)}점
                    </span>
                  </div>
                  {expandedTeam === result.teamName ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedTeam === result.teamName && (
                <>
                  <Separator />
                  <div className="space-y-3 p-5 pt-4">
                    {result.members.map((member) => (
                      <div key={member.nickname} className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-sm text-muted-foreground">
                          {member.nickname}
                        </span>
                        <Progress
                          value={Math.min(Number(member.achievementRate), 100)}
                          className="flex-1"
                        />
                        <span className="w-14 text-right text-sm font-medium tabular-nums">
                          {Number(member.achievementRate).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
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
