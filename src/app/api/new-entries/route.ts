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
      .select("*")
      .eq("country", country)
      .eq("chart_type", chartType)
      .is("rank_change", null)
      .order("rank", { ascending: true })
      .limit(10);

    if (error) {
      console.error("New entries query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch new entries" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { entries: data || [] },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("New entries fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch new entries" },
      { status: 500 }
    );
  }
}
