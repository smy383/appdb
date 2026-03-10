import { AppInfo } from "@/types/app";

interface ItunesLookupResult {
  trackId: number;
  bundleId: string;
  trackName: string;
  artistName: string;
  price: number;
  version: string;
  averageUserRating: number;
  userRatingCount: number;
  primaryGenreName: string;
  primaryGenreId: number;
  releaseDate: string;
  currentVersionReleaseDate: string;
  releaseNotes?: string;
  description: string;
  screenshotUrls: string[];
  artworkUrl512: string;
  artworkUrl100: string;
  minimumOsVersion: string;
  fileSizeBytes: string;
  contentAdvisoryRating: string;
  trackViewUrl: string;
}

interface ItunesLookupResponse {
  resultCount: number;
  results: ItunesLookupResult[];
}

/**
 * Look up app details from iTunes API
 */
export async function lookupApp(appId: string): Promise<AppInfo | null> {
  const url = `https://itunes.apple.com/lookup?id=${appId}`;

  const response = await fetch(url, {
    next: { revalidate: 86400 }, // Cache 24 hours
  });

  if (!response.ok) return null;

  const data: ItunesLookupResponse = await response.json();
  if (data.resultCount === 0) return null;

  const result = data.results[0];

  return {
    id: String(result.trackId),
    name: result.trackName,
    artistName: result.artistName,
    bundleId: result.bundleId,
    artworkUrl: result.artworkUrl512 || result.artworkUrl100,
    primaryGenreId: String(result.primaryGenreId),
    primaryGenreName: result.primaryGenreName,
    price: result.price || 0,
    averageRating: result.averageUserRating || 0,
    ratingCount: result.userRatingCount || 0,
    description: result.description,
    releaseDate: result.releaseDate,
    currentVersion: result.version,
    storeUrl: result.trackViewUrl,
    screenshotUrls: result.screenshotUrls,
    fileSizeBytes: result.fileSizeBytes,
    minimumOsVersion: result.minimumOsVersion,
    releaseNotes: result.releaseNotes,
  };
}

/**
 * Search apps on iTunes
 */
export async function searchApps(
  term: string,
  country: string = "us",
  limit: number = 25
): Promise<AppInfo[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=software&entity=software&country=${country}&limit=${limit}`;

  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) return [];

  const data: ItunesLookupResponse = await response.json();

  return data.results.map((result) => ({
    id: String(result.trackId),
    name: result.trackName,
    artistName: result.artistName,
    bundleId: result.bundleId,
    artworkUrl: result.artworkUrl512 || result.artworkUrl100,
    primaryGenreId: String(result.primaryGenreId),
    primaryGenreName: result.primaryGenreName,
    price: result.price || 0,
    averageRating: result.averageUserRating || 0,
    ratingCount: result.userRatingCount || 0,
    description: result.description,
    releaseDate: result.releaseDate,
    currentVersion: result.version,
    storeUrl: result.trackViewUrl,
    screenshotUrls: result.screenshotUrls,
    fileSizeBytes: result.fileSizeBytes,
    minimumOsVersion: result.minimumOsVersion,
    releaseNotes: result.releaseNotes,
  }));
}
