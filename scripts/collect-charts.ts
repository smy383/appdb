/**
 * Daily chart collection script
 * Run via: npx tsx scripts/collect-charts.ts
 * Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const COUNTRIES = ["us", "kr"];
const CHART_TYPES = ["top-free", "top-paid"];

interface RssResult {
  id: string;
  name: string;
  artistName: string;
  artworkUrl100: string;
  url: string;
  genres: { genreId: string; name: string }[];
}

async function fetchRss(
  country: string,
  chartType: string
): Promise<RssResult[]> {
  const url = `https://rss.marketingtools.apple.com/api/v2/${country}/apps/${chartType}/100/apps.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RSS error: ${res.status}`);
  const data = await res.json();
  return data.feed.results;
}

async function getPreviousSnapshot(country: string, chartType: string) {
  const { data } = await supabase
    .from("chart_snapshots")
    .select("id")
    .eq("country", country)
    .eq("chart_type", chartType)
    .order("collected_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  const { data: entries } = await supabase
    .from("chart_entries")
    .select("app_id, rank")
    .eq("snapshot_id", data.id);

  const map = new Map<string, number>();
  entries?.forEach((e: { app_id: string; rank: number }) =>
    map.set(e.app_id, e.rank)
  );
  return map;
}

async function collectChart(country: string, chartType: string) {
  console.log(`Collecting ${chartType} for ${country}...`);

  const apps = await fetchRss(country, chartType);
  const prevRanks = await getPreviousSnapshot(country, chartType);

  // Upsert apps
  const appRows = apps.map((app) => ({
    id: app.id,
    name: app.name,
    artist_name: app.artistName,
    artwork_url: app.artworkUrl100,
    primary_genre_id: app.genres?.[0]?.genreId || null,
    primary_genre_name: app.genres?.[0]?.name || null,
    store_url: app.url,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from("apps")
    .upsert(appRows, { onConflict: "id" });

  if (upsertError) {
    console.error("App upsert error:", upsertError);
    return;
  }

  // Create snapshot
  const { data: snapshot, error: snapError } = await supabase
    .from("chart_snapshots")
    .insert({
      country,
      chart_type: chartType,
      collected_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (snapError || !snapshot) {
    console.error("Snapshot error:", snapError);
    return;
  }

  // Insert entries with rank change
  const entries = apps.map((app, i) => {
    const rank = i + 1;
    const prevRank = prevRanks?.get(app.id);
    const rankChange =
      prevRank !== undefined ? prevRank - rank : null;

    return {
      snapshot_id: snapshot.id,
      app_id: app.id,
      rank,
      rank_change: rankChange,
    };
  });

  const { error: entryError } = await supabase
    .from("chart_entries")
    .insert(entries);

  if (entryError) {
    console.error("Entry insert error:", entryError);
    return;
  }

  console.log(
    `✅ ${country}/${chartType}: ${apps.length} apps, snapshot ${snapshot.id}`
  );
}

async function main() {
  console.log("=== AppDB Chart Collection ===");
  console.log(`Time: ${new Date().toISOString()}`);

  for (const country of COUNTRIES) {
    for (const chartType of CHART_TYPES) {
      try {
        await collectChart(country, chartType);
      } catch (error) {
        console.error(`Error: ${country}/${chartType}:`, error);
      }
    }
  }

  console.log("=== Collection complete ===");
}

main().catch(console.error);
