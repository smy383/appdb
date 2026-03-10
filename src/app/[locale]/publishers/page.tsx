import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

interface Publisher {
  name: string;
  appCount: number;
  apps: { id: string; name: string; artwork_url: string }[];
}

async function fetchPublishers(country: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/publishers?country=${encodeURIComponent(country)}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.publishers || [];
}

export default async function PublishersPage() {
  const t = await getTranslations("publishers");
  const publishers: Publisher[] = await fetchPublishers("us");

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="mt-2 text-gray-400">{t("subtitle")}</p>
      </div>

      {publishers.length === 0 ? (
        <p className="text-center text-gray-500">No publisher data available</p>
      ) : (
        <div className="rounded-2xl bg-gray-900 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[3rem_1fr_5rem_7rem] items-center gap-4 border-b border-gray-800 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:grid-cols-[3rem_1fr_6rem_10rem]">
            <span>{t("rank")}</span>
            <span>{t("publisher")}</span>
            <span className="text-center">{t("chartedApps")}</span>
            <span className="hidden sm:block">{t("topApps")}</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-800/50">
            {publishers.map((pub: Publisher, index: number) => (
              <div
                key={pub.name}
                className="grid grid-cols-[3rem_1fr_5rem_7rem] items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-800/50 sm:grid-cols-[3rem_1fr_6rem_10rem]"
              >
                {/* Rank */}
                <span
                  className={`text-center text-lg font-bold ${
                    index < 3 ? "text-yellow-400" : "text-gray-400"
                  }`}
                >
                  {index + 1}
                </span>

                {/* Publisher Name */}
                <Link
                  href={`/developer/${encodeURIComponent(pub.name)}`}
                  className="truncate text-sm font-medium text-white transition-colors hover:text-blue-400"
                >
                  {pub.name}
                </Link>

                {/* Charted Apps Count */}
                <span className="text-center text-sm font-semibold text-gray-300">
                  {pub.appCount}
                </span>

                {/* Top Apps Icons */}
                <div className="hidden items-center gap-1 sm:flex">
                  {pub.apps.map(
                    (app: { id: string; name: string; artwork_url: string }) => (
                      <Link key={app.id} href={`/app/${app.id}`}>
                        <img
                          src={app.artwork_url}
                          alt={app.name}
                          title={app.name}
                          className="h-8 w-8 rounded-lg transition-transform hover:scale-110"
                          loading="lazy"
                        />
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
