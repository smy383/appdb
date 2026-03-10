"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendPoint {
  date: string;
  value: number;
}

interface CompareTrendsProps {
  appName1: string;
  appName2: string;
}

export default function CompareTrends({
  appName1,
  appName2,
}: CompareTrendsProps) {
  const t = useTranslations("compare");
  const td = useTranslations("appDetail");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(90);
  const [trends1, setTrends1] = useState<TrendPoint[]>([]);
  const [trends2, setTrends2] = useState<TrendPoint[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchBothTrends() {
      setLoading(true);
      try {
        const [res1, res2] = await Promise.all([
          fetch(`/api/trends/${encodeURIComponent(appName1)}?days=${days}`),
          fetch(`/api/trends/${encodeURIComponent(appName2)}?days=${days}`),
        ]);
        const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
        setTrends1(data1.trends || []);
        setTrends2(data2.trends || []);
      } catch (error) {
        console.error("Failed to fetch trends:", error);
        setTrends1([]);
        setTrends2([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBothTrends();
  }, [appName1, appName2, days]);

  // Merge both trend datasets by date
  const dateMap = new Map<
    string,
    { date: string; app1: number | null; app2: number | null }
  >();

  for (const point of trends1) {
    dateMap.set(point.date, { date: point.date, app1: point.value, app2: null });
  }
  for (const point of trends2) {
    const existing = dateMap.get(point.date);
    if (existing) {
      existing.app2 = point.value;
    } else {
      dateMap.set(point.date, { date: point.date, app1: null, app2: point.value });
    }
  }

  const chartData = Array.from(dateMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      [appName1]: entry.app1,
      [appName2]: entry.app2,
    }));

  const dayOptions = [
    { value: 30, label: td("days30") },
    { value: 60, label: td("days60") },
    { value: 90, label: td("days90") },
  ];

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {t("trendComparison")}
        </h2>
        <div className="flex gap-2">
          {dayOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                days === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 p-4">
        {!mounted || loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-gray-500">
            {td("noTrendData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#6B7280"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                domain={[0, 100]}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Legend
                wrapperStyle={{ color: "#9CA3AF", fontSize: "13px" }}
              />
              <Line
                type="monotone"
                dataKey={appName1}
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#60A5FA" }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey={appName2}
                stroke="#A855F7"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#C084FC" }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
