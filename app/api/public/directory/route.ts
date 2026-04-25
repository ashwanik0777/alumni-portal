import { NextRequest, NextResponse } from "next/server";
import { getActiveDirectoryProfiles, getDirectoryFiltersFromSite } from "@/lib/site-content";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams;
    const batch = search.get("batch") || "All";
    const location = search.get("location") || "All";
    const domain = search.get("domain") || "All";

    let profiles = await getActiveDirectoryProfiles();

    if (batch !== "All") profiles = profiles.filter((p: Record<string, string>) => p.batch === batch);
    if (location !== "All") profiles = profiles.filter((p: Record<string, string>) => p.location === location);
    if (domain !== "All") profiles = profiles.filter((p: Record<string, string>) => p.expertise.includes(domain));

    const filters = await getDirectoryFiltersFromSite();

    return NextResponse.json({ profiles, filters }, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("Public directory GET error:", error);
    return NextResponse.json({ message: "Failed to fetch directory" }, { status: 500 });
  }
}
