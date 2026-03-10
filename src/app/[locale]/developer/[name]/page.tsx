import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/developer?name=${encodeURIComponent(name)}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function DeveloperPage({ params }: DeveloperPageProps) {
  const t = await getTranslations("developer");
  const decodedName = decodeURIComponent(params.name);
  const data = await fetchDeveloperData(decodedName);

  if (!data) {
    notFound();
  }

  const { developer, apps, totalApps } = data as {
    developer: string;
    apps: DeveloperApp[];
    totalApps: number;
  };

  const chartedApps = apps.filter((app: DeveloperApp) => app.rank !== null);
  const nonChartedApps = apps.filter((app: DeveloperApp) => app.rank === null);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Developer Header */}
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
          {/* Charted Apps */}
          {chartedApps.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-white">
                {t("chartedApps")}
              </h2>
              <div className="divide-y divide-gray-800/50 rounded-2xl bg-gray-900 p-2">
                {chartedApps.map((app: DeveloperApp) => (
                  <DeveloperAppRow key={app.id} app={app} showRank />
                ))}
              </div>
            </section>
          )}

          {/* All Apps */}
          {nonChartedApps.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">
                {t("allApps")}
              </h2>
              <div className="divide-y divide-gray-800/50 rounded-2xl bg-gray-900 p-2">
                {nonChartedApps.map((app: DeveloperApp) => (
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
      {/* Rank badge if charted */}
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

      {/* App Icon */}
      <div className="flex-shrink-0">
        <img
          src={app.artwork_url}
          alt={app.name}
          className="h-14 w-14 rounded-xl shadow-lg"
          loading="lazy"
        />
      </div>

      {/* App Info */}
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
              {app.rating_count > 0 && (
                <span className="text-gray-500">
                  {" "}
                  ({Number(app.rating_count).toLocaleString()})
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
