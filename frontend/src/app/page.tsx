import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Challenge</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          4주 챌린지로 목표를 달성하세요
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            시작하기
          </Link>
        </div>
      </div>
    </main>
  );
}
