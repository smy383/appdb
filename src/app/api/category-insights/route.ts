import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") || "us";
  const chartType = searchParams.get("chartType") || "top-free";

  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("daily_rankings")
      .select(
        "app_id, name, artist_name, artwork_url, primary_genre_name, rank, average_rating, rating_count"
      )
      .eq("country", country)
      .eq("chart_type", chartType)
      .order("rank", { ascending: true });

    if (error) {
      console.error("Category insights query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch category insights" },
        { status: 500 }
      );
    }

    // Group by genre
    const genreMap: Record<
      string,
      {
        genre: string;
        count: number;
        totalRating: number;
        ratedCount: number;
        topApps: Array<{
          id: string;
          name: string;
          artistName: string;
          artworkUrl: string;
          rank: number;
          averageRating: number;
          ratingCount: number;
        }>;
      }
    > = {};

    for (const row of data || []) {
      const genre = (row.primary_genre_name as string) || "Unknown";
      if (!genreMap[genre]) {
        genreMap[genre] = {
          genre,
          count: 0,
          totalRating: 0,
          ratedCount: 0,
          topApps: [],
        };
      }
      const entry = genreMap[genre];
      entry.count++;

      const rating = row.average_rating as number;
      if (rating && rating > 0) {
        entry.totalRating += rating;
        entry.ratedCount++;
      }

      if (entry.topApps.length < 3) {
        entry.topApps.push({
          id: row.app_id as string,
          name: row.name as string,
          artistName: row.artist_name as string,
          artworkUrl: row.artwork_url as string,
          rank: row.rank as number,
          averageRating: rating || 0,
          ratingCount: (row.rating_count as number) || 0,
        });
      }
    }

    const categories = Object.values(genreMap)
      .map((entry) => ({
        genre: entry.genre,
        appCount: entry.count,
        averageRating:
          entry.ratedCount > 0
            ? Math.round((entry.totalRating / entry.ratedCount) * 10) / 10
            : 0,
        topApps: entry.topApps,
      }))
      .sort((a, b) => b.appCount - a.appCount);

    return NextResponse.json(
      { categories },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Category insights fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category insights" },
      { status: 500 }
    );
  }
}
