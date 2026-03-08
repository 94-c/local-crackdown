"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { Challenge, Team } from "@/lib/types";
import UserSearchDropdown from "@/components/UserSearchDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ErrorAlert } from "@/components/ui/legacy/ErrorAlert";
import { EmptyState } from "@/components/ui/legacy/EmptyState";
import { Plus, X, Wand2, Trash2, Users } from "lucide-react";

export default function TeamsPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [autoAssignLoading, setAutoAssignLoading] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [member1, setMember1] = useState<{
    id: string;
    nickname: string;
    email: string;
  } | null>(null);
  const [member2, setMember2] = useState<{
    id: string;
    nickname: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const data = await apiClient.get<Challenge[]>("/api/admin/challenges");
        setChallenges(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "챌린지 목록을 불러올 수 없습니다"
        );
      } finally {
        setLoadingChallenges(false);
      }
    };
    fetchChallenges();
  }, []);

  const fetchTeams = useCallback(async (challengeId: string) => {
    if (!challengeId) {
      setTeams([]);
      return;
    }
    try {
      setLoadingTeams(true);
      const data = await apiClient.get<Team[]>(
        `/api/admin/teams?challengeId=${challengeId}`
      );
      setTeams(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "팀 목록을 불러올 수 없습니다"
      );
    } finally {
      setLoadingTeams(false);
    }
  }, []);

  const handleChallengeChange = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    setShowForm(false);
    fetchTeams(challengeId);
  };

  const resetForm = () => {
    setTeamName("");
    setMember1(null);
    setMember2(null);
    setShowForm(false);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !member1) return;
    setFormLoading(true);

    try {
      await apiClient.post("/api/admin/teams", {
        name: teamName,
        challengeId: selectedChallengeId,
        member1Id: member1.id,
        member2Id: member2?.id || null,
      });
      toast.success("팀이 생성되었습니다.");
      resetForm();
      fetchTeams(selectedChallengeId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "팀 생성에 실패했습니다"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, name: string) => {
    if (!confirm(`"${name}" 팀을 삭제하시겠습니까?`)) return;

    try {
      await apiClient.delete(`/api/admin/teams/${teamId}`);
      toast.success("팀이 삭제되었습니다.");
      fetchTeams(selectedChallengeId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "팀 삭제에 실패했습니다"
      );
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedChallengeId) return;
    if (!confirm("승인된 참여자를 자동으로 팀에 배정하시겠습니까?")) return;

    setAutoAssignLoading(true);
    setError("");
    try {
      const result = await apiClient.post<Team[]>(
        `/api/admin/teams/auto-assign?challengeId=${selectedChallengeId}`,
        {}
      );
      toast.success(`자동 팀 구성 완료: ${result.length}개 팀이 생성되었습니다.`);
      fetchTeams(selectedChallengeId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "자동 팀 구성에 실패했습니다"
      );
    } finally {
      setAutoAssignLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">팀 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          챌린지별 팀을 구성하고 관리합니다
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}

      <div className="space-y-2">
        <Label htmlFor="challengeSelect">챌린지 선택</Label>
        <Select
          value={selectedChallengeId}
          onValueChange={handleChallengeChange}
          disabled={loadingChallenges}
        >
          <SelectTrigger id="challengeSelect">
            <SelectValue
              placeholder={loadingChallenges ? "챌린지 로딩 중..." : "챌린지를 선택하세요"}
            />
          </SelectTrigger>
          <SelectContent>
            {challenges.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedChallengeId && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              팀 목록{teams.length > 0 ? ` (${teams.length}팀)` : ""}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoAssign}
                disabled={autoAssignLoading}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {autoAssignLoading ? "배정 중..." : "자동 팀 구성"}
              </Button>
              <Button
                size="sm"
                variant={showForm ? "outline" : "default"}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    취소
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    새 팀 만들기
                  </>
                )}
              </Button>
            </div>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">새 팀 만들기</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">팀명 *</Label>
                    <Input
                      id="teamName"
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="팀 이름"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>멤버1 *</Label>
                      <UserSearchDropdown
                        placeholder="사용자 검색 (필수)"
                        selectedUser={member1}
                        onSelect={setMember1}
                        onClear={() => setMember1(null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>멤버2</Label>
                      <UserSearchDropdown
                        placeholder="사용자 검색 (선택)"
                        selectedUser={member2}
                        onSelect={setMember2}
                        onClear={() => setMember2(null)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={formLoading || !member1}>
                      {formLoading ? "생성 중..." : "팀 생성"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      취소
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loadingTeams ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="mb-2 h-5 w-1/4" />
                    <Skeleton className="mb-1 h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : teams.length === 0 ? (
            <EmptyState
              title="등록된 팀이 없습니다"
              description="새 팀 만들기 버튼을 눌러 팀을 구성하세요."
            />
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <Card key={team.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <h4 className="truncate text-base font-semibold">
                            {team.name}
                          </h4>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium text-foreground">멤버1:</span>{" "}
                            {team.member1.nickname} ({team.member1.email})
                          </p>
                          {team.member2 && (
                            <p>
                              <span className="font-medium text-foreground">멤버2:</span>{" "}
                              {team.member2.nickname} ({team.member2.email})
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id, team.name)}
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
