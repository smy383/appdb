import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);
  const country = searchParams.get("country") || "us";
  const chartType = searchParams.get("chartType") || "top-free";

  const clampedDays = Math.min(Math.max(days, 7), 90);

  try {
    const supabase = createServerSupabaseClient();
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - clampedDays);

    const { data, error } = await supabase
      .from("chart_entries")
      .select(
        `
        rank,
        chart_snapshots!inner (
          collected_at,
          country,
          chart_type
        )
      `
      )
      .eq("app_id", params.id)
      .eq("chart_snapshots.country", country)
      .eq("chart_snapshots.chart_type", chartType)
      .gte("chart_snapshots.collected_at", sinceDate.toISOString())
      .order("chart_snapshots(collected_at)", { ascending: true });

    if (error) {
      console.error("History query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch rank history" },
        { status: 500 }
      );
    }

    const history = (data || []).map((entry: Record<string, unknown>) => {
      const snapshot = entry.chart_snapshots as Record<string, unknown>;
      return {
        date: snapshot.collected_at as string,
        rank: entry.rank as number,
      };
    });

    return NextResponse.json(
      { history },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rank history" },
      { status: 500 }
    );
  }
}
