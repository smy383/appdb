import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface PublisherApp {
  id: string;
  name: string;
  artwork_url: string;
}

interface PublisherEntry {
  name: string;
  appCount: number;
  apps: PublisherApp[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") || "us";

  try {
    const supabase = createServerSupabaseClient();

    // Get latest chart entries with app info from the daily_rankings view
    const { data: rankings, error } = await supabase
      .from("daily_rankings")
      .select("app_id, name, artist_name, artwork_url")
      .eq("country", country)
      .order("date", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Publishers query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch publishers" },
        { status: 500 }
      );
    }

    if (!rankings || rankings.length === 0) {
      return NextResponse.json({ publishers: [] });
    }

    // Deduplicate by app_id to count unique charted apps per publisher
    const seenApps = new Set<string>();
    const publisherMap = new Map<string, PublisherEntry>();

    for (const row of rankings) {
      if (seenApps.has(row.app_id)) continue;
      seenApps.add(row.app_id);

      const existing = publisherMap.get(row.artist_name);
      const publisher: PublisherEntry = existing || {
        name: row.artist_name,
        appCount: 0,
        apps: [] as PublisherApp[],
      };

      publisher.appCount++;
      if (publisher.apps.length < 3) {
        publisher.apps.push({
          id: row.app_id,
          name: row.name,
          artwork_url: row.artwork_url,
        });
      }

      publisherMap.set(row.artist_name, publisher);
    }

    // Sort by app count descending and take top 20
    const publishers = Array.from(publisherMap.values())
      .sort((a, b) => b.appCount - a.appCount)
      .slice(0, 20);

    return NextResponse.json(
      { publishers },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Publishers API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
