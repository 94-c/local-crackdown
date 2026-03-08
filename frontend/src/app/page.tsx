"use client";

import { useEffect, useState } from "react";
import { getToken, isAdmin } from "@/lib/auth";
import { Spinner } from "@/components/ui";
import { Card, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Separator } from "@/components/ui";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

export default function LandingPage() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      window.location.href = isAdmin(token) ? "/admin" : "/home";
      return;
    }
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <Image
              src="/images/mascot.png"
              alt="지방단속 마스코트"
              width={160}
              height={160}
              priority
              className="mx-auto"
            />
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">지방단속</h1>
              <p className="text-sm text-muted-foreground">
                4주 챌린지로 목표를 달성하세요
              </p>
            </div>

            <Separator className="w-full" />

            <div className={cn("flex flex-col gap-3 w-full")}>
              <Button asChild className="w-full" size="lg">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  로그인
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  회원가입
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
