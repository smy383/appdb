import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@supabase/supabase-js";

interface Publisher {
  name: string;
  appCount: number;
  apps: { id: string; name: string; artwork_url: string }[];
}

async function fetchPublishers(country: string): Promise<Publisher[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const supabase = createClient(url, key);

  const { data: snapshot } = await supabase
    .from("chart_snapshots")
    .select("id")
    .eq("country", country)
    .order("collected_at", { ascending: false })
    .limit(1)
    .single();

  if (!snapshot) return [];

  const { data: entries } = await supabase
    .from("chart_entries")
    .select("app_id, rank, apps(id, name, artist_name, artwork_url)")
    .eq("snapshot_id", snapshot.id)
    .order("rank", { ascending: true });

  if (!entries) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedEntries = entries as any[];
  const publisherMap = new Map<
    string,
    { count: number; apps: { id: string; name: string; artwork_url: string }[] }
  >();

  for (const entry of typedEntries) {
    const app = entry.apps;
    if (!app) continue;
    const artist = app.artist_name;
    if (!publisherMap.has(artist)) {
      publisherMap.set(artist, { count: 0, apps: [] });
    }
    const pub = publisherMap.get(artist)!;
    pub.count++;
    if (pub.apps.length < 3) {
      pub.apps.push({ id: app.id, name: app.name, artwork_url: app.artwork_url });
    }
  }

  const publishers: Publisher[] = Array.from(publisherMap.entries())
    .map(([name, data]) => ({ name, appCount: data.count, apps: data.apps }))
    .sort((a, b) => b.appCount - a.appCount)
    .slice(0, 20);

  return publishers;
}

export default async function PublishersPage() {
  const t = await getTranslations("publishers");
  const publishers = await fetchPublishers("us");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="mt-2 text-gray-400">{t("subtitle")}</p>
      </div>

      {publishers.length === 0 ? (
        <p className="text-center text-gray-500">No publisher data available</p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-gray-900">
          <div className="grid grid-cols-[3rem_1fr_5rem_7rem] items-center gap-4 border-b border-gray-800 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:grid-cols-[3rem_1fr_6rem_10rem]">
            <span>{t("rank")}</span>
            <span>{t("publisher")}</span>
            <span className="text-center">{t("chartedApps")}</span>
            <span className="hidden sm:block">{t("topApps")}</span>
          </div>

          <div className="divide-y divide-gray-800/50">
            {publishers.map((pub, index) => (
              <div
                key={pub.name}
                className="grid grid-cols-[3rem_1fr_5rem_7rem] items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-800/50 sm:grid-cols-[3rem_1fr_6rem_10rem]"
              >
                <span
                  className={`text-center text-lg font-bold ${
                    index < 3 ? "text-yellow-400" : "text-gray-400"
                  }`}
                >
                  {index + 1}
                </span>
                <Link
                  href={`/developer/${encodeURIComponent(pub.name)}`}
                  className="truncate text-sm font-medium text-white transition-colors hover:text-blue-400"
                >
                  {pub.name}
                </Link>
                <span className="text-center text-sm font-semibold text-gray-300">
                  {pub.appCount}
                </span>
                <div className="hidden items-center gap-1 sm:flex">
                  {pub.apps.map((app) => (
                    <Link key={app.id} href={`/app/${app.id}`}>
                      <img
                        src={app.artwork_url}
                        alt={app.name}
                        title={app.name}
                        className="h-8 w-8 rounded-lg transition-transform hover:scale-110"
                        loading="lazy"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
