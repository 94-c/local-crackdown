import Link from "next/link";

const ADMIN_SECTIONS = [
  {
    title: "챌린지 관리",
    description: "챌린지 생성, 수정, 삭제 및 상태 관리",
    href: "/admin/challenges",
  },
  {
    title: "사용자 관리",
    description: "등록된 사용자 목록 조회",
    href: "/admin/users",
  },
  {
    title: "팀 관리",
    description: "챌린지별 팀 구성 및 관리",
    href: "/admin/teams",
  },
  {
    title: "주간 마감",
    description: "주간 성적 마감 및 결과 집계",
    href: "/admin/weekly-close",
  },
  {
    title: "순위",
    description: "팀 순위 및 개인 순위 확인",
    href: "/admin/rankings",
  },
  {
    title: "미션",
    description: "미션 유형 관리 및 인증 확인",
    href: "/admin/missions",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">관리자 대시보드</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
          >
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
