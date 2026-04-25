import { NextResponse } from "next/server";
import { getActiveEventTimeline } from "@/lib/site-content";

export async function GET() {
  try {
    const timeline = await getActiveEventTimeline();
    return NextResponse.json({ timeline }, { headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Event timeline GET error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
