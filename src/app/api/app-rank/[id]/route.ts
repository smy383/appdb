import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("daily_rankings")
      .select("country, rank, rank_change, chart_type")
      .eq("app_id", params.id)
      .order("rank", { ascending: true })
      .limit(10);

    if (error) {
      console.error("App rank query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch app rank" },
        { status: 500 }
      );
    }

    // Return the best (lowest) rank across all charts
    const bestRank = data && data.length > 0 ? data[0] : null;

    return NextResponse.json(
      {
        bestRank: bestRank
          ? {
              rank: bestRank.rank,
              country: bestRank.country,
              chartType: bestRank.chart_type,
              rankChange: bestRank.rank_change,
            }
          : null,
        allRanks: (data || []).map((r) => ({
          rank: r.rank,
          country: r.country,
          chartType: r.chart_type,
          rankChange: r.rank_change,
        })),
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("App rank fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch app rank" },
      { status: 500 }
    );
  }
}
