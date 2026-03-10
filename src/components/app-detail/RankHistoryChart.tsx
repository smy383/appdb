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
} from "recharts";

interface RankHistoryEntry {
  date: string;
  rank: number;
}

interface RankHistoryChartProps {
  appId: string;
  country?: string;
  chartType?: string;
}

export default function RankHistoryChart({
  appId,
  country = "us",
  chartType = "top-free",
}: RankHistoryChartProps) {
  const t = useTranslations("appDetail");
  const [days, setDays] = useState(30);
  const [history, setHistory] = useState<RankHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/history/${appId}?days=${days}&country=${country}&chartType=${chartType}`
        );
        const data = await res.json();
        setHistory(data.history || []);
      } catch (error) {
        console.error("Failed to fetch rank history:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [appId, days, country, chartType]);

  const chartData = history.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    rank: entry.rank,
  }));

  const dayOptions = [
    { value: 30, label: t("days30") },
    { value: 60, label: t("days60") },
    { value: 90, label: t("days90") },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltip = (value: any) => [`#${value}`, "Rank"];

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {t("rankHistory")}
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
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-gray-500">
            {t("noRankData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                reversed
                stroke="#6B7280"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                domain={["dataMin", "dataMax"]}
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
                formatter={formatTooltip}
              />
              <Line
                type="monotone"
                dataKey="rank"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 3 }}
                activeDot={{ r: 5, fill: "#60A5FA" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
