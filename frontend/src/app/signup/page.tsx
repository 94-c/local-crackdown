"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Spinner } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Separator } from "@/components/ui";
import { validateEmail, validatePassword, validateRequired } from "@/lib/validation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, UserPlus, Users } from "lucide-react";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  const validate = (): string | null => {
    if (password.length < 8) {
      return "비밀번호는 8자 이상이어야 합니다";
    }
    if (password !== passwordConfirm) {
      return "비밀번호가 일치하지 않습니다";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await apiClient.post("/api/auth/signup", { email, password, nickname });
      if (invite) {
        window.location.href = `/login?invite=${invite}&registered=true`;
      } else {
        window.location.href = "/login?registered=true";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "회원가입에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  const loginHref = invite ? `/login?invite=${invite}` : "/login";

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
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>새 계정을 만들어 챌린지에 참여하세요</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nickname"
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onBlur={() =>
                    setFieldErrors((prev) => ({
                      ...prev,
                      nickname: validateRequired(nickname, "닉네임"),
                    }))
                  }
                  className={cn(
                    "pl-10",
                    fieldErrors.nickname && "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder="닉네임을 입력하세요"
                />
              </div>
              {fieldErrors.nickname && (
                <p className="text-xs text-destructive">{fieldErrors.nickname}</p>
              )}
            </div>

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
                  minLength={8}
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
                  placeholder="8자 이상 입력하세요"
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

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  required
                  minLength={8}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  onBlur={() =>
                    setFieldErrors((prev) => ({
                      ...prev,
                      passwordConfirm:
                        passwordConfirm !== password
                          ? "비밀번호가 일치하지 않습니다"
                          : null,
                    }))
                  }
                  className={cn(
                    "pl-10 pr-10",
                    fieldErrors.passwordConfirm && "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.passwordConfirm && (
                <p className="text-xs text-destructive">{fieldErrors.passwordConfirm}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  가입 중...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  회원가입
                </>
              )}
            </Button>
          </form>

          <Separator />

          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>
              이미 계정이 있으신가요?{" "}
              <Link
                href={loginHref}
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                로그인
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
