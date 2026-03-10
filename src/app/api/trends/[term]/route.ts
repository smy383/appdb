import { NextRequest, NextResponse } from "next/server";
import { interestOverTime } from "google-trends-api";

interface TrendPoint {
  date: string;
  value: number;
}

interface TimelineEntry {
  time: string;
  formattedTime: string;
  value: number[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { term: string } }
) {
  try {
    const { searchParams } = request.nextUrl;
    const geo = searchParams.get("geo") || "";
    const days = Math.min(Number(searchParams.get("days")) || 90, 365);

    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - days);

    const keyword = decodeURIComponent(params.term);

    const rawResult = await interestOverTime({
      keyword,
      startTime,
      endTime,
      geo: geo || undefined,
    });

    const parsed = JSON.parse(rawResult);

    if (
      !parsed.default ||
      !parsed.default.timelineData ||
      parsed.default.timelineData.length === 0
    ) {
      return NextResponse.json(
        { trends: [], averageInterest: 0 },
        {
          headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          },
        }
      );
    }

    const trends: TrendPoint[] = parsed.default.timelineData.map(
      (entry: TimelineEntry) => ({
        date: new Date(Number(entry.time) * 1000).toISOString().split("T")[0],
        value: entry.value[0],
      })
    );

    const averageInterest =
      trends.length > 0
        ? Math.round(
            trends.reduce((sum, t) => sum + t.value, 0) / trends.length
          )
        : 0;

    return NextResponse.json(
      { trends, averageInterest },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Google Trends API error:", error);
    return NextResponse.json(
      { trends: [], averageInterest: 0 },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  }
}
