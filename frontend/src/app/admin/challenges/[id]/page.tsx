"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import type { Challenge } from "@/lib/types";
import { LoadingSkeleton, ErrorAlert, EmptyState, useToast } from "@/components/ui";

interface ChallengeMemberDetail {
  userId: string;
  nickname: string;
  email: string;
  hasInbody: boolean;
  lastInbodyDate: string | null;
  hasGoals: boolean;
}

interface ChallengeTeamDetail {
  teamId: string;
  teamName: string;
  members: ChallengeMemberDetail[];
}

interface ChallengeDetailWithMembers {
  challenge: Challenge;
  teams: ChallengeTeamDetail[];
  totalTeams: number;
  totalMembers: number;
}

export default function ChallengeDetailPage() {
  const toast = useToast();
  const params = useParams();
  const id = params.id as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [memberData, setMemberData] = useState<ChallengeDetailWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  const fetchChallenge = useCallback(async () => {
    try {
      const data = await apiClient.get<Challenge>(`/api/admin/challenges/${id}`);
      setChallenge(data);
      setEditTitle(data.title);
      setEditDescription(data.description || "");
      setEditStartDate(data.startDate);
      setEditEndDate(data.endDate);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "챌린지 정보를 불러올 수 없습니다"
      );
    }
  }, [id]);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await apiClient.get<ChallengeDetailWithMembers>(
        `/api/admin/challenges/${id}/members`
      );
      setMemberData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "참여 현황을 불러올 수 없습니다"
      );
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchChallenge(), fetchMembers()]);
      setLoading(false);
    };
    load();
  }, [fetchChallenge, fetchMembers]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      await apiClient.put(`/api/admin/challenges/${id}`, {
        title: editTitle,
        description: editDescription || null,
        startDate: editStartDate,
        endDate: editEndDate,
      });
      toast.success("챌린지가 수정되었습니다.");
      setEditing(false);
      await fetchChallenge();
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "챌린지 수정에 실패했습니다"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!challenge) return;
    const url = `${window.location.origin}/join/${challenge.inviteCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("클립보드 복사에 실패했습니다");
    }
  };

  const statusBadge = (status: Challenge["status"]) => {
    const styles = {
      PREPARING:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      ACTIVE:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      COMPLETED:
        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    };
    const labels = {
      PREPARING: "준비중",
      ACTIVE: "진행중",
      COMPLETED: "완료",
    };
    return (
      <span
        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/challenges"
          className="inline-flex items-center gap-1 text-sm text-gray-600 transition hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          &larr; 챌린지 목록
        </Link>
        <LoadingSkeleton variant="form" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/challenges"
          className="inline-flex items-center gap-1 text-sm text-gray-600 transition hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          &larr; 챌린지 목록
        </Link>
        <ErrorAlert message="챌린지를 찾을 수 없습니다." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin/challenges"
        className="inline-flex items-center gap-1 text-sm text-gray-600 transition hover:text-black dark:text-gray-400 dark:hover:text-white"
      >
        &larr; 챌린지 목록
      </Link>

      {error && (
        <ErrorAlert message={error} onRetry={fetchChallenge} onDismiss={() => setError("")} />
      )}

      {/* Section 1: 기본 정보 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        {!editing ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">
                    {challenge.title}
                  </h1>
                  {statusBadge(challenge.status)}
                </div>
                {challenge.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {challenge.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    기간: {challenge.startDate} ~ {challenge.endDate}
                  </span>
                  <span>현재 주차: {challenge.currentWeek}주</span>
                </div>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="shrink-0 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                수정
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleEdit} className="space-y-4">
            <h2 className="text-lg font-semibold">챌린지 수정</h2>

            <div>
              <label htmlFor="editTitle" className="block text-sm font-medium">
                챌린지 이름
              </label>
              <input
                id="editTitle"
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              />
            </div>

            <div>
              <label
                htmlFor="editDescription"
                className="block text-sm font-medium"
              >
                설명
              </label>
              <textarea
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="editStartDate"
                  className="block text-sm font-medium"
                >
                  시작일
                </label>
                <input
                  id="editStartDate"
                  type="date"
                  required
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                />
              </div>
              <div>
                <label
                  htmlFor="editEndDate"
                  className="block text-sm font-medium"
                >
                  종료일
                </label>
                <input
                  id="editEndDate"
                  type="date"
                  required
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={editLoading}
                className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {editLoading ? "저장 중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditTitle(challenge.title);
                  setEditDescription(challenge.description || "");
                  setEditStartDate(challenge.startDate);
                  setEditEndDate(challenge.endDate);
                }}
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Section 2: 초대 링크 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold">초대 링크</h2>
        <div className="mt-3 flex items-center gap-3">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
            {typeof window !== "undefined"
              ? `${window.location.origin}/join/${challenge.inviteCode}`
              : `/join/${challenge.inviteCode}`}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {copied ? "복사 완료!" : "복사"}
          </button>
        </div>
      </div>

      {/* Section 3: 참여 현황 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          참여 현황{" "}
          {memberData && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({memberData.totalTeams}팀 / {memberData.totalMembers}명)
            </span>
          )}
        </h2>

        {!memberData || memberData.teams.length === 0 ? (
          <EmptyState
            title="참여 중인 팀이 없습니다"
            description="팀 관리 페이지에서 팀을 구성하세요."
          />
        ) : (
          <div className="space-y-3">
            {memberData.teams.map((team) => (
              <div
                key={team.teamId}
                className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
              >
                <h3 className="text-base font-semibold">{team.teamName}</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        <th className="pb-2 pr-4 font-medium">닉네임</th>
                        <th className="pb-2 pr-4 font-medium">이메일</th>
                        <th className="pb-2 pr-4 font-medium">InBody</th>
                        <th className="pb-2 font-medium">목표</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.members.map((member) => (
                        <tr
                          key={member.userId}
                          className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                        >
                          <td className="py-2 pr-4 font-medium">
                            {member.nickname}
                          </td>
                          <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">
                            {member.email}
                          </td>
                          <td className="py-2 pr-4">
                            {member.hasInbody ? (
                              <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                완료
                                {member.lastInbodyDate && (
                                  <span className="ml-1 text-green-600 dark:text-green-500">
                                    ({member.lastInbodyDate})
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                미입력
                              </span>
                            )}
                          </td>
                          <td className="py-2">
                            {member.hasGoals ? (
                              <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                설정됨
                              </span>
                            ) : (
                              <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                미설정
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
