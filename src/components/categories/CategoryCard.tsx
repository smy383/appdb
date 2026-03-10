import { Link } from "@/i18n/navigation";

interface TopApp {
  id: string;
  name: string;
  artistName: string;
  artworkUrl: string;
  rank: number;
  averageRating: number;
  ratingCount: number;
}

interface CategoryCardProps {
  genre: string;
  appCount: number;
  averageRating: number;
  topApps: TopApp[];
}

export default function CategoryCard({
  genre,
  appCount,
  averageRating,
  topApps,
}: CategoryCardProps) {
  return (
    <div className="rounded-xl bg-gray-900 p-5">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-base font-semibold text-white">{genre}</h3>
        <span className="rounded-lg bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-400">
          {appCount} apps
        </span>
      </div>

      {averageRating > 0 && (
        <div className="mb-4 flex items-center gap-1.5">
          <span className="text-sm text-yellow-400">★</span>
          <span className="text-sm text-gray-300">
            {averageRating.toFixed(1)} avg
          </span>
        </div>
      )}

      <div className="space-y-3">
        {topApps.map((app, index) => (
          <Link
            key={app.id}
            href={`/app/${app.id}`}
            className="group flex items-center gap-3"
          >
            <span className="w-5 text-center text-xs font-bold text-gray-500">
              {index + 1}
            </span>
            <img
              src={app.artworkUrl}
              alt={app.name}
              className="h-9 w-9 flex-shrink-0 rounded-lg"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-200 group-hover:text-blue-400">
                {app.name}
              </p>
              <p className="truncate text-xs text-gray-500">
                {app.artistName}
              </p>
            </div>
            <span className="text-xs text-gray-500">#{app.rank}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
