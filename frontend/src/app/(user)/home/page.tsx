"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { logout } from "@/lib/auth";
import type { Team, Achievement, UserWeeklyResult, UserProfile, InBodyRecord } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { LoadingSkeleton, ErrorAlert, EmptyState, ProgressBar } from "@/components/ui";
import OnboardingModal from "@/components/OnboardingModal";

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const getNextSundayEnd = () => {
      const now = new Date();
      // Convert to KST (UTC+9)
      const kstOffset = 9 * 60 * 60 * 1000;
      const utcNow = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
      const kstNow = new Date(utcNow + kstOffset);

      const dayOfWeek = kstNow.getDay(); // 0=Sunday
      let daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

      // Target: next Sunday 23:59:59 KST
      const target = new Date(kstNow);
      target.setDate(target.getDate() + daysUntilSunday);
      target.setHours(23, 59, 59, 0);

      // If it's already Sunday past 23:59:59, go to next Sunday
      if (dayOfWeek === 0 && kstNow >= target) {
        target.setDate(target.getDate() + 7);
      }

      // Convert target back to local time for diff calculation
      const targetUtc = target.getTime() - kstOffset;
      const targetLocal = new Date(targetUtc - now.getTimezoneOffset() * 60 * 1000);

      const diff = targetLocal.getTime() - now.getTime();
      return Math.max(0, diff);
    };

    const update = () => {
      const diff = getNextSundayEnd();
      const seconds = Math.floor(diff / 1000) % 60;
      const minutes = Math.floor(diff / (1000 * 60)) % 60;
      const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      setTimeLeft({ days, hours, minutes, seconds });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

export default function HomePage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [latestResult, setLatestResult] = useState<UserWeeklyResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nickname, setNickname] = useState("");
  const [pendingChallengeId, setPendingChallengeId] = useState<string | null>(
    null
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingChallengeId, setOnboardingChallengeId] = useState<string | null>(null);

  const countdown = useCountdown();

  const checkOnboardingNeeded = useCallback(async (cId: string) => {
    try {
      const [profile, inbodyRecords, goalsAchievement] = await Promise.all([
        apiClient.get<UserProfile>("/api/users/profile"),
        apiClient.get<InBodyRecord[]>(`/api/inbody?challengeId=${cId}`),
        apiClient.get<Achievement[]>(`/api/goals/achievement?challengeId=${cId}`),
      ]);

      const profileIncomplete = !profile.gender || !profile.birthDate || !profile.height;
      const noInbody = inbodyRecords.length === 0;
      const noGoals = goalsAchievement.length === 0;

      if (profileIncomplete || noInbody || noGoals) {
        setNeedsOnboarding(true);
        setOnboardingChallengeId(cId);
        setShowOnboarding(true);
      }
    } catch {
      // If check fails, don't block the user — they can still use the app
    }
  }, []);

  const fetchData = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const me = await apiClient.get<{ nickname: string }>("/api/auth/me");
      setNickname(me.nickname);

      const teams = await apiClient.get<Team[]>("/api/teams/me");
      if (teams.length > 0) {
        setTeam(teams[0]);
        // pendingChallengeId가 있으면 팀 배정 후이므로 제거
        localStorage.removeItem("pendingChallengeId");

        const achData = await apiClient.get<Achievement[]>(
          `/api/goals/achievement?challengeId=${teams[0].challengeId}`
        );
        setAchievements(achData);

        // 최신 주간 결과 가져오기
        try {
          const weeklyResults = await apiClient.get<UserWeeklyResult[]>(
            `/api/weekly-results/me?challengeId=${teams[0].challengeId}`
          );
          if (weeklyResults.length > 0) {
            setLatestResult(weeklyResults[weeklyResults.length - 1]);
          }
        } catch {
          // 주간 결과가 아직 없을 수 있음
        }

        // Check if onboarding is needed
        await checkOnboardingNeeded(teams[0].challengeId);
      } else {
        // 팀이 없으면 pendingChallengeId 확인
        const pending = localStorage.getItem("pendingChallengeId");
        if (pending) {
          setPendingChallengeId(pending);
          // Even without a team, check onboarding with pendingChallengeId
          await checkOnboardingNeeded(pending);
        }
      }
    } catch {
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [checkOnboardingNeeded]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
    setShowOnboarding(false);
    // Refresh data to show updated achievements
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {nickname ? `${nickname}님` : "안녕하세요"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            오늘도 화이팅!
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          로그아웃
        </button>
      </div>

      {error && (
        <ErrorAlert message={error} onRetry={fetchData} />
      )}

      {!team ? (
        <div className="space-y-4">
          {pendingChallengeId ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
              <Image
                src="/images/mascot.png"
                alt="지방단속"
                width={100}
                height={100}
                className="mx-auto"
              />
              <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                참여 신청 완료
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                관리자 승인 후 팀이 배정됩니다. 먼저 온보딩을 진행해주세요.
              </p>
              {needsOnboarding ? (
                <button
                  type="button"
                  onClick={() => setShowOnboarding(true)}
                  className="mt-4 inline-block rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  온보딩 시작
                </button>
              ) : (
                <p className="mt-4 text-sm font-medium text-green-600 dark:text-green-400">
                  온보딩 완료! 팀 배정을 기다려주세요.
                </p>
              )}
            </div>
          ) : (
            !error && (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 dark:border-gray-700">
                <EmptyState
                  title="아직 배정된 팀이 없습니다"
                  description="관리자가 팀을 배정하면 챌린지가 시작됩니다."
                  action={{
                    label: "온보딩 시작하기",
                    onClick: () => {
                      window.location.href = "/onboarding";
                    },
                  }}
                />
              </div>
            )
          )}
        </div>
      ) : (
        <>
          {/* 팀 정보 카드 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              내 팀
            </h2>
            <p className="mt-1 text-lg font-bold">{team.name}</p>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>{team.member1.nickname}</p>
              {team.member2 && <p>{team.member2.nickname}</p>}
            </div>
          </div>

          {/* 주간 마감 카운트다운 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              주간 마감까지
            </h2>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-gray-50 px-2 py-3 dark:bg-gray-800">
                <p className="text-2xl font-bold tabular-nums">
                  {countdown.days}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  일
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 px-2 py-3 dark:bg-gray-800">
                <p className="text-2xl font-bold tabular-nums">
                  {String(countdown.hours).padStart(2, "0")}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  시간
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 px-2 py-3 dark:bg-gray-800">
                <p className="text-2xl font-bold tabular-nums">
                  {String(countdown.minutes).padStart(2, "0")}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  분
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 px-2 py-3 dark:bg-gray-800">
                <p className="text-2xl font-bold tabular-nums">
                  {String(countdown.seconds).padStart(2, "0")}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  초
                </p>
              </div>
            </div>
          </div>

          {/* 최신 주간 결과 */}
          {latestResult && (
            <Link href="/result" className="block">
              <div className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {latestResult.weekNumber}주차 결과
                  </h2>
                  {latestResult.isBottomTeam && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      하위팀
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      내 달성률
                    </p>
                    <p className="mt-0.5 text-lg font-bold">
                      {Number(latestResult.achievementRate).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      팀 점수
                    </p>
                    <p className="mt-0.5 text-lg font-bold">
                      {Number(latestResult.teamScore).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      팀 순위
                    </p>
                    <p className="mt-0.5 text-lg font-bold">
                      {latestResult.teamRank}위
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
                  전체 결과 보기 →
                </p>
              </div>
            </Link>
          )}

          {/* 달성률 요약 */}
          {achievements.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                내 달성률
              </h2>
              {achievements.map((a) => (
                <div
                  key={a.goalTypeName}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {a.goalTypeName}
                    </span>
                    <span className="text-sm font-bold">
                      {a.achievementRate.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={a.achievementRate}
                    showLabel={false}
                    className="mt-2"
                  />
                  <div className="mt-1 flex justify-between text-xs text-gray-400">
                    <span>
                      시작 {a.startValue}
                      {a.unit}
                    </span>
                    <span>
                      현재 {a.currentValue}
                      {a.unit}
                    </span>
                    <span>
                      목표 {a.targetValue}
                      {a.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 dark:border-gray-700">
              <EmptyState
                title="아직 목표가 설정되지 않았습니다"
                action={{
                  label: "온보딩 시작",
                  onClick: () => {
                    if (needsOnboarding && onboardingChallengeId) {
                      setShowOnboarding(true);
                    } else {
                      window.location.href = "/onboarding";
                    }
                  },
                }}
              />
            </div>
          )}

          {/* 빠른 메뉴 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/profile"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            >
              <p className="text-2xl">📊</p>
              <p className="mt-1 text-sm font-medium">인바디 기록</p>
            </Link>
            <Link
              href="/team"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            >
              <p className="text-2xl">👥</p>
              <p className="mt-1 text-sm font-medium">팀 미션</p>
            </Link>
          </div>
        </>
      )}

      {/* Onboarding Modal */}
      {onboardingChallengeId && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          challengeId={onboardingChallengeId}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}
