"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import type { FeedEvent, FeedPage, CheerToggleResult, Team } from "@/lib/types";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Textarea,
  Avatar,
  AvatarFallback,
  Skeleton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Separator,
} from "@/components/ui";
import {
  Heart,
  Image as ImageIcon,
  X,
  Send,
  MoreHorizontal,
  Edit,
  Trash2,
  Newspaper,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Event type badge config
// ---------------------------------------------------------------------------
const EVENT_TYPE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  MISSION_VERIFICATION: {
    label: "미션 인증",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  PENALTY_VERIFICATION: {
    label: "벌칙 수행",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  INBODY_RECORD: {
    label: "인바디",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  WEEKLY_ACHIEVEMENT: {
    label: "주간 결과",
    className:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  USER_POST: {
    label: "자유 글",
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function FeedPage() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // 현재 유저
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 글 작성
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [postLoading, setPostLoading] = useState(false);

  // 수정 모드
  const [editingEvent, setEditingEvent] = useState<FeedEvent | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchInitialFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const team = await apiClient.get<Team>("/api/teams/me");
      const cid = team.challengeId;
      setChallengeId(cid);

      // 현재 유저 정보
      const me = await apiClient.get<{ id: string }>("/api/auth/me");
      setCurrentUserId(me.id);

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

  // 이미지 업로드 핸들러
  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImageFile(file);
      setPostImagePreview(URL.createObjectURL(file));
    }
  };

  // 글 작성 핸들러
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId || !postTitle.trim()) return;
    setPostLoading(true);
    try {
      let imageUrl: string | null = null;
      if (postImageFile) {
        try {
          const presigned = await apiClient.post<{
            uploadUrl: string;
            fileUrl: string;
          }>("/api/storage/presigned-url", {
            contentType: postImageFile.type,
            folder: "feed",
          });
          await fetch(presigned.uploadUrl, {
            method: "PUT",
            body: postImageFile,
            headers: { "Content-Type": postImageFile.type },
          });
          imageUrl = presigned.fileUrl;
        } catch {
          // 이미지 업로드 실패 시 텍스트만 등록
        }
      }
      const created = await apiClient.post<FeedEvent>("/api/feed", {
        challengeId,
        title: postTitle.trim(),
        description: postDescription.trim() || null,
        imageUrl,
      });
      setEvents((prev) => [created, ...prev]);
      setPostTitle("");
      setPostDescription("");
      setPostImageFile(null);
      setPostImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setError("글 작성에 실패했습니다.");
    } finally {
      setPostLoading(false);
    }
  };

  // 삭제 핸들러
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("이 글을 삭제하시겠습니까?")) return;
    try {
      await apiClient.delete(`/api/feed/${eventId}`);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch {
      setError("삭제에 실패했습니다.");
    }
  };

  // 수정 시작
  const handleStartEdit = (event: FeedEvent) => {
    setEditingEvent(event);
    setEditTitle(event.title);
    setEditDescription(event.description || "");
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingEvent(null);
    setEditTitle("");
    setEditDescription("");
  };

  // 수정 저장
  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editTitle.trim()) return;
    setEditLoading(true);
    try {
      const updated = await apiClient.put<FeedEvent>(
        `/api/feed/${editingEvent.id}`,
        {
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          imageUrl: editingEvent.imageUrl,
        }
      );
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setEditingEvent(null);
      setEditTitle("");
      setEditDescription("");
    } catch {
      setError("수정에 실패했습니다.");
    } finally {
      setEditLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render: loading
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-2 pt-1">
          <h1 className="text-xl font-bold">피드</h1>
        </div>
        <FeedSkeleton />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-2 pt-1">
        <h1 className="text-xl font-bold">피드</h1>
      </div>

      {/* 글 작성 폼 */}
      {challengeId && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleCreatePost} className="space-y-3">
              <Input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                maxLength={200}
              />
              <Textarea
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
                placeholder="내용을 입력하세요 (선택)"
                rows={2}
                className="resize-none"
              />

              {/* 이미지 미리보기 */}
              {postImagePreview && (
                <div className="relative inline-block">
                  <img
                    src={postImagePreview}
                    alt="미리보기"
                    className="h-20 w-20 rounded-md object-cover border border-border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setPostImageFile(null);
                      setPostImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                {/* 사진 첨부 버튼 */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5"
                >
                  <ImageIcon className="h-4 w-4" />
                  사진 첨부
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePostImageChange}
                  className="hidden"
                />

                <Button
                  type="submit"
                  size="sm"
                  disabled={postLoading || !postTitle.trim()}
                  className="gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  {postLoading ? "등록 중..." : "글 작성"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 에러 */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-3 flex items-center justify-between gap-2">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInitialFeed}
              className="shrink-0 text-xs"
            >
              다시 시도
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 피드 목록 */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Newspaper className="h-10 w-10 opacity-30" />
            <p className="font-medium">아직 피드가 없습니다</p>
            <p className="text-sm text-center">
              팀원들의 활동이 여기에 표시됩니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const config = EVENT_TYPE_CONFIG[event.eventType] ?? {
              label: event.eventType,
              className:
                "border-border bg-muted text-muted-foreground",
            };
            const isOwner = event.userId === currentUserId;
            const isEditing = editingEvent?.id === event.id;

            return (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* 상단: 아바타 + 닉네임 + 뱃지 + 시간 + 더보기 메뉴 */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="text-sm font-semibold">
                        {event.userNickname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold leading-none">
                          {event.userNickname}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[11px] px-1.5 py-0 leading-5 ${config.className}`}
                        >
                          {config.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {timeAgo(event.createdAt)}
                      </p>
                    </div>

                    {/* 본인 글만: 수정/삭제 드롭다운 */}
                    {isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {event.eventType === "USER_POST" && (
                            <DropdownMenuItem
                              onClick={() => handleStartEdit(event)}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteEvent(event.id)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* 본문 (보기 or 수정 폼) */}
                  {isEditing ? (
                    <form onSubmit={handleUpdatePost} className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        maxLength={200}
                        placeholder="제목"
                      />
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="resize-none"
                        placeholder="내용 (선택)"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={editLoading || !editTitle.trim()}
                        >
                          {editLoading ? "저장 중..." : "저장"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          취소
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 이미지 */}
                  {event.imageUrl &&
                    event.imageUrl !== "placeholder-image-url" && (
                      <div className="overflow-hidden rounded-lg border border-border">
                        <img
                          src={event.imageUrl}
                          alt=""
                          className="w-full object-cover"
                        />
                      </div>
                    )}

                  <Separator />

                  {/* 응원 버튼 */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <Button
                      variant={event.cheeredByMe ? "outline" : "ghost"}
                      size="sm"
                      onClick={() => handleCheerToggle(event.id)}
                      className={`gap-1.5 h-8 px-3 transition-colors ${
                        event.cheeredByMe
                          ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${event.cheeredByMe ? "fill-red-500 dark:fill-red-400" : ""}`}
                      />
                      <span className="text-xs font-medium">
                        응원{event.cheerCount > 0 && ` ${event.cheerCount}`}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 더 보기 */}
      {hasNext && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? "불러오는 중..." : "더 보기"}
        </Button>
      )}
    </div>
  );
}
