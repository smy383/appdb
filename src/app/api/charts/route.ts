import { NextRequest, NextResponse } from "next/server";
import { fetchTopChart } from "@/lib/apple/rss";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") || "us";
  const chartType = searchParams.get("chartType") || "top-free";

  try {
    const result = await fetchTopChart(country, chartType);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error("Chart fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch charts" },
      { status: 500 }
    );
  }
}
