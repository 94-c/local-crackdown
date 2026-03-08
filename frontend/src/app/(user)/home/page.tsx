"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { logout } from "@/lib/auth";
import type {
  Team,
  Achievement,
  UserWeeklyResult,
  UserProfile,
  InBodyRecord,
} from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Button,
  Skeleton,
} from "@/components/ui";
import OnboardingModal from "@/components/OnboardingModal";
import {
  Bell,
  LogOut,
  Users,
  Clock,
  TrendingUp,
  Trophy,
  ChevronRight,
  Activity,
  Target,
  ClipboardList,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const getNextSundayEnd = () => {
      const now = new Date();
      // Convert to KST (UTC+9)
      const kstOffset = 9 * 60 * 60 * 1000;
      const utcNow = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
      const kstNow = new Date(utcNow + kstOffset);

      const dayOfWeek = kstNow.getDay(); // 0=Sunday
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

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
      const targetLocal = new Date(
        targetUtc - now.getTimezoneOffset() * 60 * 1000
      );

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
  const [onboardingChallengeId, setOnboardingChallengeId] = useState<
    string | null
  >(null);

  const countdown = useCountdown();

  const checkOnboardingNeeded = useCallback(async (cId: string) => {
    try {
      const [profile, inbodyRecords, goalsAchievement] = await Promise.all([
        apiClient.get<UserProfile>("/api/users/profile"),
        apiClient.get<InBodyRecord[]>(`/api/inbody?challengeId=${cId}`),
        apiClient.get<Achievement[]>(
          `/api/goals/achievement?challengeId=${cId}`
        ),
      ]);

      const profileIncomplete =
        !profile.gender || !profile.birthDate || !profile.height;
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
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">지방단속</h1>
            <p className="text-xs text-muted-foreground">
              {nickname ? `${nickname}님` : "안녕하세요"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/notifications" className="relative">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-4 pb-24">
        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <p className="flex-1 text-sm text-destructive">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchData}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {!team ? (
          /* No Team State */
          <div className="space-y-4">
            {pendingChallengeId ? (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <Image
                    src="/images/mascot.png"
                    alt="지방단속"
                    width={100}
                    height={100}
                    className="mx-auto"
                  />
                  <Badge variant="secondary" className="mt-4">
                    참여 신청 완료
                  </Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    관리자 승인 후 팀이 배정됩니다. 먼저 온보딩을 진행해주세요.
                  </p>
                  {needsOnboarding ? (
                    <Button
                      className="mt-4"
                      onClick={() => setShowOnboarding(true)}
                    >
                      온보딩 시작
                    </Button>
                  ) : (
                    <p className="mt-4 text-sm font-medium text-green-600 dark:text-green-400">
                      온보딩 완료! 팀 배정을 기다려주세요.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              !error && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-3 font-semibold text-foreground">
                      아직 배정된 팀이 없습니다
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      관리자가 팀을 배정하면 챌린지가 시작됩니다.
                    </p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => {
                        window.location.href = "/onboarding";
                      }}
                    >
                      온보딩 시작하기
                    </Button>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        ) : (
          <>
            {/* Team Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    내 팀
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xl font-bold text-foreground">{team.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{team.member1.nickname}</Badge>
                  {team.member2 && (
                    <Badge variant="secondary">{team.member2.nickname}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Countdown Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-medium text-primary">
                    주간 마감까지
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg bg-background/70 px-2 py-3">
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {countdown.days}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">일</p>
                  </div>
                  <div className="rounded-lg bg-background/70 px-2 py-3">
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {String(countdown.hours).padStart(2, "0")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">시간</p>
                  </div>
                  <div className="rounded-lg bg-background/70 px-2 py-3">
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {String(countdown.minutes).padStart(2, "0")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">분</p>
                  </div>
                  <div className="rounded-lg bg-background/70 px-2 py-3">
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {String(countdown.seconds).padStart(2, "0")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">초</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Latest Weekly Result */}
            {latestResult && (
              <Link href="/result" className="block">
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {latestResult.weekNumber}주차 결과
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {latestResult.isBottomTeam && (
                          <Badge variant="destructive">하위팀</Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">
                          내 달성률
                        </p>
                        <p className="mt-1 text-lg font-bold text-foreground">
                          {Number(latestResult.achievementRate).toFixed(1)}%
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">팀 점수</p>
                        <p className="mt-1 text-lg font-bold text-foreground">
                          {Number(latestResult.teamScore).toFixed(1)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">팀 순위</p>
                        <p className="mt-1 text-lg font-bold text-foreground">
                          {latestResult.teamRank}위
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Achievement Summary */}
            {achievements.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    내 달성률
                  </h2>
                </div>
                {achievements.map((a) => (
                  <Card key={a.goalTypeName}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {a.goalTypeName}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {a.achievementRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, a.achievementRate)}
                        className="mt-3 h-2"
                      />
                      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Target className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">
                    아직 목표가 설정되지 않았습니다
                  </h3>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      if (needsOnboarding && onboardingChallengeId) {
                        setShowOnboarding(true);
                      } else {
                        window.location.href = "/onboarding";
                      }
                    }}
                  >
                    온보딩 시작
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Links */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <ClipboardList className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">
                  바로가기
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/profile">
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          인바디 기록
                        </p>
                        <p className="text-xs text-muted-foreground">
                          체성분 확인
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/team">
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          팀 미션
                        </p>
                        <p className="text-xs text-muted-foreground">
                          미션 현황
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

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
