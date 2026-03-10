import { CHART_LIMIT } from "../constants";

export interface RssApp {
  id: string;
  name: string;
  artistName: string;
  artworkUrl: string;
  url: string;
  genres: { genreId: string; name: string }[];
}

interface RssFeedResult {
  id: string;
  name: string;
  artistName: string;
  artworkUrl100: string;
  url: string;
  genres: { genreId: string; name: string }[];
}

interface RssFeedResponse {
  feed: {
    title: string;
    results: RssFeedResult[];
    updated: string;
  };
}

/**
 * Fetch top chart from Apple RSS Marketing Tools API
 */
export async function fetchTopChart(
  country: string = "us",
  chartType: string = "top-free",
  limit: number = CHART_LIMIT
): Promise<{ apps: RssApp[]; updated: string }> {
  const clampedLimit = Math.min(limit, 100);
  const url = `https://rss.marketingtools.apple.com/api/v2/${country}/apps/${chartType}/${clampedLimit}/apps.json`;

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache 1 hour
  });

  if (!response.ok) {
    throw new Error(`RSS feed error: ${response.status} ${response.statusText}`);
  }

  const data: RssFeedResponse = await response.json();

  const apps: RssApp[] = data.feed.results.map((item) => ({
    id: item.id,
    name: item.name,
    artistName: item.artistName,
    artworkUrl: item.artworkUrl100,
    url: item.url,
    genres: item.genres || [],
  }));

  return { apps, updated: data.feed.updated };
}
