import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Missing required parameter: name" },
      { status: 400 }
    );
  }

  try {
    const supabase = createServerSupabaseClient();

    // Get all apps by this developer
    const { data: apps, error: appsError } = await supabase
      .from("apps")
      .select(
        "id, name, artwork_url, primary_genre_name, average_rating, rating_count"
      )
      .eq("artist_name", name)
      .order("rating_count", { ascending: false });

    if (appsError) {
      console.error("Developer apps query error:", appsError);
      return NextResponse.json(
        { error: "Failed to fetch developer apps" },
        { status: 500 }
      );
    }

    if (!apps || apps.length === 0) {
      return NextResponse.json({
        developer: name,
        apps: [],
        totalApps: 0,
      });
    }

    // Get latest chart entries for these apps
    const appIds = apps.map((a) => a.id);

    const { data: chartData } = await supabase
      .from("daily_rankings")
      .select("app_id, rank, chart_type")
      .in("app_id", appIds)
      .order("date", { ascending: false })
      .limit(appIds.length * 2);

    // Build a map of app_id -> latest chart entry
    const chartMap = new Map<
      string,
      { rank: number; chart_type: string }
    >();
    if (chartData) {
      for (const entry of chartData) {
        if (!chartMap.has(entry.app_id)) {
          chartMap.set(entry.app_id, {
            rank: entry.rank,
            chart_type: entry.chart_type,
          });
        }
      }
    }

    const enrichedApps = apps.map((app) => {
      const chart = chartMap.get(app.id);
      return {
        id: app.id,
        name: app.name,
        artwork_url: app.artwork_url,
        primary_genre_name: app.primary_genre_name,
        average_rating: app.average_rating,
        rating_count: app.rating_count,
        rank: chart?.rank ?? null,
        chart_type: chart?.chart_type ?? null,
      };
    });

    return NextResponse.json(
      {
        developer: name,
        apps: enrichedApps,
        totalApps: apps.length,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Developer API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
