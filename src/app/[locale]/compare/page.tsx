"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AppInfo } from "@/types/app";
import CompareSearch from "@/components/compare/CompareSearch";
import CompareTable from "@/components/compare/CompareTable";
import CompareTrends from "@/components/compare/CompareTrends";

export default function ComparePage() {
  const t = useTranslations("compare");
  const [app1, setApp1] = useState<AppInfo | null>(null);
  const [app2, setApp2] = useState<AppInfo | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="mt-2 text-gray-400">{t("subtitle")}</p>
      </div>

      {/* Search Inputs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <CompareSearch
          onSelect={setApp1}
          placeholder={t("selectApp1")}
          selectedApp={app1}
          onClear={() => setApp1(null)}
        />
        <div className="flex items-center justify-center">
          <span className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm font-bold text-white">
            {t("vsLabel")}
          </span>
        </div>
        <CompareSearch
          onSelect={setApp2}
          placeholder={t("selectApp2")}
          selectedApp={app2}
          onClear={() => setApp2(null)}
        />
      </div>

      {/* Comparison Content */}
      {app1 && app2 ? (
        <div>
          <CompareTable app1={app1} app2={app2} />
          <CompareTrends appName1={app1.name} appName2={app2.name} />
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/50">
          <div className="text-center">
            <svg
              className="mx-auto mb-3 h-12 w-12 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm text-gray-500">{t("selectBothApps")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
