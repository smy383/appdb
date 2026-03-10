"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AppInfo } from "@/types/app";

interface RankInfo {
  rank: number;
  country: string;
  chartType: string;
}

interface CompareTableProps {
  app1: AppInfo;
  app2: AppInfo;
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <span key={i} className="text-yellow-400/60">
          ★
        </span>
      );
    } else {
      stars.push(
        <span key={i} className="text-gray-600">
          ★
        </span>
      );
    }
  }
  return <span className="text-sm">{stars}</span>;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export default function CompareTable({ app1, app2 }: CompareTableProps) {
  const t = useTranslations("compare");
  const td = useTranslations("appDetail");
  const [rank1, setRank1] = useState<RankInfo | null>(null);
  const [rank2, setRank2] = useState<RankInfo | null>(null);

  useEffect(() => {
    async function fetchRank(appId: string, setter: (r: RankInfo | null) => void) {
      try {
        const res = await fetch(`/api/app-rank/${appId}`);
        if (res.ok) {
          const data = await res.json();
          setter(data.bestRank || null);
        }
      } catch {
        setter(null);
      }
    }
    fetchRank(app1.id, setRank1);
    fetchRank(app2.id, setRank2);
  }, [app1.id, app2.id]);

  type MetricRow = {
    label: string;
    val1: React.ReactNode;
    val2: React.ReactNode;
    compare?: "higher" | "lower";
    raw1?: number;
    raw2?: number;
  };

  const metrics: MetricRow[] = [
    {
      label: td("developer"),
      val1: <span className="text-gray-300">{app1.artistName}</span>,
      val2: <span className="text-gray-300">{app2.artistName}</span>,
    },
    {
      label: td("category"),
      val1: (
        <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
          {app1.primaryGenreName}
        </span>
      ),
      val2: (
        <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
          {app2.primaryGenreName}
        </span>
      ),
    },
    {
      label: td("price"),
      val1: app1.price === 0 ? td("free") : `$${app1.price.toFixed(2)}`,
      val2: app2.price === 0 ? td("free") : `$${app2.price.toFixed(2)}`,
    },
    {
      label: td("averageRating"),
      val1: (
        <div className="flex items-center gap-2">
          <StarRating rating={app1.averageRating} />
          <span className="text-sm text-gray-300">
            {app1.averageRating.toFixed(1)}
          </span>
        </div>
      ),
      val2: (
        <div className="flex items-center gap-2">
          <StarRating rating={app2.averageRating} />
          <span className="text-sm text-gray-300">
            {app2.averageRating.toFixed(1)}
          </span>
        </div>
      ),
      compare: "higher",
      raw1: app1.averageRating,
      raw2: app2.averageRating,
    },
    {
      label: td("ratings", { count: "" }).replace(/\s*$/, ""),
      val1: formatNumber(app1.ratingCount),
      val2: formatNumber(app2.ratingCount),
      compare: "higher",
      raw1: app1.ratingCount,
      raw2: app2.ratingCount,
    },
    {
      label: t("metric") === "Metric" ? "Chart Rank" : "차트 순위",
      val1: rank1 ? `#${rank1.rank} (${rank1.country.toUpperCase()})` : "-",
      val2: rank2 ? `#${rank2.rank} (${rank2.country.toUpperCase()})` : "-",
      compare: "lower",
      raw1: rank1?.rank ?? 9999,
      raw2: rank2?.rank ?? 9999,
    },
  ];

  function getBetterClass(row: MetricRow, side: 1 | 2): string {
    if (!row.compare || row.raw1 === undefined || row.raw2 === undefined)
      return "";
    if (row.raw1 === row.raw2) return "";
    const isBetter =
      row.compare === "higher"
        ? side === 1
          ? row.raw1 > row.raw2
          : row.raw2 > row.raw1
        : side === 1
        ? row.raw1 < row.raw2
        : row.raw2 < row.raw1;
    return isBetter ? "text-green-400" : "";
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
      {/* App Headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] border-b border-gray-800">
        <div className="flex flex-col items-center gap-3 p-6">
          <img
            src={app1.artworkUrl}
            alt={app1.name}
            className="h-20 w-20 rounded-2xl"
          />
          <p className="text-center text-sm font-semibold text-white">
            {app1.name}
          </p>
        </div>
        <div className="flex items-center px-4">
          <span className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm font-bold text-white">
            {t("vsLabel")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-3 p-6">
          <img
            src={app2.artworkUrl}
            alt={app2.name}
            className="h-20 w-20 rounded-2xl"
          />
          <p className="text-center text-sm font-semibold text-white">
            {app2.name}
          </p>
        </div>
      </div>

      {/* Metrics */}
      {metrics.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-[1fr_auto_1fr] ${
            i < metrics.length - 1 ? "border-b border-gray-800/50" : ""
          }`}
        >
          <div className={`p-4 text-center text-sm ${getBetterClass(row, 1)}`}>
            {row.val1}
          </div>
          <div className="flex w-32 items-center justify-center bg-gray-800/30 px-3 text-xs font-medium text-gray-400">
            {row.label}
          </div>
          <div className={`p-4 text-center text-sm ${getBetterClass(row, 2)}`}>
            {row.val2}
          </div>
        </div>
      ))}
    </div>
  );
}
