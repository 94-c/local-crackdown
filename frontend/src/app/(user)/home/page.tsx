"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { logout } from "@/lib/auth";
import type { Team, Achievement, UserWeeklyResult } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [latestResult, setLatestResult] = useState<UserWeeklyResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const me = await apiClient.get<{ nickname: string }>("/api/auth/me");
        setNickname(me.nickname);

        const teams = await apiClient.get<Team[]>("/api/teams/me");
        if (teams.length > 0) {
          setTeam(teams[0]);
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
        }
      } catch {
        // 팀 미배정 상태일 수 있음
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500 dark:text-gray-400">로딩 중...</p>
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

      {!team ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <Image
            src="/images/mascot.png"
            alt="지방단속"
            width={100}
            height={100}
            className="mx-auto"
          />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            아직 배정된 팀이 없습니다.
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            관리자가 팀을 배정하면 챌린지가 시작됩니다.
          </p>
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
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-black transition-all dark:bg-white"
                      style={{
                        width: `${Math.min(a.achievementRate, 100)}%`,
                      }}
                    />
                  </div>
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
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                아직 목표가 설정되지 않았습니다.
              </p>
              <Link
                href="/onboarding"
                className="mt-3 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                온보딩 시작
              </Link>
            </div>
          )}

          {/* 빠른 메뉴 */}
          <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
}
