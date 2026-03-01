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
import { LoadingSkeleton, ErrorAlert } from "@/components/ui";

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
            setError(
              "참여 중인 챌린지가 없습니다. 관리자에게 문의하세요."
            );
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
      setError(
        err instanceof Error ? err.message : "프로필 저장에 실패했습니다"
      );
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
      setError(
        err instanceof Error ? err.message : "인바디 등록에 실패했습니다"
      );
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
      setError(
        err instanceof Error ? err.message : "목표 설정에 실패했습니다"
      );
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
        <div className="w-full max-w-md">
          <LoadingSkeleton variant="form" count={1} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Progress Indicator — 4 steps */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-colors ${
                s <= step
                  ? "bg-black dark:bg-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Profile */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <Image
                src="/images/mascot.png"
                alt="지방단속"
                width={100}
                height={100}
                priority
                className="mx-auto"
              />
              <h1 className="mt-4 text-2xl font-bold">기초 정보 입력</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                정확한 분석을 위해 기본 정보를 입력해주세요
              </p>
            </div>

            {error && (
              <ErrorAlert message={error} />
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">성별</label>
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("MALE")}
                    className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                      gender === "MALE"
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    }`}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("FEMALE")}
                    className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                      gender === "FEMALE"
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    }`}
                  >
                    여성
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="birthDate"
                  className="block text-sm font-medium"
                >
                  생년월일
                </label>
                <input
                  id="birthDate"
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium">
                  키 (cm)
                </label>
                <input
                  id="height"
                  type="number"
                  step="0.1"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                  placeholder="예: 175.5"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleProfileSubmit}
              disabled={loading || !gender || !birthDate || !height}
              className="w-full rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {loading ? "저장 중..." : "다음"}
            </button>
          </div>
        )}

        {/* Step 2: InBody */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <Image
                src="/images/mascot.png"
                alt="지방단속"
                width={100}
                height={100}
                priority
                className="mx-auto"
              />
              <h1 className="mt-4 text-2xl font-bold">시작 인바디 입력</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                챌린지 시작 전 현재 체성분을 기록해주세요
              </p>
            </div>

            {error && (
              <ErrorAlert message={error} />
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="recordDate"
                  className="block text-sm font-medium"
                >
                  측정일
                </label>
                <input
                  id="recordDate"
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium">
                  체중 (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                  placeholder="예: 70.5"
                />
              </div>

              <div>
                <label
                  htmlFor="muscleMass"
                  className="block text-sm font-medium"
                >
                  골격근량 (kg)
                </label>
                <input
                  id="muscleMass"
                  type="number"
                  step="0.1"
                  required
                  value={muscleMass}
                  onChange={(e) => setMuscleMass(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                  placeholder="예: 28.3"
                />
              </div>

              <div>
                <label htmlFor="fatMass" className="block text-sm font-medium">
                  체지방량 (kg)
                </label>
                <input
                  id="fatMass"
                  type="number"
                  step="0.1"
                  required
                  value={fatMass}
                  onChange={(e) => setFatMass(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
                  placeholder="예: 15.2"
                />
                {fatPercentage && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    체지방률: {fatPercentage}%
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="flex-1 rounded-lg border border-gray-300 px-6 py-3 transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleInBodySubmit}
                disabled={
                  loading ||
                  !weight ||
                  !muscleMass ||
                  !fatMass ||
                  !challengeId
                }
                className="flex-1 rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {loading ? "저장 중..." : "다음"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">목표 설정</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                달성할 목표를 선택하고 수치를 입력하세요 (최대 2개)
              </p>
            </div>

            {error && (
              <ErrorAlert message={error} />
            )}

            <div className="space-y-3">
              {goalTypes.map((gt) => {
                const selected = selectedGoals.find(
                  (g) => g.goalTypeId === gt.id
                );
                return (
                  <div
                    key={gt.id}
                    className={`rounded-xl border p-4 transition ${
                      selected
                        ? "border-black bg-gray-50 dark:border-white dark:bg-gray-800"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleGoalType(gt.id)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <div>
                        <span className="font-semibold">{gt.name}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({gt.unit})
                        </span>
                        {gt.description && (
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {gt.description}
                          </p>
                        )}
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                          selected
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {selected && (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </button>

                    {selected && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          목표 수치 ({gt.unit})
                          {gt.directionIsDecrease && (
                            <span className="ml-1 text-blue-600 dark:text-blue-400">
                              (감소 목표)
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={selected.targetValue}
                          onChange={(e) =>
                            updateTargetValue(gt.id, e.target.value)
                          }
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:focus:border-white"
                          placeholder={`목표 ${gt.unit}`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(2);
                }}
                className="flex-1 rounded-lg border border-gray-300 px-6 py-3 transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleGoalsSubmit}
                disabled={loading || selectedGoals.length === 0}
                className="flex-1 rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {loading ? "저장 중..." : "완료"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <Image
              src="/images/mascot.png"
              alt="지방단속"
              width={160}
              height={160}
              className="mx-auto"
            />
            <div>
              <h1 className="text-2xl font-bold">설정 완료!</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                인바디 기록과 목표가 등록되었습니다.
                <br />
                이제 챌린지를 시작할 준비가 되었어요!
              </p>
            </div>
            <button
              type="button"
              onClick={goToProfile}
              className="w-full rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              내 프로필 보기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
