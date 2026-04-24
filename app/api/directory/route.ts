import { NextRequest, NextResponse } from "next/server";
import { getDirectoryProfiles, getDirectoryFilters } from "@/lib/directory-data";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || undefined;
  const batch = request.nextUrl.searchParams.get("batch") || undefined;
  const domain = request.nextUrl.searchParams.get("domain") || undefined;

  try {
    const [profiles, filters] = await Promise.all([
      getDirectoryProfiles(search, batch, domain),
      getDirectoryFilters()
    ]);
    
    return NextResponse.json({ profiles, filters }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" }
    });
  } catch (error) {
    console.error("Directory GET error", error);
    return NextResponse.json({ message: "Failed to load directory." }, { status: 500 });
  }
}
