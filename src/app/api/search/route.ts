import { NextRequest, NextResponse } from "next/server";
import { searchApps } from "@/lib/apple/itunes";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("q") || "";
  const country = searchParams.get("country") || "us";

  if (!term || term.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const apps = await searchApps(term.trim(), country, 10);

    const results = apps.map((app) => ({
      id: app.id,
      name: app.name,
      artistName: app.artistName,
      artworkUrl: app.artworkUrl,
      primaryGenreName: app.primaryGenreName,
    }));

    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=1800, stale-while-revalidate=900",
        },
      }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
