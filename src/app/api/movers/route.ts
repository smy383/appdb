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
      .not("rank_change", "is", null)
      .gt("rank_change", 0)
      .order("rank_change", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Movers query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch movers" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { movers: data || [] },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Movers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movers" },
      { status: 500 }
    );
  }
}
