import { getTranslations } from "next-intl/server";
import { fetchTopChart, RssApp } from "@/lib/apple/rss";
import { DEFAULT_CHART_TYPE, DEFAULT_COUNTRY } from "@/lib/constants";
import ChartTable from "@/components/charts/ChartTable";

export default async function HomePage() {
  const t = await getTranslations("home");

  let initialApps: RssApp[] = [];
  let initialUpdated = "";

  try {
    const result = await fetchTopChart(DEFAULT_COUNTRY, DEFAULT_CHART_TYPE);
    initialApps = result.apps;
    initialUpdated = result.updated;
  } catch (error) {
    console.error("Failed to fetch initial charts:", error);
  }

  return (
    <div>
      {/* Hero */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-lg text-gray-400">{t("subtitle")}</p>
      </section>

      {/* Chart */}
      <section>
        <ChartTable
          initialApps={initialApps}
          initialChartType={DEFAULT_CHART_TYPE}
          initialCountry={DEFAULT_COUNTRY}
          initialUpdated={initialUpdated}
        />
      </section>
    </div>
  );
}
