import { Link } from "@/i18n/navigation";
import RankChange from "./RankChange";

interface ChartRowProps {
  rank: number;
  rankChange: number | null;
  appId: string;
  appName: string;
  artistName: string;
  artworkUrl: string;
  genreName: string;
  rating?: number;
  ratingCount?: number;
}

export default function ChartRow({
  rank,
  rankChange,
  appId,
  appName,
  artistName,
  artworkUrl,
  genreName,
  rating,
  ratingCount,
}: ChartRowProps) {
  return (
    <Link
      href={`/app/${appId}`}
      className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-gray-800/50"
    >
      {/* Rank */}
      <div className="flex w-12 flex-shrink-0 items-center justify-center">
        <span
          className={`text-lg font-bold ${
            rank <= 3 ? "text-yellow-400" : "text-gray-400"
          }`}
        >
          {rank}
        </span>
      </div>

      {/* Rank Change */}
      <div className="flex w-12 flex-shrink-0 items-center justify-center">
        <RankChange change={rankChange} />
      </div>

      {/* App Icon */}
      <div className="flex-shrink-0">
        <img
          src={artworkUrl}
          alt={appName}
          className="h-14 w-14 rounded-xl shadow-lg"
          loading="lazy"
        />
      </div>

      {/* App Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-white group-hover:text-blue-400">
          {appName}
        </h3>
        <p className="truncate text-xs text-gray-400">{artistName}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
            {genreName}
          </span>
          {rating !== undefined && rating > 0 && (
            <span className="text-xs text-yellow-400">
              ★ {rating.toFixed(1)}
              {ratingCount !== undefined && (
                <span className="text-gray-500">
                  {" "}
                  ({ratingCount.toLocaleString()})
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
