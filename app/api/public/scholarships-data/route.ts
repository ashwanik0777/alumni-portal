import { NextResponse } from "next/server";
import { getActiveScholarshipRecipients, getActiveScholarshipTestimonials } from "@/lib/site-content";

export async function GET() {
  try {
    const [recipients, testimonials] = await Promise.all([
      getActiveScholarshipRecipients(),
      getActiveScholarshipTestimonials(),
    ]);
    return NextResponse.json({ recipients, testimonials }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" } });
  } catch (error) {
    console.error("Public scholarships-data GET error:", error);
    return NextResponse.json({ message: "Failed to fetch scholarship data" }, { status: 500 });
  }
}
