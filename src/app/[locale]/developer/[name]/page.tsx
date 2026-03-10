import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

interface DeveloperPageProps {
  params: { name: string; locale: string };
}

interface DeveloperApp {
  id: string;
  name: string;
  artwork_url: string;
  primary_genre_name: string;
  average_rating: number;
  rating_count: number;
  rank: number | null;
  chart_type: string | null;
}

async function fetchDeveloperData(name: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key);

  const { data: apps, error } = await supabase
    .from("apps")
    .select("id, name, artwork_url, primary_genre_name, average_rating, rating_count")
    .eq("artist_name", name);

  if (error || !apps) return null;

  // Get latest snapshots to find chart ranks
  const { data: snapshots } = await supabase
    .from("chart_snapshots")
    .select("id, chart_type")
    .order("collected_at", { ascending: false })
    .limit(10);

  const snapshotIds = snapshots?.map((s) => s.id) || [];
  const snapshotMap = new Map(snapshots?.map((s) => [s.id, s.chart_type]) || []);

  const rankMap = new Map<string, { rank: number; chart_type: string }>();

  if (snapshotIds.length > 0) {
    const appIds = apps.map((a) => a.id);
    const { data: entries } = await supabase
      .from("chart_entries")
      .select("app_id, rank, snapshot_id")
      .in("snapshot_id", snapshotIds)
      .in("app_id", appIds);

    if (entries) {
      for (const entry of entries) {
        if (!rankMap.has(entry.app_id)) {
          rankMap.set(entry.app_id, {
            rank: entry.rank,
            chart_type: snapshotMap.get(entry.snapshot_id) || "",
          });
        }
      }
    }
  }

  const enrichedApps: DeveloperApp[] = apps.map((app) => {
    const rankInfo = rankMap.get(app.id);
    return {
      ...app,
      rank: rankInfo?.rank ?? null,
      chart_type: rankInfo?.chart_type ?? null,
    };
  });

  return {
    developer: name,
    apps: enrichedApps,
    totalApps: apps.length,
  };
}

export default async function DeveloperPage({ params }: DeveloperPageProps) {
  const t = await getTranslations("developer");
  const decodedName = decodeURIComponent(params.name);
  const data = await fetchDeveloperData(decodedName);

  if (!data) {
    notFound();
  }

  const { developer, apps, totalApps } = data;
  const chartedApps = apps.filter((app) => app.rank !== null);
  const nonChartedApps = apps.filter((app) => app.rank === null);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
            {developer.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t("title", { name: developer })}
            </h1>
            <p className="mt-1 text-gray-400">
              {t("totalApps", { count: totalApps })}
            </p>
          </div>
        </div>
      </div>

      {apps.length === 0 ? (
        <p className="text-center text-gray-500">{t("noApps")}</p>
      ) : (
        <>
          {chartedApps.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-white">
                {t("chartedApps")}
              </h2>
              <div className="divide-y divide-gray-800/50 rounded-2xl bg-gray-900 p-2">
                {chartedApps.map((app) => (
                  <DeveloperAppRow key={app.id} app={app} showRank />
                ))}
              </div>
            </section>
          )}

          {nonChartedApps.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">
                {t("allApps")}
              </h2>
              <div className="divide-y divide-gray-800/50 rounded-2xl bg-gray-900 p-2">
                {nonChartedApps.map((app) => (
                  <DeveloperAppRow key={app.id} app={app} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function DeveloperAppRow({
  app,
  showRank = false,
}: {
  app: DeveloperApp;
  showRank?: boolean;
}) {
  const chartLabel =
    app.chart_type === "top-free"
      ? "Free"
      : app.chart_type === "top-paid"
        ? "Paid"
        : app.chart_type;

  return (
    <Link
      href={`/app/${app.id}`}
      className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-gray-800/50"
    >
      {showRank && app.rank !== null && (
        <div className="flex w-12 flex-shrink-0 flex-col items-center">
          <span
            className={`text-lg font-bold ${
              app.rank <= 3 ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            #{app.rank}
          </span>
          {chartLabel && (
            <span className="text-[10px] text-gray-500">{chartLabel}</span>
          )}
        </div>
      )}

      <div className="flex-shrink-0">
        <img
          src={app.artwork_url}
          alt={app.name}
          className="h-14 w-14 rounded-xl shadow-lg"
          loading="lazy"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-white group-hover:text-blue-400">
          {app.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
            {app.primary_genre_name}
          </span>
          {app.average_rating > 0 && (
            <span className="text-xs text-yellow-400">
              ★ {app.average_rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
