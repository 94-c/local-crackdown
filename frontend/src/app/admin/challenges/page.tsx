"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import type { Challenge, GoalType } from "@/lib/types";
import { LoadingSkeleton, ErrorAlert, EmptyState, useToast } from "@/components/ui";

function CopyInviteButton({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/join/${inviteCode}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-lg px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      title="초대 링크 복사"
    >
      {copied ? "복사됨!" : "초대 복사"}
    </button>
  );
}

export default function ChallengesPage() {
  const toast = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState("28");
  const [inbodyFrequencyDays, setInbodyFrequencyDays] = useState("7");
  const [availableGoalTypes, setAvailableGoalTypes] = useState<GoalType[]>([]);
  const [selectedGoalTypeIds, setSelectedGoalTypeIds] = useState<string[]>([]);

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Challenge[]>("/api/admin/challenges");
      setChallenges(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "챌린지 목록을 불러올 수 없습니다"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGoalTypes = useCallback(async () => {
    try {
      const data = await apiClient.get<GoalType[]>("/api/goal-types");
      setAvailableGoalTypes(data);
    } catch {
      // silently fail — goal types are optional
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
    fetchGoalTypes();
  }, [fetchChallenges, fetchGoalTypes]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setDurationDays("28");
    setInbodyFrequencyDays("7");
    setSelectedGoalTypeIds([]);
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await apiClient.post("/api/admin/challenges", {
        title,
        description: description || null,
        startDate,
        durationDays: parseInt(durationDays),
        inbodyFrequencyDays: parseInt(inbodyFrequencyDays),
        goalTypeIds: selectedGoalTypeIds,
      });
      toast.success("챌린지가 생성되었습니다.");
      resetForm();
      fetchChallenges();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "챌린지 생성에 실패했습니다"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, challengeTitle: string) => {
    if (!confirm(`"${challengeTitle}" 챌린지를 삭제하시겠습니까?`)) return;

    try {
      await apiClient.delete(`/api/admin/challenges/${id}`);
      toast.success("챌린지가 삭제되었습니다.");
      fetchChallenges();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "챌린지 삭제에 실패했습니다"
      );
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">챌린지 관리</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          {showForm ? "취소" : "새 챌린지 만들기"}
        </button>
      </div>

      {error && (
        <ErrorAlert message={error} onRetry={fetchChallenges} onDismiss={() => setError("")} />
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="text-lg font-semibold">새 챌린지</h2>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium"
            >
              챌린지 이름
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              placeholder="예: 2026 봄 챌린지"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium"
            >
              설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              placeholder="챌린지에 대한 설명 (선택)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium"
              >
                시작일
              </label>
              <input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              />
            </div>
            <div>
              <label htmlFor="durationDays" className="block text-sm font-medium">
                챌린지 기간 (일)
              </label>
              <input
                id="durationDays"
                type="number"
                required
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                placeholder="예: 28"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                시작일로부터 {durationDays || 0}일 후 종료
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="inbodyFrequency" className="block text-sm font-medium">
              인바디 등록 주기 (일)
            </label>
            <select
              id="inbodyFrequency"
              value={inbodyFrequencyDays}
              onChange={(e) => setInbodyFrequencyDays(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
            >
              <option value="3">3일마다</option>
              <option value="5">5일마다</option>
              <option value="7">7일마다 (주 1회)</option>
              <option value="14">14일마다 (격주)</option>
            </select>
          </div>

          {availableGoalTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium">목표 유형 선택</label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                참가자가 설정할 수 있는 목표를 선택하세요
              </p>
              <div className="mt-2 space-y-2">
                {availableGoalTypes.map((gt) => (
                  <label
                    key={gt.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGoalTypeIds.includes(gt.id)}
                      onChange={() => {
                        setSelectedGoalTypeIds((prev) =>
                          prev.includes(gt.id)
                            ? prev.filter((id) => id !== gt.id)
                            : [...prev, gt.id]
                        );
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <div>
                      <span className="font-medium">{gt.name}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({gt.unit})</span>
                      {gt.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{gt.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={formLoading}
            className="w-full rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:w-auto"
          >
            {formLoading ? "생성 중..." : "챌린지 생성"}
          </button>
        </form>
      )}

      {loading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : challenges.length === 0 ? (
        <EmptyState
          title="등록된 챌린지가 없습니다"
          description="새 챌린지 만들기 버튼을 눌러 첫 챌린지를 생성하세요."
        />
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/admin/challenges/${challenge.id}`}
                  className="min-w-0 flex-1"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-semibold">
                      {challenge.title}
                    </h3>
                    {statusBadge(challenge.status)}
                  </div>
                  {challenge.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {challenge.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      기간: {challenge.startDate} ~ {challenge.endDate}{challenge.durationDays ? ` (${challenge.durationDays}일)` : ""}
                    </span>
                    <span>현재 주차: {challenge.currentWeek}주</span>
                  </div>
                  {challenge.goalTypes && challenge.goalTypes.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {challenge.goalTypes.map((gt) => (
                        <span
                          key={gt.id}
                          className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          {gt.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <CopyInviteButton inviteCode={challenge.inviteCode} />
                  <button
                    onClick={() => handleDelete(challenge.id, challenge.title)}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
