"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import RankChange from "@/components/charts/RankChange";

interface NewEntry {
  app_id: string;
  name: string;
  artist_name: string;
  artwork_url: string;
  rank: number;
  primary_genre_name: string;
}

interface NewEntriesProps {
  country?: string;
  chartType?: string;
}

export default function NewEntries({
  country = "us",
  chartType = "top-free",
}: NewEntriesProps) {
  const t = useTranslations("home");
  const [entries, setEntries] = useState<NewEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntries() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/new-entries?country=${country}&chartType=${chartType}`
        );
        const data = await res.json();
        setEntries(data.entries || []);
      } catch (error) {
        console.error("Failed to fetch new entries:", error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, [country, chartType]);

  if (!loading && entries.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-bold text-white">
        {t("newToCharts")}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-3 rounded-xl bg-gray-900 p-4"
            >
              <div className="h-12 w-12 rounded-xl bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 rounded bg-gray-800" />
                <div className="h-3 w-16 rounded bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={entry.app_id}
              href={`/app/${entry.app_id}`}
              className="group flex items-center gap-3 rounded-xl bg-gray-900 p-4 transition-colors hover:bg-gray-800"
            >
              <img
                src={entry.artwork_url}
                alt={entry.name}
                className="h-12 w-12 flex-shrink-0 rounded-xl"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white group-hover:text-blue-400">
                  {entry.name}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {entry.artist_name}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500">#{entry.rank}</span>
                <RankChange change={null} isNew />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
