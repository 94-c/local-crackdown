"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type {
  GoalType,
  Team,
  InBodyRecord,
  UserGoal,
  UserProfile,
} from "@/lib/types";
import Image from "next/image";
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
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [goalTypes, setGoalTypes] = useState<GoalType[]>([]);

  // Step 1: Basic Profile
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [height, setHeight] = useState("");

  // Step 2: InBody
  const [weight, setWeight] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [fatMass, setFatMass] = useState("");
  const [recordDate, setRecordDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Step 3: Goals
  const [selectedGoals, setSelectedGoals] = useState<
    { goalTypeId: string; targetValue: string }[]
  >([]);

  const fatPercentage =
    weight && fatMass
      ? ((parseFloat(fatMass) / parseFloat(weight)) * 100).toFixed(1)
      : null;

  useEffect(() => {
    const init = async () => {
      try {
        const [teams, types, profile] = await Promise.all([
          apiClient.get<Team[]>("/api/teams/me"),
          apiClient.get<GoalType[]>("/api/goal-types"),
          apiClient.get<UserProfile>("/api/users/profile"),
        ]);

        if (teams.length > 0) {
          setChallengeId(teams[0].challengeId);
        } else {
          // 팀이 없으면 pendingChallengeId를 fallback으로 사용
          const pendingId = localStorage.getItem("pendingChallengeId");
          if (pendingId) {
            setChallengeId(pendingId);
          } else {
            setError("참여 중인 챌린지가 없습니다. 관리자에게 문의하세요.");
          }
        }
        setGoalTypes(types);

        // Auto-skip step 1 if basic profile is already filled
        if (profile.gender && profile.birthDate && profile.height) {
          setStep(2);
        }
      } catch {
        setError("데이터를 불러오는데 실패했습니다. 다시 시도해주세요.");
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, []);

  const handleProfileSubmit = async () => {
    if (!gender || !birthDate || !height) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiClient.put<UserProfile>("/api/users/profile", {
        gender,
        birthDate,
        height: parseFloat(height),
      });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로필 저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleInBodySubmit = async () => {
    if (!challengeId) return;
    setError("");
    setLoading(true);
    try {
      await apiClient.post<InBodyRecord>("/api/inbody", {
        challengeId,
        weight: parseFloat(weight),
        skeletalMuscleMass: parseFloat(muscleMass),
        bodyFatMass: parseFloat(fatMass),
        recordDate,
      });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "인바디 등록에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const toggleGoalType = (goalTypeId: string) => {
    setSelectedGoals((prev) => {
      const exists = prev.find((g) => g.goalTypeId === goalTypeId);
      if (exists) {
        return prev.filter((g) => g.goalTypeId !== goalTypeId);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, { goalTypeId, targetValue: "" }];
    });
  };

  const updateTargetValue = (goalTypeId: string, value: string) => {
    setSelectedGoals((prev) =>
      prev.map((g) =>
        g.goalTypeId === goalTypeId ? { ...g, targetValue: value } : g
      )
    );
  };

  const handleGoalsSubmit = async () => {
    if (!challengeId) return;
    if (selectedGoals.length === 0) {
      setError("최소 1개의 목표를 선택해주세요.");
      return;
    }
    const incomplete = selectedGoals.find((g) => !g.targetValue);
    if (incomplete) {
      setError("목표 수치를 모두 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      for (const goal of selectedGoals) {
        await apiClient.post<UserGoal>("/api/goals", {
          challengeId,
          goalTypeId: goal.goalTypeId,
          targetValue: parseFloat(goal.targetValue),
        });
      }
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "목표 설정에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const goToProfile = () => {
    window.location.href = "/profile";
  };

  if (initialLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={cn(
                  "text-xs font-medium transition-colors",
                  s <= step ? "text-primary" : "text-muted-foreground"
                )}
              >
                {s === 1 ? "기본정보" : s === 2 ? "인바디" : s === 3 ? "목표" : "완료"}
              </span>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Profile */}
        {step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <Image
                src="/images/mascot.png"
                alt="지방단속"
                width={100}
                height={100}
                priority
                className="mx-auto mb-2"
              />
              <CardTitle className="text-2xl">기초 정보 입력</CardTitle>
              <CardDescription>
                정확한 분석을 위해 기본 정보를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>성별</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={gender === "MALE" ? "default" : "outline"}
                    onClick={() => setGender("MALE")}
                    className="w-full"
                  >
                    남성
                  </Button>
                  <Button
                    type="button"
                    variant={gender === "FEMALE" ? "default" : "outline"}
                    onClick={() => setGender("FEMALE")}
                    className="w-full"
                  >
                    여성
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="birthDate">생년월일</Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="height">키 (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="예: 175.5"
                />
              </div>

              <Button
                type="button"
                onClick={handleProfileSubmit}
                disabled={loading || !gender || !birthDate || !height}
                className="w-full"
              >
                {loading ? "저장 중..." : "다음"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: InBody */}
        {step === 2 && (
          <Card>
            <CardHeader className="text-center">
              <Image
                src="/images/mascot.png"
                alt="지방단속"
                width={100}
                height={100}
                priority
                className="mx-auto mb-2"
              />
              <CardTitle className="text-2xl">시작 인바디 입력</CardTitle>
              <CardDescription>
                챌린지 시작 전 현재 체성분을 기록해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="recordDate">측정일</Label>
                <Input
                  id="recordDate"
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weight">체중 (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="예: 70.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="muscleMass">골격근량 (kg)</Label>
                <Input
                  id="muscleMass"
                  type="number"
                  step="0.1"
                  required
                  value={muscleMass}
                  onChange={(e) => setMuscleMass(e.target.value)}
                  placeholder="예: 28.3"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fatMass">체지방량 (kg)</Label>
                <Input
                  id="fatMass"
                  type="number"
                  step="0.1"
                  required
                  value={fatMass}
                  onChange={(e) => setFatMass(e.target.value)}
                  placeholder="예: 15.2"
                />
                {fatPercentage && (
                  <p className="text-sm text-muted-foreground">
                    체지방률:{" "}
                    <span className="font-medium text-primary">{fatPercentage}%</span>
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setError("");
                    setStep(1);
                  }}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  이전
                </Button>
                <Button
                  type="button"
                  onClick={handleInBodySubmit}
                  disabled={loading || !weight || !muscleMass || !fatMass || !challengeId}
                  className="flex-1"
                >
                  {loading ? "저장 중..." : "다음"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">목표 설정</CardTitle>
              <CardDescription>
                달성할 목표를 선택하고 수치를 입력하세요{" "}
                <Badge variant="outline" className="text-xs">최대 2개</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                {goalTypes.map((gt) => {
                  const selected = selectedGoals.find(
                    (g) => g.goalTypeId === gt.id
                  );
                  const isDisabled = !selected && selectedGoals.length >= 2;
                  return (
                    <div
                      key={gt.id}
                      className={cn(
                        "rounded-xl border p-4 transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : isDisabled
                            ? "border-border opacity-50"
                            : "border-border hover:border-primary/50"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => !isDisabled && toggleGoalType(gt.id)}
                        className="flex w-full items-center justify-between text-left"
                        disabled={isDisabled}
                      >
                        <div>
                          <span className="font-semibold">{gt.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({gt.unit})
                          </span>
                          {gt.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {gt.description}
                            </p>
                          )}
                        </div>
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground"
                          )}
                        >
                          {selected && <Check className="h-3 w-3" />}
                        </div>
                      </button>

                      {selected && (
                        <div className="mt-3 space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            목표 수치 ({gt.unit})
                            {gt.directionIsDecrease && (
                              <span className="ml-1 text-blue-600 dark:text-blue-400">
                                (감소 목표)
                              </span>
                            )}
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={selected.targetValue}
                            onChange={(e) =>
                              updateTargetValue(gt.id, e.target.value)
                            }
                            placeholder={`목표 ${gt.unit}`}
                            className="h-9 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setError("");
                    setStep(2);
                  }}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  이전
                </Button>
                <Button
                  type="button"
                  onClick={handleGoalsSubmit}
                  disabled={loading || selectedGoals.length === 0}
                  className="flex-1"
                >
                  {loading ? "저장 중..." : "완료"}
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center">
              <Image
                src="/images/mascot.png"
                alt="지방단속"
                width={160}
                height={160}
                className="mx-auto mb-4"
              />
              <PartyPopper className="mb-3 h-10 w-10 text-primary" />
              <h1 className="text-2xl font-bold">설정 완료!</h1>
              <p className="mt-2 text-muted-foreground">
                인바디 기록과 목표가 등록되었습니다.
                <br />
                이제 챌린지를 시작할 준비가 되었어요!
              </p>
              <Button
                type="button"
                onClick={goToProfile}
                className="mt-6 w-full"
              >
                내 프로필 보기
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
