"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import { Spinner } from "@/components/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Separator } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ChallengeInvite } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, CalendarDays, AlertCircle } from "lucide-react";

export default function JoinPage() {
  const params = useParams();
  const code = params.code as string;

  const [challenge, setChallenge] = useState<ChallengeInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const hasToken = !!getToken();

  useEffect(() => {
    // 비로그인 시 로그인 페이지로 자동 리다이렉트
    if (!hasToken) {
      window.location.href = `/login?invite=${code}`;
      return;
    }

    const fetchInvite = async () => {
      try {
        const data = await apiClient.get<ChallengeInvite>(
          `/api/challenges/invite/${code}`
        );
        setChallenge(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "유효하지 않은 초대 코드입니다."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [code, hasToken]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "PREPARING":
        return "준비 중";
      case "ACTIVE":
        return "진행 중";
      case "COMPLETED":
        return "종료";
      default:
        return status;
    }
  };

  const statusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "PREPARING":
        return "secondary";
      case "ACTIVE":
        return "default";
      case "COMPLETED":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleJoin = async () => {
    if (!challenge) return;
    setJoining(true);
    try {
      const result = await apiClient.post<{ status: string }>(
        `/api/challenges/${challenge.id}/join`,
        {}
      );
      localStorage.setItem("pendingChallengeId", challenge.id);
      if (result.status === "APPROVED") {
        window.location.href = "/onboarding";
      } else {
        window.location.href = "/home";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "참가 등록에 실패했습니다."
      );
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <Skeleton className="mx-auto h-20 w-20 rounded-full" />
            <Skeleton className="mx-auto mt-4 h-6 w-40" />
            <Skeleton className="mx-auto mt-2 h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <Image
                src="/images/mascot.png"
                alt="지방단속"
                width={80}
                height={80}
                className="mx-auto"
              />
            </div>
            <CardTitle className="text-xl">초대 오류</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <Image
              src="/images/mascot.png"
              alt="지방단속"
              width={80}
              height={80}
              priority
            />
          </div>
          <CardTitle className="text-2xl">지방단속</CardTitle>
          <CardDescription>챌린지에 초대되었습니다</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {challenge && (
            <div
              className={cn(
                "rounded-lg border bg-card p-4 space-y-3"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold leading-tight">
                  {challenge.title}
                </h2>
                <Badge variant={statusVariant(challenge.status)} className="shrink-0">
                  {statusLabel(challenge.status)}
                </Badge>
              </div>

              {challenge.description && (
                <p className="text-sm text-muted-foreground">
                  {challenge.description}
                </p>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    시작일
                  </span>
                  <span className="font-medium">
                    {formatDate(challenge.startDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    종료일
                  </span>
                  <span className="font-medium">
                    {formatDate(challenge.endDate)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={handleJoin}
            disabled={joining}
            className="w-full"
            size="lg"
          >
            {joining ? (
              <>
                <Spinner size="sm" className="mr-2" />
                참가 중...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                참가하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
