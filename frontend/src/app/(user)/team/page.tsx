"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Team, TeamMission, MissionTemplate } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Progress,
  Button,
  Input,
  Label,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Users, Target, Plus, Trash2, TrendingUp, CheckCircle2 } from "lucide-react";

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [mission, setMission] = useState<TeamMission | null>(null);
  const [missionTemplates, setMissionTemplates] = useState<MissionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create mission form
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Progress update form
  const [progressValue, setProgressValue] = useState("");
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");

  // Delete mission
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [weekNumber, setWeekNumber] = useState(1);

  const fetchMission = useCallback(
    async (teamId: string, challengeId: string) => {
      try {
        const missions = await apiClient.get<TeamMission[]>(
          `/api/team-missions?teamId=${teamId}&challengeId=${challengeId}`
        );
        if (missions.length > 0) {
          // Use the latest (highest) week number
          const latestWeek = Math.max(...missions.map((m) => m.weekNumber));
          setWeekNumber(latestWeek);
          const currentMission = missions.find(
            (m) => m.weekNumber === latestWeek
          );
          if (currentMission) {
            setMission(currentMission);
          } else {
            setMission(null);
            const templates = await apiClient.get<MissionTemplate[]>("/api/mission-templates");
            setMissionTemplates(templates);
          }
        } else {
          setMission(null);
          const templates = await apiClient.get<MissionTemplate[]>("/api/mission-templates");
          setMissionTemplates(templates);
        }
      } catch {
        setMission(null);
        try {
          const templates = await apiClient.get<MissionTemplate[]>("/api/mission-templates");
          setMissionTemplates(templates);
        } catch {
          // templates fetch failed
        }
      }
    },
    []
  );

  useEffect(() => {
    const init = async () => {
      try {
        const teams = await apiClient.get<Team[]>("/api/teams/me");
        if (teams.length > 0) {
          setTeam(teams[0]);
          await fetchMission(teams[0].id, teams[0].challengeId);
        } else {
          setError("참여 중인 팀이 없습니다.");
        }
      } catch {
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchMission]);

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !selectedTemplateId || !targetValue) return;

    setCreateError("");
    setCreateLoading(true);
    try {
      const created = await apiClient.post<TeamMission>("/api/team-missions", {
        teamId: team.id,
        challengeId: team.challengeId,
        missionTemplateId: selectedTemplateId,
        weekNumber,
        targetValue: parseFloat(targetValue),
      });
      setMission(created);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "미션 생성에 실패했습니다."
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission || !progressValue) return;

    setProgressError("");
    setProgressLoading(true);
    try {
      const updated = await apiClient.put<TeamMission>(
        `/api/team-missions/${mission.id}/progress`,
        { currentValue: parseFloat(progressValue) }
      );
      setMission(updated);
      setProgressValue("");
      toast.success("진행 상태가 업데이트되었습니다!");
    } catch (err) {
      setProgressError(
        err instanceof Error ? err.message : "진행 업데이트에 실패했습니다."
      );
    } finally {
      setProgressLoading(false);
    }
  };

  const handleDeleteMission = async () => {
    if (!mission) return;
    if (!confirm("이 미션을 삭제하시겠습니까? 관련 인증 기록도 모두 삭제됩니다.")) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/api/team-missions/${mission.id}`);
      setMission(null);
      toast.success("미션이 삭제되었습니다.");
      // 미션 템플릿 다시 불러오기
      const templates = await apiClient.get<MissionTemplate[]>("/api/mission-templates");
      setMissionTemplates(templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "미션 삭제에 실패했습니다.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMissionStatusBadge = (status: string) => {
    if (status === "COMPLETED") return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">완료</Badge>;
    if (status === "IN_PROGRESS") return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">진행중</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const selectedTemplate = missionTemplates.find((t) => t.id === selectedTemplateId);

  const progressPercent =
    mission && mission.targetValue > 0
      ? Math.min(Math.round((mission.currentValue / mission.targetValue) * 100), 100)
      : 0;

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">팀 미션</h1>
          {mission && (
            <Badge variant="outline" className="ml-auto">
              {weekNumber}주차
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {!team && !error && (
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">참여 중인 팀이 없습니다</p>
              <p className="mt-1 text-sm text-muted-foreground">
                관리자가 팀을 배정하면 미션을 확인할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        )}

        {team && (
          <>
            {/* Team Info */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">내 팀</p>
                    <p className="font-bold">{team.name}</p>
                  </div>
                  <div className="ml-auto flex gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {team.member1.nickname}
                    </Badge>
                    {team.member2 && (
                      <Badge variant="secondary" className="text-xs">
                        {team.member2.nickname}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Week Indicator */}
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                {weekNumber}주차
              </Badge>
              <span className="text-sm text-muted-foreground">팀 미션 현황</span>
            </div>

            {mission ? (
              <>
                {/* Mission Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">
                          {mission.missionTemplateName}
                        </CardTitle>
                        <CardDescription className="mt-0.5">
                          목표: {mission.targetValue} {mission.unit}
                        </CardDescription>
                      </div>
                      {getMissionStatusBadge(mission.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={progressPercent} className="h-2.5" />
                    <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>현재 {mission.currentValue} {mission.unit}</span>
                      <span>{progressPercent}% 달성</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Update Form */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      진행 업데이트
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProgressUpdate} className="space-y-3">
                      {progressError && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2">
                          <p className="text-sm text-destructive">{progressError}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          required
                          value={progressValue}
                          onChange={(e) => setProgressValue(e.target.value)}
                          placeholder={`현재 값 (${mission.unit})`}
                          className="flex-1"
                        />
                        <Button
                          type="submit"
                          disabled={progressLoading || !progressValue}
                          className="shrink-0"
                        >
                          {progressLoading ? "..." : "업데이트"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Delete Mission */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteMission}
                  disabled={deleteLoading}
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteLoading ? "삭제 중..." : "미션 삭제"}
                </Button>

                {/* Verifications List */}
                {mission.verifications && mission.verifications.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-muted-foreground">인증 기록</h3>
                      <Badge variant="secondary" className="text-xs">
                        {mission.verifications.length}
                      </Badge>
                    </div>
                    {mission.verifications.map((v) => (
                      <Card
                        key={v.id}
                        className={cn(
                          !v.verified && "border-primary/20 bg-primary/5"
                        )}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{v.userNickname}</span>
                            <div className="flex items-center gap-2">
                              {v.verified ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs">
                                  인증됨
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 text-xs">
                                  대기중
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(v.createdAt)}
                              </span>
                            </div>
                          </div>
                          {v.memo && (
                            <p className="mt-2 text-sm text-muted-foreground">{v.memo}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Create Mission Form */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="h-5 w-5 text-primary" />
                    이번 주 팀 미션 입력
                  </CardTitle>
                  <CardDescription>
                    이번 주에 수행할 팀 미션을 선택하고 목표를 입력하세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateMission} className="space-y-4">
                    {createError && (
                      <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2">
                        <p className="text-sm text-destructive">{createError}</p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="mission-template">미션 선택</Label>
                      <Select
                        value={selectedTemplateId}
                        onValueChange={setSelectedTemplateId}
                        required
                      >
                        <SelectTrigger id="mission-template">
                          <SelectValue placeholder="미션을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {missionTemplates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                              {t.description ? ` — ${t.description}` : ""} ({t.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="target-value">
                        목표 값
                        {selectedTemplate ? ` (${selectedTemplate.unit})` : ""}
                      </Label>
                      <Input
                        id="target-value"
                        type="number"
                        step="0.1"
                        required
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        placeholder="예: 10"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={createLoading || !selectedTemplateId || !targetValue}
                      className="w-full"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      {createLoading ? "생성 중..." : "팀 미션 생성"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
