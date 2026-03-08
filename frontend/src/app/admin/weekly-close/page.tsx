"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { Challenge, WeeklyResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CalendarCheck, Trophy, AlertTriangle } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "진행중",
  PREPARING: "준비중",
  COMPLETED: "완료",
};

export default function WeeklyClosePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
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
        <Card>
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">주간 마감</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          챌린지 주간 성적을 마감하고 순위를 집계합니다
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onRetry={fetchChallenges} onDismiss={() => setError("")} />
      )}

      {/* 챌린지 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">마감할 챌린지 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedChallengeId}
            onValueChange={setSelectedChallengeId}
          >
            <SelectTrigger>
              <SelectValue placeholder="챌린지를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {challenges.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title} ({STATUS_LABEL[c.status] ?? c.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedChallenge && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">현재 주차</p>
                  <p className="mt-1 text-2xl font-bold">
                    {selectedChallenge.currentWeek}주차
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">기간</p>
                  <p className="mt-1 font-medium">
                    {selectedChallenge.startDate} ~ {selectedChallenge.endDate}
                  </p>
                </div>
              </div>

              {selectedChallenge.currentWeek >= 1 && (
                <Button
                  onClick={handleCloseWeek}
                  disabled={closing}
                  className="w-full"
                >
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  {closing
                    ? "마감 처리 중..."
                    : `${selectedChallenge.currentWeek}주차 마감하기`}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 결과 */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">마감 결과</h2>
          {results.map((result) => (
            <Card key={result.teamName}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold">
                      {result.teamRank}
                    </div>
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
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {Number(result.teamScore).toFixed(1)}점
                    </span>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-1.5">
                  {result.members.map((member) => (
                    <div
                      key={member.nickname}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{member.nickname}</span>
                      <span className="font-medium">
                        {Number(member.achievementRate).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
