import { NextResponse } from "next/server";
import { getActiveTeam } from "@/lib/site-content";

export async function GET() {
  try {
    const team = await getActiveTeam();
    return NextResponse.json({ team }, { headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Public team GET error:", error);
    return NextResponse.json({ message: "Failed to fetch team" }, { status: 500 });
  }
}
