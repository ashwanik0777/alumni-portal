import { NextResponse } from "next/server";
import { getActiveCareerTracks } from "@/lib/site-content";

export async function GET() {
  try {
    const tracks = await getActiveCareerTracks();
    return NextResponse.json({ tracks }, { headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Career tracks GET error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
