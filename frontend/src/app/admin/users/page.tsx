"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { UserInfo } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiClient.get<UserInfo[]>("/api/admin/users");
        setUsers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "사용자 목록을 불러올 수 없습니다"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">사용자 관리</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">로딩 중...</p>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            등록된 사용자가 없습니다.
          </p>
        </div>
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
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                ID: {user.id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
