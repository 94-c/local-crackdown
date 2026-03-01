"use client";

type Variant = "card" | "list" | "text" | "table" | "form";

interface LoadingSkeletonProps {
  variant?: Variant;
  count?: number;
  className?: string;
}

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-[skeleton-pulse_1.5s_ease-in-out_infinite] rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 p-4 space-y-3 dark:border-gray-700">
      <SkeletonBox className="h-4 w-2/3" />
      <SkeletonBox className="h-3 w-full" />
      <SkeletonBox className="h-3 w-4/5" />
      <SkeletonBox className="h-8 w-1/3 mt-2" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <SkeletonBox className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="space-y-2">
      <SkeletonBox className="h-4 w-full" />
      <SkeletonBox className="h-4 w-5/6" />
      <SkeletonBox className="h-4 w-3/4" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      <SkeletonBox className="h-10 w-full rounded-lg" />
      <SkeletonBox className="h-8 w-full" />
      <SkeletonBox className="h-8 w-full" />
      <SkeletonBox className="h-8 w-full" />
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <SkeletonBox className="h-4 w-1/4" />
        <SkeletonBox className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <SkeletonBox className="h-4 w-1/3" />
        <SkeletonBox className="h-10 w-full rounded-lg" />
      </div>
      <SkeletonBox className="h-10 w-1/3 rounded-lg" />
    </div>
  );
}

const variantMap: Record<Variant, React.FC> = {
  card: CardSkeleton,
  list: ListSkeleton,
  text: TextSkeleton,
  table: TableSkeleton,
  form: FormSkeleton,
};

export function LoadingSkeleton({
  variant = "card",
  count = 1,
  className = "",
}: LoadingSkeletonProps) {
  const Component = variantMap[variant];
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="로딩 중">
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
