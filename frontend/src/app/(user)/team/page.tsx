"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Team, TeamMission, MissionTemplate } from "@/lib/types";
import { LoadingSkeleton, ErrorAlert, EmptyState, ProgressBar, useToast } from "@/components/ui";

export default function TeamPage() {
  const toast = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [mission, setMission] = useState<TeamMission | null>(null);
  const [missionTemplates, setMissionTemplates] = useState<MissionTemplate[]>(
    []
  );
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
            const templates =
              await apiClient.get<MissionTemplate[]>("/api/mission-templates");
            setMissionTemplates(templates);
          }
        } else {
          setMission(null);
          const templates =
            await apiClient.get<MissionTemplate[]>("/api/mission-templates");
          setMissionTemplates(templates);
        }
      } catch {
        setMission(null);
        try {
          const templates =
            await apiClient.get<MissionTemplate[]>("/api/mission-templates");
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
      const created = await apiClient.post<TeamMission>(
        "/api/team-missions",
        {
          teamId: team.id,
          challengeId: team.challengeId,
          missionTemplateId: selectedTemplateId,
          weekNumber,
          targetValue: parseFloat(targetValue),
        }
      );
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">팀 미션</h1>

      {error && (
        <ErrorAlert message={error} />
      )}

      {!team && !error && (
        <EmptyState
          title="참여 중인 팀이 없습니다"
          description="관리자가 팀을 배정하면 미션을 확인할 수 있습니다."
        />
      )}

      {team && (
        <>
          {/* Team Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              내 팀
            </h2>
            <p className="mt-1 text-lg font-bold">{team.name}</p>
            <div className="mt-2 flex gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>{team.member1.nickname}</span>
              {team.member2 && <span>{team.member2.nickname}</span>}
            </div>
          </div>

          {/* Week Indicator */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
              {weekNumber}주차
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              팀 미션 현황
            </span>
          </div>

          {mission ? (
            <>
              {/* Mission Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {mission.missionTemplateName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      목표: {mission.targetValue} {mission.unit}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      mission.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : mission.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {mission.status === "COMPLETED"
                      ? "완료"
                      : mission.status === "IN_PROGRESS"
                        ? "진행중"
                        : mission.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <ProgressBar
                    value={
                      mission.targetValue > 0
                        ? Math.min(
                            Math.round(
                              (mission.currentValue / mission.targetValue) * 100
                            ),
                            100
                          )
                        : 0
                    }
                    size="lg"
                    showLabel
                    className="mb-1"
                  />
                  <div className="mt-1 flex justify-between text-xs text-gray-400">
                    <span>
                      현재 {mission.currentValue} {mission.unit}
                    </span>
                    <span>
                      목표 {mission.targetValue} {mission.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Update Form */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  진행 업데이트
                </h3>
                <form onSubmit={handleProgressUpdate} className="mt-3">
                  {progressError && (
                    <div className="mb-3">
                      <ErrorAlert message={progressError} />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={progressValue}
                      onChange={(e) => setProgressValue(e.target.value)}
                      placeholder={`현재 값 (${mission.unit})`}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                    />
                    <button
                      type="submit"
                      disabled={progressLoading || !progressValue}
                      className="shrink-0 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                      {progressLoading ? "..." : "업데이트"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Verifications List */}
              {mission.verifications && mission.verifications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    인증 기록 ({mission.verifications.length})
                  </h3>
                  {mission.verifications.map((v) => (
                    <div
                      key={v.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {v.userNickname}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              v.verified
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {v.verified ? "인증됨" : "대기중"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(v.createdAt)}
                          </span>
                        </div>
                      </div>
                      {v.memo && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {v.memo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Create Mission Form */
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="font-semibold">이번 주 팀 미션 입력</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                이번 주에 수행할 팀 미션을 선택하고 목표를 입력하세요.
              </p>

              <form onSubmit={handleCreateMission} className="mt-4 space-y-4">
                {createError && (
                  <ErrorAlert message={createError} />
                )}

                <div>
                  <label
                    htmlFor="mission-template"
                    className="block text-sm font-medium"
                  >
                    미션 선택
                  </label>
                  <select
                    id="mission-template"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                  >
                    <option value="">미션을 선택하세요</option>
                    {missionTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                        {t.description ? ` — ${t.description}` : ""} ({t.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="target-value"
                    className="block text-sm font-medium"
                  >
                    목표 값
                    {selectedTemplateId &&
                      (() => {
                        const selected = missionTemplates.find(
                          (t) => t.id === selectedTemplateId
                        );
                        return selected ? ` (${selected.unit})` : "";
                      })()}
                  </label>
                  <input
                    id="target-value"
                    type="number"
                    step="0.1"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="예: 10"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    createLoading || !selectedTemplateId || !targetValue
                  }
                  className="w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  {createLoading ? "생성 중..." : "팀 미션 생성"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
