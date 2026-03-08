"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { Challenge, Participant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorAlert } from "@/components/ui/legacy/ErrorAlert";
import { EmptyState } from "@/components/ui/legacy/EmptyState";
import { CheckCircle2, XCircle, Users } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "대기", variant: "secondary" },
  APPROVED: { label: "승인", variant: "default" },
  REJECTED: { label: "거절", variant: "destructive" },
};

export default function ParticipantsPage() {
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

  const pendingCount = participants.filter((p) => p.status === "PENDING").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">참여자 관리</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">참여자 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          챌린지 참여 신청을 승인하거나 거절합니다
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedChallengeId} onValueChange={setSelectedChallengeId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="챌린지 선택" />
          </SelectTrigger>
          <SelectContent>
            {challenges.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">전체</SelectItem>
            <SelectItem value="PENDING">대기</SelectItem>
            <SelectItem value="APPROVED">승인</SelectItem>
            <SelectItem value="REJECTED">거절</SelectItem>
          </SelectContent>
        </Select>

        {pendingCount > 0 && (
          <Button onClick={handleApproveAll} variant="default" size="sm">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            전체 승인 ({pendingCount}명)
          </Button>
        )}
      </div>

      {participants.length === 0 ? (
        <EmptyState
          title="참여자가 없습니다"
          description="아직 참여 신청이 없습니다."
        />
      ) : (
        <div className="space-y-2">
          {participants.map((p) => {
            const statusCfg = STATUS_CONFIG[p.status];
            return (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{p.nickname}</span>
                        <Badge variant={statusCfg?.variant ?? "outline"}>
                          {statusCfg?.label ?? p.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.email}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge
                          variant={p.hasTeam ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          <Users className="mr-1 h-3 w-3" />
                          {p.hasTeam ? "팀 배정됨" : "팀 미배정"}
                        </Badge>
                        <Badge
                          variant={p.hasInbody ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {p.hasInbody ? "인바디 입력" : "인바디 미입력"}
                        </Badge>
                        <Badge
                          variant={p.hasGoals ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {p.hasGoals ? "목표 설정" : "목표 미설정"}
                        </Badge>
                      </div>
                    </div>
                    {p.status === "PENDING" && (
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(p.id)}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(p.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          거절
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
