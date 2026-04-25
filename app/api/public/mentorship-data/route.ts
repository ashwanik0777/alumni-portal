import { NextResponse } from "next/server";
import { getActiveMentorshipTracks, getActiveMentorshipSteps, getMentorshipStats } from "@/lib/news-mentorship-data";

export async function GET() {
  try {
    const [tracks, steps, stats] = await Promise.all([
      getActiveMentorshipTracks(),
      getActiveMentorshipSteps(),
      getMentorshipStats(),
    ]);

    return NextResponse.json({ tracks, steps, stats }, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("Public mentorship-data GET error:", error);
    return NextResponse.json({ message: "Failed to fetch mentorship data" }, { status: 500 });
  }
}
