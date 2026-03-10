export interface AppInfo {
  id: string;
  name: string;
  artistName: string;
  bundleId?: string;
  artworkUrl: string;
  primaryGenreId: string;
  primaryGenreName: string;
  price: number;
  averageRating: number;
  ratingCount: number;
  description?: string;
  releaseDate: string;
  currentVersion: string;
  storeUrl: string;
  screenshotUrls?: string[];
  fileSizeBytes?: string;
  minimumOsVersion?: string;
  releaseNotes?: string;
}

export interface ChartEntry {
  rank: number;
  rankChange: number | null;
  app: AppInfo;
}

export interface ChartSnapshot {
  id: string;
  country: string;
  chartType: string;
  collectedAt: string;
  genreId: string | null;
  entries: ChartEntry[];
}

export type ChartType = "top-free" | "top-paid";
export type Country = "us" | "kr" | "jp" | "gb";

export interface RankHistoryEntry {
  date: string;
  rank: number;
}
