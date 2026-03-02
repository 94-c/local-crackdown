"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { UserInfo } from "@/lib/types";
import { LoadingSkeleton, ErrorAlert, EmptyState, useToast } from "@/components/ui";

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<UserInfo[]>("/api/admin/users");
      setUsers(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "사용자 목록을 불러올 수 없습니다"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId: string, nickname: string) => {
    if (!confirm(`"${nickname}" 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      await apiClient.delete(`/api/admin/users/${userId}`);
      toast.success("사용자가 삭제되었습니다.");
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "사용자 삭제에 실패했습니다");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">사용자 관리</h1>

      {error && (
        <ErrorAlert message={error} onRetry={fetchUsers} onDismiss={() => setError("")} />
      )}

      {loading ? (
        <LoadingSkeleton variant="table" />
      ) : users.length === 0 ? (
        <EmptyState
          title="등록된 사용자가 없습니다"
          description="아직 가입한 사용자가 없습니다."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            총 {users.length}명
          </p>
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold">
                    {user.nickname}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {user.role}
                  </span>
                  {user.role !== "ADMIN" && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.nickname)}
                      className="rounded-lg px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              {(user.gender || user.height) && (
                <div className="mt-2 flex gap-3 text-xs text-gray-400 dark:text-gray-500">
                  {user.gender && <span>{user.gender === "MALE" ? "남성" : "여성"}</span>}
                  {user.height && <span>{user.height}cm</span>}
                  {user.birthDate && <span>{user.birthDate}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
