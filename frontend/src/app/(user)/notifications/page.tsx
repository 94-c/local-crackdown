"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { NotificationItem } from "@/lib/types";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { Bell, BellOff, Check, ChevronRight, RefreshCw } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiClient.get<NotificationItem[]>("/api/notifications");
      setNotifications(data);
    } catch {
      setError("알림을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.put(`/api/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.put("/api/notifications/read-all", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silently fail
    }
  };

  const timeAgo = (dateStr: string) => {
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
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">알림</h1>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground">
              {unreadCount}
            </Badge>
          )}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs text-muted-foreground"
              onClick={handleMarkAllAsRead}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              모두 읽음
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 p-4">
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-4">
              <p className="mb-3 text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchNotifications}>
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                다시 시도
              </Button>
            </CardContent>
          </Card>
        )}

        {notifications.length === 0 && !error ? (
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center">
              <BellOff className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">알림이 없습니다</p>
              <p className="mt-1 text-sm text-muted-foreground">
                새로운 알림이 오면 여기에 표시됩니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => {
                  if (!notification.isRead) handleMarkAsRead(notification.id);
                  if (notification.link) {
                    window.location.href = notification.link;
                  }
                }}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  notification.isRead
                    ? "border-border bg-card hover:bg-muted/50"
                    : "border-primary/20 bg-primary/5 hover:bg-primary/10"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        notification.isRead
                          ? "bg-muted"
                          : "bg-primary/10"
                      )}
                    >
                      <Bell
                        className={cn(
                          "h-4 w-4",
                          notification.isRead
                            ? "text-muted-foreground"
                            : "text-primary"
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          !notification.isRead && "text-primary"
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                    {notification.link && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
