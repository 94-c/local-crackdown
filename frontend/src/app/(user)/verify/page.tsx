"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Team, TeamMission, Verification } from "@/lib/types";

export default function VerifyPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [mission, setMission] = useState<TeamMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Verification form
  const [memo, setMemo] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const weekNumber = 1;

  const fetchMission = useCallback(
    async (teamId: string, challengeId: string) => {
      try {
        const missions = await apiClient.get<TeamMission[]>(
          `/api/team-missions?teamId=${teamId}&challengeId=${challengeId}`
        );
        const currentMission = missions.find(
          (m) => m.weekNumber === weekNumber
        );
        setMission(currentMission || null);
      } catch {
        setMission(null);
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

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission) return;

    setSubmitError("");
    setSubmitSuccess(false);
    setSubmitLoading(true);
    try {
      const newVerification = await apiClient.post<Verification>(
        "/api/verifications",
        {
          teamMissionId: mission.id,
          memo: memo || null,
        }
      );
      // Optimistically add to local state
      setMission((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          verifications: [...(prev.verifications || []), newVerification],
        };
      });
      setMemo("");
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "인증 등록에 실패했습니다."
      );
    } finally {
      setSubmitLoading(false);
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
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500 dark:text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">미션 인증</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {team && !mission && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="text-2xl">📋</p>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            이번 주 팀 미션이 아직 없습니다.
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            팀 탭에서 먼저 미션을 생성해주세요.
          </p>
        </div>
      )}

      {mission && (
        <>
          {/* Current Mission Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
                {weekNumber}주차
              </span>
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
            <h2 className="mt-3 text-lg font-bold">
              {mission.missionTemplateName}
            </h2>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                현재 {mission.currentValue} / {mission.targetValue}{" "}
                {mission.unit}
              </span>
              <span className="font-medium text-black dark:text-white">
                {mission.targetValue > 0
                  ? Math.min(
                      Math.round(
                        (mission.currentValue / mission.targetValue) * 100
                      ),
                      100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-black transition-all dark:bg-white"
                style={{
                  width: `${mission.targetValue > 0 ? Math.min(Math.round((mission.currentValue / mission.targetValue) * 100), 100) : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Verification Form */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold">인증 등록</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              미션 수행을 인증하세요.
            </p>

            <form
              onSubmit={handleSubmitVerification}
              className="mt-4 space-y-4"
            >
              {submitError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  인증이 등록되었습니다!
                </div>
              )}

              <div>
                <label htmlFor="verify-memo" className="block text-sm font-medium">
                  메모
                </label>
                <input
                  id="verify-memo"
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="인증 내용을 간단히 적어주세요"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                />
              </div>

              <button
                type="button"
                disabled
                className="w-full rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-400 dark:border-gray-700 dark:text-gray-500"
              >
                이미지 업로드 (준비중)
              </button>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {submitLoading ? "등록 중..." : "인증 등록"}
              </button>
            </form>
          </div>

          {/* Verifications List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              인증 기록{" "}
              {mission.verifications && mission.verifications.length > 0 && (
                <span>({mission.verifications.length})</span>
              )}
            </h3>

            {!mission.verifications || mission.verifications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  아직 인증 기록이 없습니다.
                </p>
              </div>
            ) : (
              mission.verifications.map((v) => (
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
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
