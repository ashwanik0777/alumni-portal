import { NextResponse } from "next/server";
import { listActiveScholarships } from "@/lib/admin-scholarships";

export async function GET() {
  try {
    const scholarships = await listActiveScholarships();
    
    // Also include public recipients and testimonials if we had them.
    // We can just return the static ones from the page for now or leave them.
    
    return NextResponse.json({
      scholarships,
    }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" }
    });
  } catch (error) {
    console.error("Failed to load scholarships", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
