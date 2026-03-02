"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Challenge, Team } from "@/lib/types";
import UserSearchDropdown from "@/components/UserSearchDropdown";
import { LoadingSkeleton, ErrorAlert, EmptyState, useToast } from "@/components/ui";

export default function TeamsPage() {
  const toast = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [autoAssignLoading, setAutoAssignLoading] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [member1, setMember1] = useState<{
    id: string;
    nickname: string;
    email: string;
  } | null>(null);
  const [member2, setMember2] = useState<{
    id: string;
    nickname: string;
    email: string;
  } | null>(null);

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
      setLoadingTeams(true);
      const data = await apiClient.get<Team[]>(
        `/api/admin/teams?challengeId=${challengeId}`
      );
      setTeams(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "팀 목록을 불러올 수 없습니다"
      );
    } finally {
      setLoadingTeams(false);
    }
  }, []);

  const handleChallengeChange = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    setShowForm(false);
    fetchTeams(challengeId);
  };

  const resetForm = () => {
    setTeamName("");
    setMember1(null);
    setMember2(null);
    setShowForm(false);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !member1) return;
    setFormLoading(true);

    try {
      await apiClient.post("/api/admin/teams", {
        name: teamName,
        challengeId: selectedChallengeId,
        member1Id: member1.id,
        member2Id: member2?.id || null,
      });
      toast.success("팀이 생성되었습니다.");
      resetForm();
      fetchTeams(selectedChallengeId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "팀 생성에 실패했습니다"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, name: string) => {
    if (!confirm(`"${name}" 팀을 삭제하시겠습니까?`)) return;

    try {
      await apiClient.delete(`/api/admin/teams/${teamId}`);
      toast.success("팀이 삭제되었습니다.");
      fetchTeams(selectedChallengeId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "팀 삭제에 실패했습니다"
      );
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedChallengeId) return;
    if (!confirm("승인된 참여자를 자동으로 팀에 배정하시겠습니까?")) return;

    setAutoAssignLoading(true);
    setError("");
    try {
      const result = await apiClient.post<Team[]>(
        `/api/admin/teams/auto-assign?challengeId=${selectedChallengeId}`,
        {}
      );
      toast.success(`자동 팀 구성 완료: ${result.length}개 팀이 생성되었습니다.`);
      fetchTeams(selectedChallengeId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "자동 팀 구성에 실패했습니다"
      );
    } finally {
      setAutoAssignLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">팀 관리</h1>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}

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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              팀 목록
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleAutoAssign}
                disabled={autoAssignLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                {autoAssignLoading ? "배정 중..." : "자동 팀 구성"}
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {showForm ? "취소" : "새 팀 만들기"}
              </button>
            </div>
          </div>

          {showForm && (
            <form
              onSubmit={handleCreateTeam}
              className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <h3 className="text-base font-semibold">새 팀</h3>

              <div>
                <label
                  htmlFor="teamName"
                  className="block text-sm font-medium"
                >
                  팀명
                </label>
                <input
                  id="teamName"
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                  placeholder="팀 이름"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium">
                    멤버1
                  </label>
                  <UserSearchDropdown
                    placeholder="사용자 검색 (필수)"
                    selectedUser={member1}
                    onSelect={setMember1}
                    onClear={() => setMember1(null)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    멤버2
                  </label>
                  <UserSearchDropdown
                    placeholder="사용자 검색 (선택)"
                    selectedUser={member2}
                    onSelect={setMember2}
                    onClear={() => setMember2(null)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:w-auto"
              >
                {formLoading ? "생성 중..." : "팀 생성"}
              </button>
            </form>
          )}

          {loadingTeams ? (
            <LoadingSkeleton variant="card" count={3} />
          ) : teams.length === 0 ? (
            <EmptyState
              title="등록된 팀이 없습니다"
              description="새 팀 만들기 버튼을 눌러 팀을 구성하세요."
            />
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-base font-semibold">
                        {team.name}
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          멤버1: {team.member1.nickname} ({team.member1.email})
                        </p>
                        {team.member2 && (
                          <p>
                            멤버2: {team.member2.nickname} (
                            {team.member2.email})
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                      className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
