"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type {
  Challenge,
  Team,
  PenaltyMission,
  FinalScoreResult,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorAlert } from "@/components/ui/legacy/ErrorAlert";
import { EmptyState } from "@/components/ui/legacy/EmptyState";
import RouletteWheel from "@/components/RouletteWheel";
import {
  Dices,
  Plus,
  X,
  Calculator,
  CheckCircle2,
  XCircle,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PENALTY_MISSIONS = [
  "공원 5바퀴 달리기",
  "버피 100개",
  "플랭크 10분",
  "줄넘기 500회",
  "스쿼트 200개",
  "팔굽혀펴기 100개",
  "계단 오르기 20층",
  "런지 200개",
];

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  ASSIGNED: { label: "배정됨", variant: "secondary" },
  COMPLETED: { label: "완료", variant: "default" },
  FAILED: { label: "실패", variant: "destructive" },
};

function RankBadge({ rank }: { rank: number }) {
  const classes = cn(
    "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
    rank === 1 && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    rank === 2 && "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    rank === 3 && "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    rank > 3 && "bg-muted text-muted-foreground"
  );
  return <div className={classes}>{rank}</div>;
}

export default function MissionsPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const [penalties, setPenalties] = useState<PenaltyMission[]>([]);
  const [loadingPenalties, setLoadingPenalties] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formTeamId, setFormTeamId] = useState("");
  const [formMissionName, setFormMissionName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [showRoulette, setShowRoulette] = useState(false);
  const [rouletteSpinning, setRouletteSpinning] = useState(false);

  const [finalScores, setFinalScores] = useState<FinalScoreResult[]>([]);
  const [loadingFinalScores, setLoadingFinalScores] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const data = await apiClient.get<Challenge[]>("/api/admin/challenges");
        setChallenges(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "챌린지 목록을 불러올 수 없습니다"
        );
      } finally {
        setLoadingChallenges(false);
      }
    };
    fetchChallenges();
  }, []);

  const fetchTeams = useCallback(async (challengeId: string) => {
    if (!challengeId) {
      setTeams([]);
      return;
    }
    try {
      const data = await apiClient.get<Team[]>(
        `/api/admin/teams?challengeId=${challengeId}`
      );
      setTeams(data);
    } catch {
      setTeams([]);
    }
  }, []);

  const fetchPenalties = useCallback(
    async (challengeId: string, weekNumber: number) => {
      if (!challengeId) {
        setPenalties([]);
        return;
      }
      try {
        setLoadingPenalties(true);
        const data = await apiClient.get<PenaltyMission[]>(
          `/api/admin/penalties?challengeId=${challengeId}&weekNumber=${weekNumber}`
        );
        setPenalties(data);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "벌칙 목록을 불러올 수 없습니다"
        );
      } finally {
        setLoadingPenalties(false);
      }
    },
    []
  );

  const fetchFinalScores = useCallback(async (challengeId: string) => {
    if (!challengeId) {
      setFinalScores([]);
      return;
    }
    try {
      setLoadingFinalScores(true);
      const data = await apiClient.get<FinalScoreResult[]>(
        `/api/admin/final-scores?challengeId=${challengeId}`
      );
      setFinalScores(data);
    } catch {
      setFinalScores([]);
    } finally {
      setLoadingFinalScores(false);
    }
  }, []);

  const handleChallengeChange = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    setShowForm(false);
    setShowRoulette(false);
    setError("");
    fetchTeams(challengeId);
    fetchPenalties(challengeId, selectedWeek);
    fetchFinalScores(challengeId);
  };

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
    if (selectedChallengeId) {
      fetchPenalties(selectedChallengeId, week);
    }
  };

  const handleSpinRoulette = () => {
    setRouletteSpinning(true);
  };

  const handleRouletteResult = useCallback(
    (item: string) => {
      setRouletteSpinning(false);
      setFormMissionName(item);
      toast.success(`"${item}" 이(가) 선택되었습니다!`);
      setTimeout(() => {
        setShowForm(true);
        setShowRoulette(false);
      }, 800);
    },
    []
  );

  const handleAssignPenalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !formTeamId) return;
    setFormLoading(true);
    setError("");

    try {
      await apiClient.post("/api/admin/penalties", {
        challengeId: selectedChallengeId,
        teamId: formTeamId,
        weekNumber: selectedWeek,
        missionName: formMissionName,
        description: formDescription || null,
      });
      toast.success("벌칙 미션이 배정되었습니다.");
      setFormMissionName("");
      setFormDescription("");
      setFormTeamId("");
      setShowForm(false);
      fetchPenalties(selectedChallengeId, selectedWeek);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "벌칙 배정에 실패했습니다"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusUpdate = async (penaltyId: string, status: string) => {
    try {
      setError("");
      await apiClient.put(`/api/admin/penalties/${penaltyId}/status`, { status });
      toast.success("상태가 변경되었습니다.");
      fetchPenalties(selectedChallengeId, selectedWeek);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "상태 변경에 실패했습니다"
      );
    }
  };

  const handleApproveVerification = async (verificationId: string) => {
    try {
      setError("");
      await apiClient.put(
        `/api/admin/penalty-verifications/${verificationId}/approve`,
        {}
      );
      toast.success("인증이 승인되었습니다.");
      fetchPenalties(selectedChallengeId, selectedWeek);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "승인에 실패했습니다"
      );
    }
  };

  const handleCalculateFinalScores = async () => {
    if (!selectedChallengeId) return;
    if (!confirm("최종 순위를 계산하시겠습니까? 기존 순위가 덮어씌워집니다."))
      return;

    setCalculating(true);
    setError("");

    try {
      const data = await apiClient.post<FinalScoreResult[]>(
        `/api/admin/final-scores/calculate?challengeId=${selectedChallengeId}`,
        {}
      );
      setFinalScores(data);
      toast.success("최종 순위가 계산되었습니다.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "최종 순위 계산에 실패했습니다"
      );
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">벌칙 미션 / 최종 순위</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          하위팀에 벌칙 미션을 배정하고 최종 순위를 산정합니다
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}

      {/* 챌린지 선택 */}
      <div className="space-y-2">
        <Label htmlFor="challengeSelect">챌린지 선택</Label>
        <Select
          value={selectedChallengeId}
          onValueChange={handleChallengeChange}
          disabled={loadingChallenges}
        >
          <SelectTrigger id="challengeSelect">
            <SelectValue
              placeholder={
                loadingChallenges ? "챌린지 로딩 중..." : "챌린지를 선택하세요"
              }
            />
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

      {selectedChallengeId && (
        <>
          {/* 주차 선택 */}
          <div className="space-y-2">
            <Label>주차 선택</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((week) => (
                <Button
                  key={week}
                  size="sm"
                  variant={selectedWeek === week ? "default" : "outline"}
                  onClick={() => handleWeekChange(week)}
                >
                  {week}주차
                </Button>
              ))}
            </div>
          </div>

          {/* 벌칙 배정 헤더 */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">{selectedWeek}주차 벌칙 미션</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRoulette(!showRoulette);
                  if (showForm) setShowForm(false);
                }}
              >
                <Dices className="mr-2 h-4 w-4" />
                {showRoulette ? "룰렛 닫기" : "룰렛 돌리기"}
              </Button>
              <Button
                size="sm"
                variant={showForm ? "outline" : "default"}
                onClick={() => {
                  setShowForm(!showForm);
                  if (showRoulette) setShowRoulette(false);
                }}
              >
                {showForm ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    취소
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    벌칙 배정
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 룰렛 섹션 */}
          {showRoulette && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-center text-base font-semibold">
                  벌칙 미션 룰렛
                </h3>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  룰렛을 돌려 벌칙 미션을 랜덤으로 선택하세요
                </p>
                <RouletteWheel
                  items={PENALTY_MISSIONS}
                  onResult={handleRouletteResult}
                  spinning={rouletteSpinning}
                  onSpin={handleSpinRoulette}
                />
              </CardContent>
            </Card>
          )}

          {/* 배정 폼 */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">벌칙 미션 배정</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAssignPenalty} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="penaltyTeam">팀 선택 *</Label>
                    <Select
                      value={formTeamId}
                      onValueChange={setFormTeamId}
                      required
                    >
                      <SelectTrigger id="penaltyTeam">
                        <SelectValue placeholder="팀을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="missionName">미션명 *</Label>
                    <Input
                      id="missionName"
                      type="text"
                      required
                      value={formMissionName}
                      onChange={(e) => setFormMissionName(e.target.value)}
                      placeholder="예: 공원 5바퀴 뛰기"
                    />
                    {formMissionName && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        선택된 미션: {formMissionName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="missionDesc">설명 (선택)</Label>
                    <Textarea
                      id="missionDesc"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={3}
                      placeholder="벌칙 미션에 대한 상세 설명"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={formLoading || !formTeamId}
                    >
                      {formLoading ? "배정 중..." : "벌칙 배정"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setFormMissionName("");
                        setFormDescription("");
                        setFormTeamId("");
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* 벌칙 목록 */}
          {loadingPenalties ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="mb-2 h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : penalties.length === 0 ? (
            <EmptyState
              title={`${selectedWeek}주차 벌칙 미션이 없습니다`}
              description="벌칙 배정 버튼을 눌러 하위팀에 벌칙 미션을 배정하세요."
            />
          ) : (
            <div className="space-y-4">
              {penalties.map((penalty) => {
                const statusCfg = STATUS_CONFIG[penalty.status];
                return (
                  <Card key={penalty.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="truncate text-base font-semibold">
                              {penalty.teamName}
                            </h4>
                            <Badge variant={statusCfg?.variant ?? "outline"}>
                              {statusCfg?.label ?? penalty.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm font-medium">
                            {penalty.missionName}
                          </p>
                          {penalty.description && (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {penalty.description}
                            </p>
                          )}
                        </div>
                        {penalty.status === "ASSIGNED" && (
                          <div className="flex shrink-0 gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(penalty.id, "COMPLETED")
                              }
                              className="text-green-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200"
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              완료
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(penalty.id, "FAILED")
                              }
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              실패
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* 인증 내역 */}
                      {penalty.verifications.length > 0 && (
                        <>
                          <Separator className="my-3" />
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            인증 내역
                          </p>
                          <div className="space-y-2">
                            {penalty.verifications.map((v) => (
                              <div
                                key={v.id}
                                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">
                                    {v.userNickname}
                                  </p>
                                  {v.memo && (
                                    <p className="text-xs text-muted-foreground">
                                      {v.memo}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(v.createdAt).toLocaleDateString("ko-KR")}
                                  </p>
                                </div>
                                <div className="ml-2 shrink-0">
                                  {v.approved ? (
                                    <Badge variant="default" className="text-xs">
                                      <CheckCheck className="mr-1 h-3 w-3" />
                                      승인됨
                                    </Badge>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleApproveVerification(v.id)
                                      }
                                    >
                                      승인
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* 최종 순위 섹션 */}
          <Separator className="my-2" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">최종 순위</h2>
                <p className="text-sm text-muted-foreground">4주 합산 점수 기반 순위</p>
              </div>
              <Button
                onClick={handleCalculateFinalScores}
                disabled={calculating}
                variant="outline"
              >
                <Calculator className="mr-2 h-4 w-4" />
                {calculating ? "계산 중..." : "최종 순위 계산"}
              </Button>
            </div>

            {loadingFinalScores ? (
              <Card>
                <CardContent className="space-y-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </CardContent>
              </Card>
            ) : finalScores.length === 0 ? (
              <EmptyState
                title="최종 순위가 아직 없습니다"
                description="최종 순위 계산 버튼을 눌러 4주 합산 순위를 산정하세요."
              />
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">순위</TableHead>
                        <TableHead>팀명</TableHead>
                        <TableHead className="text-right">총점</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {finalScores.map((score) => (
                        <TableRow key={`${score.teamName}-${score.finalRank}`}>
                          <TableCell>
                            <RankBadge rank={score.finalRank} />
                          </TableCell>
                          <TableCell className="font-medium">
                            {score.teamName}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {score.totalScore.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
