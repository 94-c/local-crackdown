import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Trophy,
  Users,
  UsersRound,
  CalendarCheck,
  BarChart3,
  Sword,
} from "lucide-react";

const ADMIN_SECTIONS = [
  {
    title: "챌린지 관리",
    description: "챌린지 생성, 수정, 삭제 및 상태 관리",
    href: "/admin/challenges",
    icon: Trophy,
  },
  {
    title: "사용자 관리",
    description: "등록된 사용자 목록 조회",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "팀 관리",
    description: "챌린지별 팀 구성 및 관리",
    href: "/admin/teams",
    icon: UsersRound,
  },
  {
    title: "주간 마감",
    description: "주간 성적 마감 및 결과 집계",
    href: "/admin/weekly-close",
    icon: CalendarCheck,
  },
  {
    title: "순위",
    description: "팀 순위 및 개인 순위 확인",
    href: "/admin/rankings",
    icon: BarChart3,
  },
  {
    title: "미션",
    description: "미션 유형 관리 및 인증 확인",
    href: "/admin/missions",
    icon: Sword,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          지방단속 챌린지 관리 시스템에 오신 것을 환영합니다
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <CardDescription className="mt-0.5 text-xs">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
