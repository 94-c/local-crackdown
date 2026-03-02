"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Challenge, Participant } from "@/lib/types";
import { LoadingSkeleton, ErrorAlert, EmptyState, useToast } from "@/components/ui";

export default function ParticipantsPage() {
  const toast = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchChallenges = useCallback(async () => {
    try {
      const data = await apiClient.get<Challenge[]>("/api/admin/challenges");
      setChallenges(data);
      if (data.length > 0) {
        setSelectedChallengeId(data[0].id);
      }
    } catch {
      setError("챌린지 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParticipants = useCallback(async () => {
    if (!selectedChallengeId) return;
    try {
      const params = new URLSearchParams({ challengeId: selectedChallengeId });
      if (statusFilter) params.append("status", statusFilter);
      const data = await apiClient.get<Participant[]>(
        `/api/admin/participants?${params.toString()}`
      );
      setParticipants(data);
    } catch {
      setError("참여자 목록을 불러올 수 없습니다.");
    }
  }, [selectedChallengeId, statusFilter]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    if (selectedChallengeId) {
      fetchParticipants();
    }
  }, [selectedChallengeId, statusFilter, fetchParticipants]);

  const handleApprove = async (id: string) => {
    try {
      await apiClient.put(`/api/admin/participants/${id}/approve`, {});
      toast.success("참가를 승인했습니다.");
      fetchParticipants();
    } catch {
      setError("승인에 실패했습니다.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.put(`/api/admin/participants/${id}/reject`, {});
      toast.success("참가를 거절했습니다.");
      fetchParticipants();
    } catch {
      setError("거절에 실패했습니다.");
    }
  };

  const handleApproveAll = async () => {
    try {
      await apiClient.post(
        `/api/admin/participants/approve-all?challengeId=${selectedChallengeId}`,
        {}
      );
      toast.success("전체 승인 완료.");
      fetchParticipants();
    } catch {
      setError("전체 승인에 실패했습니다.");
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      REJECTED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    };
    const labels: Record<string, string> = {
      PENDING: "대기",
      APPROVED: "승인",
      REJECTED: "거절",
    };
    return (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return <LoadingSkeleton variant="card" count={3} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">참여자 관리</h1>

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedChallengeId}
          onChange={(e) => setSelectedChallengeId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          {challenges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">전체</option>
          <option value="PENDING">대기</option>
          <option value="APPROVED">승인</option>
          <option value="REJECTED">거절</option>
        </select>

        {participants.some((p) => p.status === "PENDING") && (
          <button
            onClick={handleApproveAll}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            전체 승인
          </button>
        )}
      </div>

      {participants.length === 0 ? (
        <EmptyState title="참여자가 없습니다" />
      ) : (
        <div className="space-y-2">
          {participants.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.nickname}</span>
                    {statusBadge(p.status)}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {p.email}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{p.hasTeam ? "팀 배정됨" : "팀 미배정"}</span>
                    <span>{p.hasInbody ? "인바디 입력" : "인바디 미입력"}</span>
                    <span>{p.hasGoals ? "목표 설정" : "목표 미설정"}</span>
                  </div>
                </div>
                {p.status === "PENDING" && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleReject(p.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      거절
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
