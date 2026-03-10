import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const chartType = searchParams.get("chartType") || "top-free";

  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("daily_rankings")
      .select("country, rank, rank_change")
      .eq("app_id", params.id)
      .eq("chart_type", chartType)
      .order("rank", { ascending: true });

    if (error) {
      console.error("Country ranks query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch country ranks" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ranks: data || [] },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Country ranks fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch country ranks" },
      { status: 500 }
    );
  }
}
