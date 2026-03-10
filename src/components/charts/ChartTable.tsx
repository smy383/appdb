"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import ChartRow from "./ChartRow";
import ChartTypeSelector from "./ChartTypeSelector";
import CategoryFilter from "./CategoryFilter";
import CountrySelector from "./CountrySelector";
import { RssApp } from "@/lib/apple/rss";

interface ChartTableProps {
  initialApps: RssApp[];
  initialChartType: string;
  initialCountry: string;
  initialUpdated: string;
}

export default function ChartTable({
  initialApps,
  initialChartType,
  initialCountry,
  initialUpdated,
}: ChartTableProps) {
  const t = useTranslations();

  const [apps, setApps] = useState<RssApp[]>(initialApps);
  const [chartType, setChartType] = useState(initialChartType);
  const [country, setCountry] = useState(initialCountry);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(initialUpdated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchCharts() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/charts?country=${country}&chartType=${chartType}`
        );
        const data = await res.json();
        setApps(data.apps || []);
        setUpdated(data.updated || "");
      } catch (error) {
        console.error("Failed to fetch charts:", error);
      } finally {
        setLoading(false);
      }
    }

    // Don't fetch on initial mount (we have initialApps)
    if (chartType !== initialChartType || country !== initialCountry) {
      fetchCharts();
    }
  }, [chartType, country, initialChartType, initialCountry]);

  const filteredApps = categoryFilter
    ? apps.filter((app) =>
        app.genres?.some((g) => g.genreId === categoryFilter)
      )
    : apps;

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <ChartTypeSelector selected={chartType} onChange={setChartType} />
        <CountrySelector selected={country} onChange={setCountry} />
        <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
      </div>

      {/* Updated info */}
      {updated && mounted && (
        <p className="mb-4 text-xs text-gray-500">
          {t("common.lastUpdated", {
            date: new Date(updated).toLocaleDateString(),
          })}
        </p>
      )}

      {/* App list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-4 rounded-xl px-4 py-3"
            >
              <div className="h-6 w-12 rounded bg-gray-800" />
              <div className="h-6 w-12 rounded bg-gray-800" />
              <div className="h-14 w-14 rounded-xl bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-gray-800" />
                <div className="h-3 w-32 rounded bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredApps.map((app, index) => (
            <ChartRow
              key={app.id}
              rank={index + 1}
              rankChange={null}
              appId={app.id}
              appName={app.name}
              artistName={app.artistName}
              artworkUrl={app.artworkUrl}
              genreName={app.genres?.[0]?.name || "App"}
            />
          ))}
          {filteredApps.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              {t("common.error")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
