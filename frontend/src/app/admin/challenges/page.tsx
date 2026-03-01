"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import type { Challenge } from "@/lib/types";

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
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


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

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
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
        endDate,
      });
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
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
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
              <label
                htmlFor="endDate"
                className="block text-sm font-medium"
              >
                종료일
              </label>
              <input
                id="endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              />
            </div>
          </div>

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
        <p className="text-sm text-gray-500 dark:text-gray-400">
          로딩 중...
        </p>
      ) : challenges.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            등록된 챌린지가 없습니다.
          </p>
        </div>
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
                      기간: {challenge.startDate} ~ {challenge.endDate}
                    </span>
                    <span>현재 주차: {challenge.currentWeek}주</span>
                  </div>
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
