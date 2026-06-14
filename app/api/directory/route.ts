import { NextRequest, NextResponse } from "next/server";
import { getActiveDirectoryProfiles, getDirectoryFiltersFromSite } from "@/lib/site-content";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || "";
  const batch = request.nextUrl.searchParams.get("batch") || "All Batches";
  const domain = request.nextUrl.searchParams.get("domain") || "All";
  const excludeEmail = request.nextUrl.searchParams.get("exclude_email")?.trim().toLowerCase() || "";

  try {
    let profiles = await getActiveDirectoryProfiles();
    const filters = await getDirectoryFiltersFromSite();

    // Exclude the currently logged-in user from directory listing
    if (excludeEmail) {
      profiles = profiles.filter((p: any) => String(p.email || "").toLowerCase() !== excludeEmail);
    }

    // Apply search filtering
    if (search) {
      const q = search.toLowerCase();
      profiles = profiles.filter((p: any) =>
        String(p.name).toLowerCase().includes(q) || String(p.company).toLowerCase().includes(q) || String(p.role).toLowerCase().includes(q)
      );
    }
    if (batch !== "All Batches") {
      profiles = profiles.filter((p: any) => p.batch === batch);
    }
    if (domain !== "All") {
      profiles = profiles.filter((p: any) => String(p.expertise).toLowerCase().includes(domain.toLowerCase()));
    }

    return NextResponse.json({
      profiles: profiles.map((p: Record<string, unknown>) => ({
        id: p.slug || p.id,
        name: p.name,
        email: p.email || "",
        batch: p.batch,
        location: p.location,
        role: p.role,
        company: p.company,
        expertise: p.expertise,
      })),
      filters: {
        batches: ["All Batches", ...filters.batches],
        domains: ["All", ...filters.domains],
      },
    }, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("Directory GET error", error);
    return NextResponse.json({ message: "Failed to load directory." }, { status: 500 });
  }
}
