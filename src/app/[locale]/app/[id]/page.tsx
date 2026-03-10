import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { lookupApp } from "@/lib/apple/itunes";
import { formatFileSize, formatDate, formatRating } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import RankHistoryChart from "@/components/app-detail/RankHistoryChart";
import CountryComparison from "@/components/app-detail/CountryComparison";
import GoogleTrends from "@/components/app-detail/GoogleTrends";

interface AppPageProps {
  params: { id: string; locale: string };
}

export async function generateMetadata({
  params,
}: AppPageProps): Promise<Metadata> {
  const app = await lookupApp(params.id);

  if (!app) {
    return { title: "App Not Found - AppDB" };
  }

  const ratingText =
    app.averageRating > 0 ? ` - Rating: ${formatRating(app.averageRating)}/5` : "";
  const description = `${app.name} by ${app.artistName}${ratingText} - ${app.primaryGenreName}`;

  return {
    title: `${app.name} - AppDB`,
    description,
    openGraph: {
      title: `${app.name} - AppDB`,
      description,
      images: [{ url: app.artworkUrl, width: 512, height: 512, alt: app.name }],
    },
    twitter: {
      card: "summary",
      title: `${app.name} - AppDB`,
      description,
      images: [app.artworkUrl],
    },
  };
}

export default async function AppDetailPage({ params }: AppPageProps) {
  const t = await getTranslations("appDetail");
  const app = await lookupApp(params.id);

  if (!app) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* App Header */}
      <div className="flex items-start gap-6">
        <img
          src={app.artworkUrl}
          alt={app.name}
          className="h-28 w-28 flex-shrink-0 rounded-[28px] shadow-2xl"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-white">{app.name}</h1>
          <Link
            href={`/developer/${encodeURIComponent(app.artistName)}`}
            className="mt-1 inline-block text-gray-400 transition-colors hover:text-blue-400"
          >
            {app.artistName}
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-gray-800 px-3 py-1 text-sm text-gray-300">
              {app.primaryGenreName}
            </span>
            {app.averageRating > 0 && (
              <span className="text-sm text-yellow-400">
                ★ {formatRating(app.averageRating)}{" "}
                <span className="text-gray-500">
                  ({app.ratingCount.toLocaleString()})
                </span>
              </span>
            )}
            <span className="text-sm text-gray-500">
              v{app.currentVersion}
            </span>
          </div>

          <div className="mt-4">
            <a
              href={app.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              {t("viewOnAppStore")} ↗
            </a>
          </div>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetaCard
          label={t("price")}
          value={app.price === 0 ? t("free") : `$${app.price}`}
        />
        <MetaCard
          label={t("size")}
          value={formatFileSize(app.fileSizeBytes)}
        />
        <MetaCard
          label={t("releaseDate")}
          value={formatDate(app.releaseDate, params.locale)}
        />
        <MetaCard
          label={t("averageRating")}
          value={
            app.averageRating > 0 ? `${formatRating(app.averageRating)} / 5` : "-"
          }
        />
      </div>

      {/* Rank History Chart */}
      <RankHistoryChart appId={params.id} />

      {/* Country Comparison */}
      <CountryComparison appId={params.id} />

      {/* Google Trends */}
      <GoogleTrends appName={app.name} />

      {/* Screenshots */}
      {app.screenshotUrls && app.screenshotUrls.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {t("screenshots")}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {app.screenshotUrls.slice(0, 6).map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${app.name} screenshot ${i + 1}`}
                className="h-80 flex-shrink-0 rounded-xl shadow-lg"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}

      {/* Release Notes */}
      {app.releaseNotes && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-white">
            {t("lastUpdated")}
          </h2>
          <p className="whitespace-pre-line text-sm text-gray-300">
            {app.releaseNotes}
          </p>
        </div>
      )}

      {/* Description */}
      {app.description && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-white">
            {t("description")}
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">
            {app.description.slice(0, 1000)}
            {app.description.length > 1000 ? "..." : ""}
          </p>
        </div>
      )}
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-900 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
