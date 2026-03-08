"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { Challenge, Participant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  ArrowLeft,
  Copy,
  Check,
  Pencil,
  X,
  Calendar,
  Clock,
  Users,
} from "lucide-react";

interface ChallengeMemberDetail {
  userId: string;
  nickname: string;
  email: string;
  hasInbody: boolean;
  lastInbodyDate: string | null;
  hasGoals: boolean;
}

interface ChallengeTeamDetail {
  teamId: string;
  teamName: string;
  members: ChallengeMemberDetail[];
}

interface ChallengeDetailWithMembers {
  challenge: Challenge;
  teams: ChallengeTeamDetail[];
  totalTeams: number;
  totalMembers: number;
}

const STATUS_CONFIG: Record<
  Challenge["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PREPARING: { label: "준비중", variant: "secondary" },
  ACTIVE: { label: "진행중", variant: "default" },
  COMPLETED: { label: "완료", variant: "outline" },
};

const PARTICIPANT_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  APPROVED: { label: "승인", variant: "default" },
  PENDING: { label: "대기", variant: "secondary" },
  REJECTED: { label: "거절", variant: "destructive" },
};

export default function ChallengeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [memberData, setMemberData] = useState<ChallengeDetailWithMembers | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editDurationDays, setEditDurationDays] = useState("28");
  const [editInbodyFrequencyDays, setEditInbodyFrequencyDays] = useState("7");
  const [editLoading, setEditLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  const fetchChallenge = useCallback(async () => {
    try {
      const data = await apiClient.get<Challenge>(`/api/admin/challenges/${id}`);
      setChallenge(data);
      setEditTitle(data.title);
      setEditDescription(data.description || "");
      setEditStartDate(data.startDate);
      setEditDurationDays(data.durationDays?.toString() || "28");
      setEditInbodyFrequencyDays(data.inbodyFrequencyDays?.toString() || "7");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "챌린지 정보를 불러올 수 없습니다"
      );
    }
  }, [id]);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await apiClient.get<ChallengeDetailWithMembers>(
        `/api/admin/challenges/${id}/members`
      );
      setMemberData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "참여 현황을 불러올 수 없습니다"
      );
    }
  }, [id]);

  const fetchParticipants = useCallback(async () => {
    try {
      const data = await apiClient.get<Participant[]>(
        `/api/admin/participants?challengeId=${id}`
      );
      setParticipants(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "개인 참여 현황을 불러올 수 없습니다"
      );
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchChallenge(), fetchMembers(), fetchParticipants()]);
      setLoading(false);
    };
    load();
  }, [fetchChallenge, fetchMembers, fetchParticipants]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      await apiClient.put(`/api/admin/challenges/${id}`, {
        title: editTitle,
        description: editDescription || null,
        startDate: editStartDate,
        durationDays: parseInt(editDurationDays),
        inbodyFrequencyDays: parseInt(editInbodyFrequencyDays),
      });
      toast.success("챌린지가 수정되었습니다.");
      setEditing(false);
      await fetchChallenge();
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "챌린지 수정에 실패했습니다"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!challenge) return;
    const url = `${window.location.origin}/join/${challenge.inviteCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("클립보드 복사에 실패했습니다");
    }
  };

  const participantStats = {
    total: participants.length,
    approved: participants.filter((p) => p.status === "APPROVED").length,
    pending: participants.filter((p) => p.status === "PENDING").length,
    rejected: participants.filter((p) => p.status === "REJECTED").length,
    teamAssigned: participants.filter((p) => p.hasTeam).length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/challenges">
            <ArrowLeft className="mr-2 h-4 w-4" />
            챌린지 목록
          </Link>
        </Button>
        <Card>
          <CardContent className="p-5">
            <Skeleton className="mb-3 h-6 w-1/3" />
            <Skeleton className="mb-2 h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/challenges">
            <ArrowLeft className="mr-2 h-4 w-4" />
            챌린지 목록
          </Link>
        </Button>
        <ErrorAlert message="챌린지를 찾을 수 없습니다." />
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[challenge.status];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/challenges">
          <ArrowLeft className="mr-2 h-4 w-4" />
          챌린지 목록
        </Link>
      </Button>

      {error && (
        <ErrorAlert message={error} onRetry={fetchChallenge} onDismiss={() => setError("")} />
      )}

      {/* Section 1: 기본 정보 */}
      <Card>
        <CardContent className="p-5">
          {!editing ? (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">
                    {challenge.title}
                  </h1>
                  <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                </div>
                {challenge.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {challenge.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {challenge.startDate} ~ {challenge.endDate}
                    {challenge.durationDays ? ` (${challenge.durationDays}일)` : ""}
                  </span>
                  {challenge.inbodyFrequencyDays && (
                    <span>인바디 주기: {challenge.inbodyFrequencyDays}일</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
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
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                수정
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEdit} className="space-y-4">
              <h2 className="text-lg font-semibold">챌린지 수정</h2>

              <div className="space-y-2">
                <Label htmlFor="editTitle">챌린지 이름 *</Label>
                <Input
                  id="editTitle"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">설명</Label>
                <Textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="editStartDate">시작일 *</Label>
                  <Input
                    id="editStartDate"
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDurationDays">챌린지 기간 (일) *</Label>
                  <Input
                    id="editDurationDays"
                    type="number"
                    required
                    min={1}
                    value={editDurationDays}
                    onChange={(e) => setEditDurationDays(e.target.value)}
                    placeholder="예: 28"
                  />
                  <p className="text-xs text-muted-foreground">
                    시작일로부터 {editDurationDays || 0}일 후 종료
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editInbodyFrequency">인바디 등록 주기</Label>
                <Select
                  value={editInbodyFrequencyDays}
                  onValueChange={setEditInbodyFrequencyDays}
                >
                  <SelectTrigger id="editInbodyFrequency">
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

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? "저장 중..." : "저장"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setEditTitle(challenge.title);
                    setEditDescription(challenge.description || "");
                    setEditStartDate(challenge.startDate);
                    setEditDurationDays(challenge.durationDays?.toString() || "28");
                    setEditInbodyFrequencyDays(challenge.inbodyFrequencyDays?.toString() || "7");
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  취소
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Section 2: 초대 링크 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">초대 링크</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-2 text-sm font-mono">
              {typeof window !== "undefined"
                ? `${window.location.origin}/join/${challenge.inviteCode}`
                : `/join/${challenge.inviteCode}`}
            </code>
            <Button size="sm" onClick={handleCopy} variant={copied ? "outline" : "default"}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  복사 완료
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  복사
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: 참여 현황 — Tabs */}
      <Tabs defaultValue="individual">
        <TabsList className="w-full">
          <TabsTrigger value="individual" className="flex-1">
            <Users className="mr-2 h-4 w-4" />
            개인 현황
          </TabsTrigger>
          <TabsTrigger value="team" className="flex-1">
            <Users className="mr-2 h-4 w-4" />
            팀별 현황
          </TabsTrigger>
        </TabsList>

        {/* Individual Tab */}
        <TabsContent value="individual" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">전체 참여자</p>
                <p className="mt-1 text-2xl font-bold">{participantStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">승인</p>
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  {participantStats.approved}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">대기</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {participantStats.pending}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">팀 배정</p>
                <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {participantStats.teamAssigned}
                </p>
              </CardContent>
            </Card>
          </div>

          {participants.length === 0 ? (
            <EmptyState
              title="참여자가 없습니다"
              description="초대 링크를 공유하여 참여자를 모집하세요."
            />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>닉네임</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>팀 배정</TableHead>
                      <TableHead>InBody</TableHead>
                      <TableHead>목표</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => {
                      const pStatusCfg = PARTICIPANT_STATUS_CONFIG[participant.status];
                      return (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">
                            {participant.nickname}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {participant.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant={pStatusCfg?.variant ?? "outline"}>
                              {pStatusCfg?.label ?? participant.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={participant.hasTeam ? "default" : "secondary"}>
                              {participant.hasTeam ? "팀 배정" : "미배정"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={participant.hasInbody ? "default" : "destructive"}>
                              {participant.hasInbody ? "입력 완료" : "미입력"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={participant.hasGoals ? "default" : "destructive"}>
                              {participant.hasGoals ? "설정됨" : "미설정"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">팀별 현황</h2>
            {memberData && (
              <span className="text-sm text-muted-foreground">
                ({memberData.totalTeams}팀 / {memberData.totalMembers}명)
              </span>
            )}
          </div>

          {!memberData || memberData.teams.length === 0 ? (
            <EmptyState
              title="참여 중인 팀이 없습니다"
              description="팀 관리 페이지에서 팀을 구성하세요."
            />
          ) : (
            <div className="space-y-3">
              {memberData.teams.map((team) => (
                <Card key={team.teamId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{team.teamName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>닉네임</TableHead>
                            <TableHead>이메일</TableHead>
                            <TableHead>InBody</TableHead>
                            <TableHead>목표</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {team.members.map((member) => (
                            <TableRow key={member.userId}>
                              <TableCell className="font-medium">
                                {member.nickname}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {member.email}
                              </TableCell>
                              <TableCell>
                                {member.hasInbody ? (
                                  <Badge variant="default" className="text-xs">
                                    완료
                                    {member.lastInbodyDate && (
                                      <span className="ml-1 opacity-70">
                                        ({member.lastInbodyDate})
                                      </span>
                                    )}
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">
                                    미입력
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={member.hasGoals ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {member.hasGoals ? "설정됨" : "미설정"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
