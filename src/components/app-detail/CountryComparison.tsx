"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { COUNTRIES } from "@/lib/constants";
import RankChange from "@/components/charts/RankChange";

interface CountryRank {
  country: string;
  rank: number;
  rank_change: number | null;
}

interface CountryComparisonProps {
  appId: string;
}

export default function CountryComparison({ appId }: CountryComparisonProps) {
  const t = useTranslations("appDetail");
  const [ranks, setRanks] = useState<CountryRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanks() {
      setLoading(true);
      try {
        const res = await fetch(`/api/country-ranks/${appId}`);
        const data = await res.json();
        setRanks(data.ranks || []);
      } catch (error) {
        console.error("Failed to fetch country ranks:", error);
        setRanks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRanks();
  }, [appId]);

  function getCountryInfo(code: string) {
    return COUNTRIES.find((c) => c.code === code);
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-white">
        {t("countryComparison")}
      </h2>

      <div className="rounded-xl bg-gray-900 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-4"
              >
                <div className="h-5 w-20 rounded bg-gray-800" />
                <div className="h-5 w-12 rounded bg-gray-800" />
                <div className="h-5 w-12 rounded bg-gray-800" />
              </div>
            ))}
          </div>
        ) : ranks.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            {t("noCountryData")}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {t("countryColumn")}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">
                  {t("rankColumn")}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">
                  {t("changeColumn")}
                </th>
              </tr>
            </thead>
            <tbody>
              {ranks.map((item) => {
                const info = getCountryInfo(item.country);
                return (
                  <tr
                    key={item.country}
                    className="border-b border-gray-800/50 last:border-0"
                  >
                    <td className="px-4 py-3 text-sm text-gray-200">
                      {info ? `${info.flag} ${info.name}` : item.country}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-white">
                        #{item.rank}
                      </span>
                    </td>
                    <td className="flex items-center justify-center px-4 py-3">
                      <RankChange change={item.rank_change} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
