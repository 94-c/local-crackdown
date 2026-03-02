"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { FeedEvent, FeedPage, CheerToggleResult, Team } from "@/lib/types";
import { LoadingSkeleton, ErrorAlert, EmptyState } from "@/components/ui";

const EVENT_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  MISSION_VERIFICATION: {
    label: "미션 인증",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  PENALTY_VERIFICATION: {
    label: "벌칙 수행",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  INBODY_RECORD: {
    label: "인바디",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  WEEKLY_ACHIEVEMENT: {
    label: "주간 결과",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}

export default function FeedPage() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchInitialFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const team = await apiClient.get<Team>("/api/teams/me");
      const cid = team.challengeId;
      setChallengeId(cid);

      const data = await apiClient.get<FeedPage>(
        `/api/feed?challengeId=${cid}&page=0&size=20`
      );
      setEvents(data.content);
      setHasNext(data.hasNext);
      setPage(0);
    } catch {
      setError("피드를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialFeed();
  }, [fetchInitialFeed]);

  const handleLoadMore = async () => {
    if (!challengeId || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await apiClient.get<FeedPage>(
        `/api/feed?challengeId=${challengeId}&page=${nextPage}&size=20`
      );
      setEvents((prev) => [...prev, ...data.content]);
      setHasNext(data.hasNext);
      setPage(nextPage);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCheerToggle = async (feedEventId: string) => {
    // Optimistic update
    setEvents((prev) =>
      prev.map((e) =>
        e.id === feedEventId
          ? {
              ...e,
              cheeredByMe: !e.cheeredByMe,
              cheerCount: e.cheeredByMe ? e.cheerCount - 1 : e.cheerCount + 1,
            }
          : e
      )
    );
    try {
      const result = await apiClient.post<CheerToggleResult>(
        `/api/feed/${feedEventId}/cheer`,
        {}
      );
      setEvents((prev) =>
        prev.map((e) =>
          e.id === feedEventId
            ? { ...e, cheeredByMe: result.cheered, cheerCount: result.cheerCount }
            : e
        )
      );
    } catch {
      // Revert on failure
      setEvents((prev) =>
        prev.map((e) =>
          e.id === feedEventId
            ? {
                ...e,
                cheeredByMe: !e.cheeredByMe,
                cheerCount: e.cheeredByMe ? e.cheerCount - 1 : e.cheerCount + 1,
              }
            : e
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">피드</h1>
        <LoadingSkeleton variant="card" count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">피드</h1>

      {error && <ErrorAlert message={error} onRetry={fetchInitialFeed} />}

      {events.length === 0 ? (
        <EmptyState title="아직 피드가 없습니다" description="팀원들의 활동이 여기에 표시됩니다." />
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const config = EVENT_TYPE_CONFIG[event.eventType] ?? {
              label: event.eventType,
              className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
            };
            return (
              <div
                key={event.id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                {/* 상단: 아바타 + 닉네임 + 이벤트 타입 뱃지 + 시간 */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold dark:bg-gray-700">
                    {event.userNickname.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{event.userNickname}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{timeAgo(event.createdAt)}</p>
                  </div>
                </div>

                {/* 내용 */}
                <div className="mt-3">
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* 이미지 (있을 경우) */}
                {event.imageUrl && event.imageUrl !== "placeholder-image-url" && (
                  <div className="mt-3 overflow-hidden rounded-lg">
                    <img src={event.imageUrl} alt="" className="w-full object-cover" />
                  </div>
                )}

                {/* 응원 버튼 */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleCheerToggle(event.id)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition ${
                      event.cheeredByMe
                        ? "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    {event.cheeredByMe ? "❤️" : "🤍"} 응원{" "}
                    {event.cheerCount > 0 && event.cheerCount}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasNext && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {loadingMore ? "불러오는 중..." : "더 보기"}
        </button>
      )}
    </div>
  );
}
