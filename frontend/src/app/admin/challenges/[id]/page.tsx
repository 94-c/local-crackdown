"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import type { Challenge, InBodyRecord, Achievement } from "@/lib/types";

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

interface ChallengeParticipant {
  userId: string;
  nickname: string;
  email: string;
  joinedAt: string;
  hasTeam: boolean;
  hasInbody: boolean;
  hasGoals: boolean;
}

interface ChallengeDetailWithMembers {
  challenge: Challenge;
  teams: ChallengeTeamDetail[];
  totalTeams: number;
  totalMembers: number;
  unassignedParticipants: ChallengeParticipant[];
}

interface UserGoalDetail {
  id: string;
  goalTypeName: string;
  targetValue: number;
  startValue: number;
}

interface MemberDetail {
  userId: string;
  nickname: string;
  email: string;
  gender: string | null;
  birthDate: string | null;
  height: number | null;
  inbodyRecords: InBodyRecord[];
  goals: UserGoalDetail[];
  achievements: Achievement[];
}

export default function ChallengeDetailPage() {
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

  // Member detail modal
  const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);

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

  const openMemberDetail = async (userId: string) => {
    setMemberLoading(true);
    try {
      const data = await apiClient.get<MemberDetail>(
        `/api/admin/challenges/${id}/members/${userId}/detail`
      );
      setSelectedMember(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "멤버 정보를 불러올 수 없습니다"
      );
    } finally {
      setMemberLoading(false);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <p className="text-sm text-gray-500 dark:text-gray-400">로딩 중...</p>
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
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          챌린지를 찾을 수 없습니다.
        </div>
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
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
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

        {/* 미배정 참여자 */}
        {memberData && memberData.unassignedParticipants && memberData.unassignedParticipants.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
            <h3 className="text-base font-semibold text-amber-800 dark:text-amber-300">
              팀 미배정 참여자{" "}
              <span className="text-sm font-normal">
                ({memberData.unassignedParticipants.length}명)
              </span>
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-200 text-left text-xs text-amber-700 dark:border-amber-700 dark:text-amber-400">
                    <th className="pb-2 pr-4 font-medium">닉네임</th>
                    <th className="pb-2 pr-4 font-medium">이메일</th>
                    <th className="pb-2 pr-4 font-medium">InBody</th>
                    <th className="pb-2 pr-4 font-medium">목표</th>
                    <th className="pb-2 font-medium">참여일</th>
                  </tr>
                </thead>
                <tbody>
                  {memberData.unassignedParticipants.map((p) => (
                    <tr
                      key={p.userId}
                      className="cursor-pointer border-b border-amber-100 last:border-0 hover:bg-amber-100/50 dark:border-amber-800/50 dark:hover:bg-amber-900/30"
                      onClick={() => openMemberDetail(p.userId)}
                    >
                      <td className="py-2 pr-4 font-medium">{p.nickname}</td>
                      <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">
                        {p.email}
                      </td>
                      <td className="py-2 pr-4">
                        {p.hasInbody ? (
                          <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            완료
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            미입력
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {p.hasGoals ? (
                          <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            설정됨
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            미설정
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(p.joinedAt).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!memberData || (memberData.teams.length === 0 && (!memberData.unassignedParticipants || memberData.unassignedParticipants.length === 0)) ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              참여자가 없습니다.
            </p>
          </div>
        ) : memberData.teams.length > 0 ? (
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
                          className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                          onClick={() => openMemberDetail(member.userId)}
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
        ) : null}
      </div>

      {/* Member Detail Modal */}
      {(selectedMember || memberLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !memberLoading && setSelectedMember(null)}
        >
          <div
            className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {memberLoading ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                불러오는 중...
              </p>
            ) : selectedMember ? (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedMember.nickname}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedMember.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 기본 정보 */}
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">기본 정보</h3>
                  <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">성별</span>
                      <p className="font-medium">
                        {selectedMember.gender === "MALE" ? "남성" : selectedMember.gender === "FEMALE" ? "여성" : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">생년월일</span>
                      <p className="font-medium">
                        {selectedMember.birthDate || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">키</span>
                      <p className="font-medium">
                        {selectedMember.height ? `${selectedMember.height} cm` : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 목표 & 달성률 */}
                {selectedMember.achievements.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">목표 달성률</h3>
                    {selectedMember.achievements.map((a) => {
                      const rate = Math.min(Math.max(a.achievementRate, 0), 100);
                      return (
                        <div
                          key={a.goalTypeName}
                          className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{a.goalTypeName}</span>
                            <span className="font-bold">{rate.toFixed(1)}%</span>
                          </div>
                          <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>시작: {a.startValue} {a.unit}</span>
                            <span>현재: {a.currentValue ?? "-"} {a.unit}</span>
                            <span>목표: {a.targetValue} {a.unit}</span>
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-full rounded-full bg-black transition-all dark:bg-white"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedMember.goals.length > 0 && selectedMember.achievements.length === 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">설정된 목표</h3>
                    {selectedMember.goals.map((g) => (
                      <div
                        key={g.id}
                        className="flex justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
                      >
                        <span className="font-medium">{g.goalTypeName}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {g.startValue} &rarr; {g.targetValue}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* InBody 기록 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    InBody 기록 ({selectedMember.inbodyRecords.length}건)
                  </h3>
                  {selectedMember.inbodyRecords.length === 0 ? (
                    <p className="text-sm text-gray-400">기록 없음</p>
                  ) : (
                    selectedMember.inbodyRecords.map((record) => (
                      <div
                        key={record.id}
                        className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                      >
                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(record.recordDate)}
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-sm">
                          <div>
                            <div className="text-xs text-gray-400">체중</div>
                            <div className="font-medium">{record.weight}kg</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">골격근</div>
                            <div className="font-medium">{record.skeletalMuscleMass}kg</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">체지방량</div>
                            <div className="font-medium">
                              {record.bodyFatMass != null ? `${record.bodyFatMass}kg` : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">체지방률</div>
                            <div className="font-medium">{record.bodyFatPercentage}%</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setSelectedMember(null)}
                  className="w-full rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  닫기
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
