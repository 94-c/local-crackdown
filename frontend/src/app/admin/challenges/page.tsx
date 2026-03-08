"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { Challenge, GoalType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorAlert } from "@/components/ui/legacy/ErrorAlert";
import { EmptyState } from "@/components/ui/legacy/EmptyState";
import { Copy, Check, Plus, X, ChevronRight, Calendar, Clock } from "lucide-react";

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
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      title="초대 링크 복사"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      <span className="ml-1">{copied ? "복사됨" : "초대 복사"}</span>
    </Button>
  );
}

const STATUS_CONFIG: Record<
  Challenge["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PREPARING: { label: "준비중", variant: "secondary" },
  ACTIVE: { label: "진행중", variant: "default" },
  COMPLETED: { label: "완료", variant: "outline" },
};

export default function ChallengesPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">챌린지 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            챌린지를 생성하고 관리합니다
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          {showForm ? (
            <>
              <X className="mr-2 h-4 w-4" />
              취소
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              새 챌린지 만들기
            </>
          )}
        </Button>
      </div>

      {error && (
        <ErrorAlert message={error} onRetry={fetchChallenges} onDismiss={() => setError("")} />
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">새 챌린지</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">챌린지 이름 *</Label>
                <Input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 2026 봄 챌린지"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="챌린지에 대한 설명 (선택)"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">시작일 *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationDays">챌린지 기간 (일) *</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    required
                    min={1}
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder="예: 28"
                  />
                  <p className="text-xs text-muted-foreground">
                    시작일로부터 {durationDays || 0}일 후 종료
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inbodyFrequency">인바디 등록 주기</Label>
                <Select
                  value={inbodyFrequencyDays}
                  onValueChange={setInbodyFrequencyDays}
                >
                  <SelectTrigger id="inbodyFrequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3일마다</SelectItem>
                    <SelectItem value="5">5일마다</SelectItem>
                    <SelectItem value="7">7일마다 (주 1회)</SelectItem>
                    <SelectItem value="14">14일마다 (격주)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {availableGoalTypes.length > 0 && (
                <div className="space-y-2">
                  <Label>목표 유형 선택</Label>
                  <p className="text-xs text-muted-foreground">
                    참가자가 설정할 수 있는 목표를 선택하세요
                  </p>
                  <div className="space-y-2">
                    {availableGoalTypes.map((gt) => (
                      <div
                        key={gt.id}
                        className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50"
                      >
                        <Checkbox
                          id={`gt-${gt.id}`}
                          checked={selectedGoalTypeIds.includes(gt.id)}
                          onCheckedChange={(checked) => {
                            setSelectedGoalTypeIds((prev) =>
                              checked
                                ? [...prev, gt.id]
                                : prev.filter((id) => id !== gt.id)
                            );
                          }}
                          className="mt-0.5"
                        />
                        <label htmlFor={`gt-${gt.id}`} className="cursor-pointer">
                          <span className="font-medium">{gt.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">({gt.unit})</span>
                          {gt.description && (
                            <p className="text-xs text-muted-foreground">{gt.description}</p>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? "생성 중..." : "챌린지 생성"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="mb-2 h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState
          title="등록된 챌린지가 없습니다"
          description="새 챌린지 만들기 버튼을 눌러 첫 챌린지를 생성하세요."
        />
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const statusCfg = STATUS_CONFIG[challenge.status];
            return (
              <Card key={challenge.id} className="transition-shadow hover:shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/admin/challenges/${challenge.id}`}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-semibold">
                          {challenge.title}
                        </h3>
                        <Badge variant={statusCfg.variant}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                      {challenge.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {challenge.startDate} ~ {challenge.endDate}
                          {challenge.durationDays ? ` (${challenge.durationDays}일)` : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {challenge.currentWeek}주차
                        </span>
                      </div>
                      {challenge.goalTypes && challenge.goalTypes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {challenge.goalTypes.map((gt) => (
                            <Badge key={gt.id} variant="secondary" className="text-xs">
                              {gt.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Link>
                    <div className="flex shrink-0 items-center gap-1">
                      <CopyInviteButton inviteCode={challenge.inviteCode} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(challenge.id, challenge.title)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        삭제
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/challenges/${challenge.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
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
