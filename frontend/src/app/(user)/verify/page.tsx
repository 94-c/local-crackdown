"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import type { Team, TeamMission, Verification } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Progress,
  Button,
  Input,
  Label,
  Textarea,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Camera, Upload, Check, Trash2, ImageIcon } from "lucide-react";

export default function VerifyPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [mission, setMission] = useState<TeamMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Verification form
  const [memo, setMemo] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [weekNumber, setWeekNumber] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMission = useCallback(
    async (teamId: string, challengeId: string) => {
      try {
        const missions = await apiClient.get<TeamMission[]>(
          `/api/team-missions?teamId=${teamId}&challengeId=${challengeId}`
        );
        if (missions.length > 0) {
          const latestWeek = Math.max(...missions.map((m) => m.weekNumber));
          setWeekNumber(latestWeek);
          const currentMission = missions.find(
            (m) => m.weekNumber === latestWeek
          );
          setMission(currentMission || null);
        } else {
          setMission(null);
        }
      } catch {
        setMission(null);
      }
    },
    []
  );

  useEffect(() => {
    const init = async () => {
      try {
        const teams = await apiClient.get<Team[]>("/api/teams/me");
        if (teams.length > 0) {
          setTeam(teams[0]);
          await fetchMission(teams[0].id, teams[0].challengeId);
        } else {
          setError("참여 중인 팀이 없습니다.");
        }
      } catch {
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchMission]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteVerification = async (verificationId: string) => {
    if (!confirm("이 인증 기록을 삭제하시겠습니까?")) return;
    try {
      await apiClient.delete(`/api/verifications/${verificationId}`);
      setMission((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          verifications: prev.verifications.filter((v) => v.id !== verificationId),
        };
      });
      toast.success("인증 기록이 삭제되었습니다.");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission) return;

    setSubmitError("");
    setSubmitLoading(true);
    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        setUploadingImage(true);
        try {
          const presigned = await apiClient.post<{
            uploadUrl: string;
            fileUrl: string;
            key: string;
          }>("/api/storage/presigned-url", {
            contentType: imageFile.type,
            folder: "verifications",
          });

          await fetch(presigned.uploadUrl, {
            method: "PUT",
            body: imageFile,
            headers: { "Content-Type": imageFile.type },
          });

          imageUrl = presigned.fileUrl;
        } catch {
          // Image upload failed, continue without image
        } finally {
          setUploadingImage(false);
        }
      }

      const newVerification = await apiClient.post<Verification>(
        "/api/verifications",
        {
          teamMissionId: mission.id,
          memo: memo || null,
          imageUrl,
        }
      );
      // Optimistically add to local state
      setMission((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          verifications: [...(prev.verifications || []), newVerification],
        };
      });
      setMemo("");
      setImageFile(null);
      setImagePreview(null);
      toast.success("인증이 등록되었습니다!");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "인증 등록에 실패했습니다."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMissionStatusBadge = (status: string) => {
    if (status === "COMPLETED") return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">완료</Badge>;
    if (status === "IN_PROGRESS") return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">진행중</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const progressValue =
    mission && mission.targetValue > 0
      ? Math.min(Math.round((mission.currentValue / mission.targetValue) * 100), 100)
      : 0;

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">미션 인증</h1>
          {mission && (
            <Badge variant="outline" className="ml-auto">
              {weekNumber}주차
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {team && !mission && (
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center">
              <Camera className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">이번 주 팀 미션이 없습니다</p>
              <p className="mt-1 text-sm text-muted-foreground">
                팀 탭에서 먼저 미션을 생성해주세요.
              </p>
            </CardContent>
          </Card>
        )}

        {mission && (
          <>
            {/* Current Mission Info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{mission.missionTemplateName}</CardTitle>
                  {getMissionStatusBadge(mission.status)}
                </div>
                <CardDescription>
                  현재 {mission.currentValue} / {mission.targetValue} {mission.unit}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progressValue} className="h-2" />
                <p className="mt-1.5 text-right text-xs text-muted-foreground">{progressValue}%</p>
              </CardContent>
            </Card>

            {/* Verification Form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">인증 등록</CardTitle>
                <CardDescription>미션 수행을 인증하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitVerification} className="space-y-4">
                  {submitError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2">
                      <p className="text-sm text-destructive">{submitError}</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="verify-memo">메모</Label>
                    <Textarea
                      id="verify-memo"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="인증 내용을 간단히 적어주세요"
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>이미지</Label>
                    {/* Dashed upload area */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors",
                        imagePreview
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="미리보기"
                          className="h-32 w-32 rounded-lg object-cover"
                        />
                      ) : (
                        <>
                          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-sm font-medium">이미지 업로드</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            클릭하여 사진을 선택하세요
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        이미지 제거
                      </Button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitLoading || uploadingImage}
                    className="w-full"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {uploadingImage
                      ? "이미지 업로드 중..."
                      : submitLoading
                        ? "등록 중..."
                        : "인증 등록"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Verifications List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">인증 기록</h3>
                {mission.verifications && mission.verifications.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {mission.verifications.length}
                  </Badge>
                )}
              </div>

              {!mission.verifications || mission.verifications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-8 text-center">
                    <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">아직 인증 기록이 없습니다</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      위 폼에서 미션 인증을 등록해보세요.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                mission.verifications.map((v) => (
                  <Card
                    key={v.id}
                    className={cn(
                      "transition-colors",
                      !v.verified && "border-primary/20 bg-primary/5"
                    )}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{v.userNickname}</span>
                        <div className="flex items-center gap-2">
                          {v.verified ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs">
                              인증됨
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 text-xs">
                              대기중
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(v.createdAt)}
                          </span>
                          {!v.verified && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteVerification(v.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {v.memo && (
                        <p className="mt-2 text-sm text-muted-foreground">{v.memo}</p>
                      )}
                      {v.imageUrl && v.imageUrl !== "placeholder-image-url" && (
                        <img
                          src={v.imageUrl}
                          alt="인증 이미지"
                          className="mt-2 h-24 w-24 rounded-lg object-cover"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
