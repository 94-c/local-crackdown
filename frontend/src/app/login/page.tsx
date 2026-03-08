"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { isAdmin } from "@/lib/auth";
import { Spinner } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Separator } from "@/components/ui";
import { validateEmail, validatePassword } from "@/lib/validation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiClient.post<{ accessToken: string }>(
        "/api/auth/login",
        { email, password }
      );
      localStorage.setItem("token", data.accessToken);

      if (invite) {
        window.location.href = `/join/${invite}`;
      } else {
        window.location.href = isAdmin(data.accessToken) ? "/admin" : "/home";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "로그인에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  const signupHref = invite ? `/signup?invite=${invite}` : "/signup";

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
          <CardDescription>팀 바디 챌린지</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() =>
                    setFieldErrors((prev) => ({
                      ...prev,
                      email: validateEmail(email),
                    }))
                  }
                  className={cn(
                    "pl-10",
                    fieldErrors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder="email@example.com"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() =>
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: validatePassword(password),
                    }))
                  }
                  className={cn(
                    "pl-10 pr-10",
                    fieldErrors.password && "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  로그인 중...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  로그인
                </>
              )}
            </Button>
          </form>

          <Separator />

          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>
              계정이 없으신가요?{" "}
              <Link
                href={signupHref}
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                회원가입
              </Link>
            </p>
            <p>
              <Link
                href="/"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                홈으로 돌아가기
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
