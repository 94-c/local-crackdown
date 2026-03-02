"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Team, TeamMission, Verification } from "@/lib/types";
import { LoadingSkeleton, ErrorAlert, EmptyState, ProgressBar, useToast } from "@/components/ui";

export default function VerifyPage() {
  const toast = useToast();
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <LoadingSkeleton variant="form" count={1} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">미션 인증</h1>

      {error && (
        <ErrorAlert message={error} />
      )}

      {team && !mission && (
        <EmptyState
          title="이번 주 팀 미션이 없습니다"
          description="팀 탭에서 먼저 미션을 생성해주세요."
        />
      )}

      {mission && (
        <>
          {/* Current Mission Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
                {weekNumber}주차
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  mission.status === "COMPLETED"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : mission.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {mission.status === "COMPLETED"
                  ? "완료"
                  : mission.status === "IN_PROGRESS"
                    ? "진행중"
                    : mission.status}
              </span>
            </div>
            <h2 className="mt-3 text-lg font-bold">
              {mission.missionTemplateName}
            </h2>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              현재 {mission.currentValue} / {mission.targetValue}{" "}
              {mission.unit}
            </div>
            <ProgressBar
              value={
                mission.targetValue > 0
                  ? Math.min(
                      Math.round(
                        (mission.currentValue / mission.targetValue) * 100
                      ),
                      100
                    )
                  : 0
              }
              showLabel
              className="mt-2"
            />
          </div>

          {/* Verification Form */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold">인증 등록</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              미션 수행을 인증하세요.
            </p>

            <form
              onSubmit={handleSubmitVerification}
              className="mt-4 space-y-4"
            >
              {submitError && (
                <ErrorAlert message={submitError} />
              )}

              <div>
                <label htmlFor="verify-memo" className="block text-sm font-medium">
                  메모
                </label>
                <input
                  id="verify-memo"
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="인증 내용을 간단히 적어주세요"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">이미지</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800 dark:file:bg-white dark:file:text-black"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="mt-2 h-32 w-32 rounded-lg object-cover"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={submitLoading || uploadingImage}
                className="w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {uploadingImage
                  ? "이미지 업로드 중..."
                  : submitLoading
                    ? "등록 중..."
                    : "인증 등록"}
              </button>
            </form>
          </div>

          {/* Verifications List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              인증 기록{" "}
              {mission.verifications && mission.verifications.length > 0 && (
                <span>({mission.verifications.length})</span>
              )}
            </h3>

            {!mission.verifications || mission.verifications.length === 0 ? (
              <EmptyState
                title="아직 인증 기록이 없습니다"
                description="위 폼에서 미션 인증을 등록해보세요."
              />
            ) : (
              mission.verifications.map((v) => (
                <div
                  key={v.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {v.userNickname}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          v.verified
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {v.verified ? "인증됨" : "대기중"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(v.createdAt)}
                      </span>
                    </div>
                  </div>
                  {v.memo && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {v.memo}
                    </p>
                  )}
                  {v.imageUrl && v.imageUrl !== "placeholder-image-url" && (
                    <img
                      src={v.imageUrl}
                      alt="인증 이미지"
                      className="mt-2 h-24 w-24 rounded-lg object-cover"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
