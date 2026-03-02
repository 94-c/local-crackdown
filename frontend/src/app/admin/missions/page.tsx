"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type {
  Challenge,
  Team,
  PenaltyMission,
  FinalScoreResult,
} from "@/lib/types";
import { LoadingSkeleton, ErrorAlert, EmptyState, useToast } from "@/components/ui";
import RouletteWheel from "@/components/RouletteWheel";

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

export default function MissionsPage() {
  const toast = useToast();

  // Challenge selection
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  // Teams
  const [teams, setTeams] = useState<Team[]>([]);

  // Week
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Penalty missions
  const [penalties, setPenalties] = useState<PenaltyMission[]>([]);
  const [loadingPenalties, setLoadingPenalties] = useState(false);

  // Assignment form
  const [showForm, setShowForm] = useState(false);
  const [formTeamId, setFormTeamId] = useState("");
  const [formMissionName, setFormMissionName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Roulette
  const [showRoulette, setShowRoulette] = useState(false);
  const [rouletteSpinning, setRouletteSpinning] = useState(false);

  // Final scores
  const [finalScores, setFinalScores] = useState<FinalScoreResult[]>([]);
  const [loadingFinalScores, setLoadingFinalScores] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // General
  const [error, setError] = useState("");

  // Fetch challenges on mount
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

  // Fetch teams when challenge changes
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
      // Teams might not load if challenge has none
      setTeams([]);
    }
  }, []);

  // Fetch penalties
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

  // Fetch final scores
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

  // On challenge change
  const handleChallengeChange = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    setShowForm(false);
    setShowRoulette(false);
    setError("");
    fetchTeams(challengeId);
    fetchPenalties(challengeId, selectedWeek);
    fetchFinalScores(challengeId);
  };

  // On week change
  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
    if (selectedChallengeId) {
      fetchPenalties(selectedChallengeId, week);
    }
  };

  // Roulette handlers
  const handleSpinRoulette = () => {
    setRouletteSpinning(true);
  };

  const handleRouletteResult = useCallback((item: string) => {
    setRouletteSpinning(false);
    setFormMissionName(item);
    toast.success(`"${item}" 이(가) 선택되었습니다!`);
    // Auto-open assignment form after a brief delay
    setTimeout(() => {
      setShowForm(true);
      setShowRoulette(false);
    }, 800);
  }, [toast]);

  // Assign penalty
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

  // Update status
  const handleStatusUpdate = async (
    penaltyId: string,
    status: string
  ) => {
    try {
      setError("");
      await apiClient.put(`/api/admin/penalties/${penaltyId}/status`, {
        status,
      });
      toast.success(`상태가 변경되었습니다.`);
      fetchPenalties(selectedChallengeId, selectedWeek);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "상태 변경에 실패했습니다"
      );
    }
  };

  // Approve verification
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

  // Calculate final scores
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

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ASSIGNED:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      COMPLETED:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      FAILED:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    const labels: Record<string, string> = {
      ASSIGNED: "배정됨",
      COMPLETED: "완료",
      FAILED: "실패",
    };
    return (
      <span
        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        벌칙 미션 / 최종 순위
      </h1>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}

      {/* Challenge Selector */}
      <div>
        <label
          htmlFor="challengeSelect"
          className="block text-sm font-medium"
        >
          챌린지 선택
        </label>
        <select
          id="challengeSelect"
          value={selectedChallengeId}
          onChange={(e) => handleChallengeChange(e.target.value)}
          disabled={loadingChallenges}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
        >
          <option value="">
            {loadingChallenges
              ? "챌린지 로딩 중..."
              : "챌린지를 선택하세요"}
          </option>
          {challenges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {selectedChallengeId && (
        <>
          {/* Week Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">주차 선택</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((week) => (
                <button
                  key={week}
                  onClick={() => handleWeekChange(week)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selectedWeek === week
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  {week}주차
                </button>
              ))}
            </div>
          </div>

          {/* Assign Penalty Section */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {selectedWeek}주차 벌칙 미션
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRoulette(!showRoulette);
                  if (showForm) setShowForm(false);
                }}
                className="rounded-lg border-2 border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
              >
                {showRoulette ? "룰렛 닫기" : "룰렛 돌리기"}
              </button>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showRoulette) setShowRoulette(false);
                }}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {showForm ? "취소" : "벌칙 배정"}
              </button>
            </div>
          </div>

          {/* Roulette Section */}
          {showRoulette && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-center text-base font-semibold">
                벌칙 미션 룰렛
              </h3>
              <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
                룰렛을 돌려 벌칙 미션을 랜덤으로 선택하세요
              </p>
              <RouletteWheel
                items={PENALTY_MISSIONS}
                onResult={handleRouletteResult}
                spinning={rouletteSpinning}
                onSpin={handleSpinRoulette}
              />
            </div>
          )}

          {/* Assignment Form */}
          {showForm && (
            <form
              onSubmit={handleAssignPenalty}
              className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <h3 className="text-base font-semibold">벌칙 미션 배정</h3>

              <div>
                <label
                  htmlFor="penaltyTeam"
                  className="block text-sm font-medium"
                >
                  팀 선택
                </label>
                <select
                  id="penaltyTeam"
                  required
                  value={formTeamId}
                  onChange={(e) => setFormTeamId(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                >
                  <option value="">팀을 선택하세요</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="missionName"
                  className="block text-sm font-medium"
                >
                  미션명
                </label>
                <input
                  id="missionName"
                  type="text"
                  required
                  value={formMissionName}
                  onChange={(e) => setFormMissionName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                  placeholder="예: 공원 5바퀴 뛰기"
                />
                {formMissionName && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    선택된 미션: {formMissionName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="missionDesc"
                  className="block text-sm font-medium"
                >
                  설명 (선택)
                </label>
                <textarea
                  id="missionDesc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                  placeholder="벌칙 미션에 대한 상세 설명"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:w-auto"
              >
                {formLoading ? "배정 중..." : "벌칙 배정"}
              </button>
            </form>
          )}

          {/* Penalty List */}
          {loadingPenalties ? (
            <LoadingSkeleton variant="card" count={2} />
          ) : penalties.length === 0 ? (
            <EmptyState
              title={`${selectedWeek}주차 벌칙 미션이 없습니다`}
              description="벌칙 배정 버튼을 눌러 하위팀에 벌칙 미션을 배정하세요."
            />
          ) : (
            <div className="space-y-4">
              {penalties.map((penalty) => (
                <div
                  key={penalty.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-base font-semibold">
                          {penalty.teamName}
                        </h4>
                        {statusBadge(penalty.status)}
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {penalty.missionName}
                      </p>
                      {penalty.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {penalty.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {penalty.status === "ASSIGNED" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(penalty.id, "COMPLETED")
                            }
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-green-600 transition hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                          >
                            완료
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(penalty.id, "FAILED")
                            }
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            실패
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Verifications */}
                  {penalty.verifications.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        인증 내역
                      </p>
                      {penalty.verifications.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {v.userNickname}
                            </p>
                            {v.memo && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {v.memo}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(v.createdAt).toLocaleDateString(
                                "ko-KR"
                              )}
                            </p>
                          </div>
                          <div className="ml-2 shrink-0">
                            {v.approved ? (
                              <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                승인됨
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  handleApproveVerification(v.id)
                                }
                                className="rounded-lg bg-black px-3 py-1 text-xs font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                              >
                                승인
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Final Rankings Section */}
          <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">최종 순위</h2>
              <button
                onClick={handleCalculateFinalScores}
                disabled={calculating}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {calculating ? "계산 중..." : "최종 순위 계산"}
              </button>
            </div>

            {loadingFinalScores ? (
              <div className="mt-4">
                <LoadingSkeleton variant="table" />
              </div>
            ) : finalScores.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="최종 순위가 아직 없습니다"
                  description="최종 순위 계산 버튼을 눌러 4주 합산 순위를 산정하세요."
                />
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                      <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
                        순위
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
                        팀명
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
                        총점
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalScores.map((score) => (
                      <tr
                        key={`${score.teamName}-${score.finalRank}`}
                        className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              score.finalRank === 1
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : score.finalRank === 2
                                  ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                  : score.finalRank === 3
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {score.finalRank}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {score.teamName}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                          {score.totalScore.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
