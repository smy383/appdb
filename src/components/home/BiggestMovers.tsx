"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import RankChange from "@/components/charts/RankChange";

interface Mover {
  app_id: string;
  name: string;
  artist_name: string;
  artwork_url: string;
  rank: number;
  rank_change: number;
  primary_genre_name: string;
}

interface BiggestMoversProps {
  country?: string;
  chartType?: string;
}

export default function BiggestMovers({
  country = "us",
  chartType = "top-free",
}: BiggestMoversProps) {
  const t = useTranslations("home");
  const [movers, setMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovers() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/movers?country=${country}&chartType=${chartType}`
        );
        const data = await res.json();
        setMovers(data.movers || []);
      } catch (error) {
        console.error("Failed to fetch movers:", error);
        setMovers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMovers();
  }, [country, chartType]);

  if (!loading && movers.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-bold text-white">
        {t("dailyMovers")}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-3 rounded-xl bg-gray-900 p-4"
            >
              <div className="h-12 w-12 rounded-xl bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-gray-800" />
                <div className="h-3 w-20 rounded bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {movers.map((mover) => (
            <Link
              key={mover.app_id}
              href={`/app/${mover.app_id}`}
              className="group flex items-center gap-3 rounded-xl bg-gray-900 p-4 transition-colors hover:bg-gray-800"
            >
              <img
                src={mover.artwork_url}
                alt={mover.name}
                className="h-12 w-12 flex-shrink-0 rounded-xl"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white group-hover:text-blue-400">
                  {mover.name}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {mover.artist_name}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500">#{mover.rank}</span>
                <RankChange change={mover.rank_change} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
