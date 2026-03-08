"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Team, Achievement, InBodyRecord } from "@/lib/types";
import Link from "next/link";
import InBodyModal from "@/components/InBodyModal";
import InBodyChart from "@/components/InBodyChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Progress,
  Button,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  Scale,
  Target,
  Percent,
  Ruler,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function ProfilePage() {
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [inbodyRecords, setInbodyRecords] = useState<InBodyRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InBodyRecord | null>(null);

  const fetchData = useCallback(async (cId: string) => {
    setError("");
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

  const handleDeleteInbody = async (recordId: string) => {
    if (!confirm("이 인바디 기록을 삭제하시겠습니까?")) return;
    try {
      await apiClient.delete(`/api/inbody/${recordId}`);
      setInbodyRecords((prev) => prev.filter((r) => r.id !== recordId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
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

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Sticky header skeleton */}
        <div className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
        <div className="mx-auto max-w-lg space-y-4 p-4">
          {/* Achievement cards skeleton */}
          <Skeleton className="h-5 w-20" />
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
          {/* InBody cards skeleton */}
          <Skeleton className="h-5 w-24 mt-6" />
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-28" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-1 text-center">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/home">
              <Button variant="ghost" size="icon" className="h-8 w-8 -ml-1">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold">내 프로필</h1>
          </div>
          <Link href="/home">
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
              홈으로
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Error alert */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
              {challengeId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchData(challengeId)}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  재시도
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Goal Achievement Section ────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">내 목표</h2>
            <Badge variant="secondary" className="ml-auto text-xs">
              {achievements.length}개
            </Badge>
          </div>

          {achievements.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <Target className="h-10 w-10 text-muted-foreground/40" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">설정된 목표가 없습니다</p>
                  <p className="text-xs text-muted-foreground">
                    온보딩에서 목표를 설정해 보세요
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { window.location.href = "/onboarding"; }}
                >
                  목표 설정하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {achievements.map((a) => {
                const rate = Math.min(Math.max(a.achievementRate, 0), 100);
                const isComplete = rate >= 100;

                return (
                  <Card
                    key={a.goalTypeName}
                    className={cn(
                      "transition-shadow hover:shadow-sm",
                      isComplete && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">
                          {a.goalTypeName}
                        </CardTitle>
                        <Badge
                          variant={isComplete ? "default" : "secondary"}
                          className="text-xs font-bold"
                        >
                          {rate.toFixed(1)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                      <Progress
                        value={rate}
                        className={cn(
                          "h-2",
                          isComplete && "[&>div]:bg-primary"
                        )}
                      />
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div className="rounded-md bg-muted/50 px-2 py-1.5">
                          <p className="text-xs text-muted-foreground">시작</p>
                          <p className="text-xs font-semibold">
                            {a.startValue}{" "}
                            <span className="font-normal text-muted-foreground">
                              {a.unit}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-md bg-primary/10 px-2 py-1.5">
                          <p className="text-xs text-muted-foreground">현재</p>
                          <p className="text-xs font-bold text-primary">
                            {a.currentValue}{" "}
                            <span className="font-normal">{a.unit}</span>
                          </p>
                        </div>
                        <div className="rounded-md bg-muted/50 px-2 py-1.5">
                          <p className="text-xs text-muted-foreground">목표</p>
                          <p className="text-xs font-semibold">
                            {a.targetValue}{" "}
                            <span className="font-normal text-muted-foreground">
                              {a.unit}
                            </span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ── InBody Records Section ──────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">인바디 기록</h2>
            <Badge variant="secondary" className="ml-auto text-xs">
              {inbodyRecords.length}건
            </Badge>
            {challengeId && (
              <Button
                size="sm"
                onClick={() => { setEditingRecord(null); setModalOpen(true); }}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                기록 추가
              </Button>
            )}
          </div>

          {/* Chart card */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                체성분 변화 추이
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <InBodyChart records={inbodyRecords} />
            </CardContent>
          </Card>

          {/* Records list */}
          {inbodyRecords.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <Scale className="h-10 w-10 text-muted-foreground/40" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">인바디 기록이 없습니다</p>
                  <p className="text-xs text-muted-foreground">
                    인바디 기록 추가 버튼을 눌러 첫 기록을 등록해보세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {inbodyRecords.map((record) => (
                <Card
                  key={record.id}
                  className="transition-shadow hover:shadow-sm"
                >
                  <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs font-medium">
                        {formatDate(record.recordDate)}
                      </CardDescription>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => { setEditingRecord(record); setModalOpen(true); }}
                          aria-label="수정"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteInbody(record.id)}
                          aria-label="삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {/* Weight */}
                      <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 px-1 py-2">
                        <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">체중</p>
                        <p className="text-sm font-semibold leading-none">
                          {record.weight}
                          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                            kg
                          </span>
                        </p>
                      </div>
                      {/* Skeletal muscle mass */}
                      <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 px-1 py-2">
                        <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">골격근</p>
                        <p className="text-sm font-semibold leading-none">
                          {record.skeletalMuscleMass}
                          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                            kg
                          </span>
                        </p>
                      </div>
                      {/* Body fat mass */}
                      <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 px-1 py-2">
                        <Target className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">체지방</p>
                        <p className="text-sm font-semibold leading-none">
                          {record.bodyFatMass != null ? (
                            <>
                              {record.bodyFatMass}
                              <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                                kg
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </p>
                      </div>
                      {/* Body fat percentage */}
                      <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 px-1 py-2">
                        <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">체지방률</p>
                        <p className="text-sm font-semibold leading-none">
                          {record.bodyFatPercentage}
                          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                            %
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* InBody Modal — unchanged */}
      {challengeId && (
        <InBodyModal
          challengeId={challengeId}
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditingRecord(null); }}
          onSuccess={handleModalSuccess}
          editRecord={editingRecord ?? undefined}
        />
      )}
    </div>
  );
}
