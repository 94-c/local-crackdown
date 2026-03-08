"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";
import { validateEmail, validatePassword } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      window.location.href = "/admin";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "로그인에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/images/mascot.png"
            alt="지방단속"
            width={80}
            height={80}
            priority
            className="rounded-xl"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold">지방단속 Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              관리자 계정으로 로그인하세요
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() =>
                    setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }))
                  }
                  className={cn(fieldErrors.email && "border-destructive")}
                  placeholder="admin@example.com"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() =>
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: validatePassword(password),
                    }))
                  }
                  className={cn(fieldErrors.password && "border-destructive")}
                  placeholder="••••••••"
                />
                {fieldErrors.password && (
                  <p className="text-xs text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "로그인 중..." : "관리자 로그인"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            홈으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}
