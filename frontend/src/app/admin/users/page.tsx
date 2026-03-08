"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { UserInfo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorAlert } from "@/components/ui/legacy/ErrorAlert";
import { EmptyState } from "@/components/ui/legacy/EmptyState";
import { Trash2 } from "lucide-react";

export default function UsersPage() {
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">사용자 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          등록된 사용자 목록을 관리합니다
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onRetry={fetchUsers} onDismiss={() => setError("")} />
      )}

      {loading ? (
        <Card>
          <div className="space-y-0 divide-y">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </Card>
      ) : users.length === 0 ? (
        <EmptyState
          title="등록된 사용자가 없습니다"
          description="아직 가입한 사용자가 없습니다."
        />
      ) : (
        <Card>
          <div className="mb-3 px-4 pt-4">
            <p className="text-sm text-muted-foreground">총 {users.length}명</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>닉네임</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>성별</TableHead>
                  <TableHead>키</TableHead>
                  <TableHead>생년월일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nickname}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.gender
                        ? user.gender === "MALE"
                          ? "남성"
                          : "여성"
                        : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.height ? `${user.height}cm` : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.birthDate ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role !== "ADMIN" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.nickname)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
