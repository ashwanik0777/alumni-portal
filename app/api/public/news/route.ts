import { NextResponse } from "next/server";
import { getActiveNews } from "@/lib/news-mentorship-data";

export async function GET() {
  try {
    const stories = await getActiveNews();
    return NextResponse.json({ stories }, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("Public news GET error:", error);
    return NextResponse.json({ message: "Failed to fetch news" }, { status: 500 });
  }
}
