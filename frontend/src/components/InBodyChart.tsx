"use client";

import { useMemo } from "react";
import type { InBodyRecord } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface InBodyChartProps {
  records: InBodyRecord[];
}

export default function InBodyChart({ records }: InBodyChartProps) {
  const chartData = useMemo(() => {
    return [...records]
      .sort(
        (a, b) =>
          new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
      )
      .map((r) => ({
        date: new Date(r.recordDate).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        }),
        체중: r.weight,
        골격근량: r.skeletalMuscleMass,
        체지방률: r.bodyFatPercentage,
      }));
  }, [records]);

  if (records.length < 2) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-semibold">인바디 변화 추이</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="체중"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="골격근량"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="체지방률"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
